import * as React from 'react';
import PageMenu, {ActionIcon} from 'src/components/Layout/PageMenu';
import TagsControl from 'src/components/Layout/MenuItems/TagsControl';
import Icon, {IconName} from 'src/components/Icon/Icon';
import {ITag} from 'src/models/ITag';
import ContactService from 'src/services/ContactService';
import {ICompany} from 'src/models/ICompany';
import {IPerson} from 'src/models/IPerson';
import StatusControl from 'src/components/Layout/MenuItems/StatusControl';
import {IResource} from 'src/components/withData/withData';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {ContactStatuseNames, ContactStatuses, IContactStatus} from 'src/models/IContactStatus';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {withRouter} from 'react-router';
import {RouteComponentProps} from 'react-router-dom';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {addContactToList, removeContactFromList} from 'src/redux/contactsDucks';
import {AddressType, ContactType} from 'src/models/IContact';
import AddressService, {IAddressSuccess} from 'src/services/AddressService';
import {ITagsSuccess} from 'src/services/TagService';
import ReactTooltip from 'react-tooltip';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import Cover from 'src/components/Layout/Common/Cover';
import OnlineUsers from 'src/components/OnlineUsers/OnlineUsers';
import {openModal} from 'src/redux/modalDucks';
import {IAppState} from 'src/redux';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';
import {delay} from 'q';
import Notify, {NotifyType} from 'src/utility/Notify';

interface IProps {
  onNoteAdd: () => void;
  onMeetingAdd: () => void;
  contact: Partial<ICompany> | Partial<IPerson>;
  onUpdate: () => any;
  newContact?: boolean;
  onTagsUpdate: () => any;
  contactTags: ITag[];
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IConnectProps {
  statuses: IResource<ContactStatuses[]>;
}

interface IParams {
  id?: string;
  type?: string;
  category?: string;
}

interface IState {
  lastStatus?: string;
}

class ContactMenu extends React.PureComponent<RouteComponentProps<IParams> & IProps & IConnectProps, IState> {
  public state = {
    lastStatus: undefined
  };

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  private onTagClick = async (tag: ITag) => {
    if (this.props.contact.id) {
      await ContactService.assignTag(this.props.contact.id, tag.id);
      await this.props.onTagsUpdate();
    }
  };

  private onStatusClick = async (status: IContactStatus) => {
    const {contact, onUpdate} = this.props;

    if (contact.id) {
      try {
        await ContactService.changeContactStatus(contact.id, status.type as ContactStatuses);
        await delay(1000);
        this.setState({lastStatus: status.name as string});
        onUpdate();
        EventBus.emit(EventBusEventName.ContactChangedStatus);
      } catch (e) {
        Notify(NotifyType.Danger, "This status can't be applied");
      }
    }
  };

  private typeCheckers = {
    instanceOfPerson(object: any): object is IPerson {
      return object.hasOwnProperty('first_name') && object.hasOwnProperty('last_name');
    },
    instanceOfCompany(object: any): object is ICompany {
      return object.hasOwnProperty('abn') && object.hasOwnProperty('legal_name');
    }
  };

  private duplicateContact = () => {
    if (this.props.contact) {
      const request: Promise<IObjectEnvelope<IPerson | ICompany>> =
        this.props.contact.contact_type === ContactType.person
          ? ContactService.createPerson(this.props.contact)
          : ContactService.createCompany(this.props.contact);

      return request
        .then(response => {
          const {data} = response;
          const promises: Array<Promise<IAddressSuccess | ITagsSuccess | void>> = [];

          if (this.props.contact.address && this.props.contact.address.id) {
            promises.push(
              AddressService.create(this.props.contact.address).then(resp => {
                return ContactService.addContactAddress(data.id, resp.data, AddressType.street);
              })
            );
          }
          if (this.props.contact.mailing_address && this.props.contact.mailing_address.id) {
            promises.push(
              AddressService.create(this.props.contact.mailing_address).then(resp => {
                return ContactService.addContactAddress(data.id, resp.data, AddressType.mailing);
              })
            );
          }
          if (this.typeCheckers.instanceOfPerson(this.props.contact)) {
            if (this.props.contact.parent_company && this.props.contact.contact_type === ContactType.person) {
              promises.push(ContactService.linkPersonToCompany(data.id, this.props.contact.parent_company));
            }
          }
          if (this.props.contact.tags) {
            this.props.contact.tags.forEach(tag => {
              promises.push(ContactService.assignTag(data.id, tag.id));
            });
          }

          return Promise.all(promises).then(() => {
            this.props.dispatch(addContactToList(response.data));
            return {data};
          });
        })
        .then(response => {
          const {data} = response;

          if (+(this.props.match.params.category || '') === data.contact_category.id) {
            this.props.history.push(`/contacts/${this.props.match.params.category}/edit/${data.id}`);
          }
        });
    } else {
      return Promise.reject(true);
    }
  };

  private deleteContact = async () => {
    const {contact, dispatch} = this.props;

    if (contact.id) {
      const res = await dispatch(openModal('Confirm', `Delete contact?`));

      if (res) {
        return ContactService.deleteContact(+contact.id).then(() => {
          this.props.dispatch(removeContactFromList(contact.id!));

          if (this.props.match.params.id) {
            this.props.history.replace(`/contacts/${this.props.match.params.category}`);
          }
        });
      } else {
        return Promise.resolve();
      }
    }

    return Promise.resolve();
  };

  private getDropdownMenuItems = (context: IUserContext): IMenuItem[] => {
    return [
      {
        name: 'Duplicate',
        visible: context.has(Permission.CONTACTS_CREATE),
        onClick: this.duplicateContact
      },
      {
        type: 'divider',
        visible: context.has(Permission.CONTACTS_CREATE) && context.has(Permission.CONTACTS_DELETE)
      },
      {
        name: 'Delete',
        visible: context.has(Permission.CONTACTS_DELETE),
        onClick: this.deleteContact
      }
    ].filter(item => item.visible) as IMenuItem[];
  };

  public render() {
    const statuses: IContactStatus[] = (this.props.statuses.data || []).map((el: ContactStatuses, index) => {
      return {
        id: index,
        name: ContactStatuseNames[el],
        type: el
      };
    });
    const {newContact, contact, contactTags} = this.props;

    return (
      <UserContext.Consumer>
        {context => {
          const otherActions = this.getDropdownMenuItems(context);
          return (
            <>
              <ReactTooltip className="overlapping" id="contact-menu-tooltip" effect="solid" />
              <PageMenu className="d-flex align-items-center justify-content-between">
                {(!contact || newContact) && <Cover opacity={0.9} />}
                <div>
                  <StatusControl
                    loading={this.props.statuses.loading}
                    statuses={statuses}
                    type="contact"
                    onStatusClick={this.onStatusClick}
                    selectedStatus={
                      this.state.lastStatus ||
                      (contact.contact_status ? ContactStatuseNames[contact.contact_status.status] : undefined)
                    }
                    disabled={!context.has(Permission.CONTACTS_UPDATE)}
                  />
                  {context.has(Permission.CONTACTS_UPDATE) && context.has(Permission.NOTES_CREATE) && (
                    <ActionIcon data-tip="Add note" data-for="contact-menu-tooltip">
                      <Icon name={IconName.AddNote} onClick={this.props.onNoteAdd} />
                    </ActionIcon>
                  )}
                  {context.has(Permission.MEETINGS_CREATE) && (
                    <ActionIcon data-tip="Add meeting" data-for="contact-menu-tooltip">
                      <Icon name={IconName.Calendar} onClick={this.props.onMeetingAdd} />
                    </ActionIcon>
                  )}
                  {context.has(Permission.TAGS_VIEW) && context.has(Permission.CONTACTS_UPDATE) && (
                    <TagsControl type="contact" filter={contactTags} onTagClick={this.onTagClick} />
                  )}
                  {otherActions.length > 0 && <DropdownMenuControl items={otherActions} />}
                </div>
                <OnlineUsers channel={`online-contact-${contact.id}`} />
              </PageMenu>
            </>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  statuses: state.contactStatuses.statuses
});

export default compose<React.ComponentClass<IProps>>(
  withRouter,
  connect(mapStateToProps)
)(ContactMenu);
