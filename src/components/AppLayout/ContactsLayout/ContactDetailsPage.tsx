import * as React from 'react';
import {debounce} from 'lodash';
import {RouteComponentProps, RouteProps, withRouter} from 'react-router-dom';
import withData, {IResource} from 'src/components/withData/withData';
import {Action, compose} from 'redux';
import ContactService, {IContactSuccess} from 'src/services/ContactService';
import {IAddress} from 'src/models/IAddress';
import {AddressType, ContactType, IContact, IContactAddress} from 'src/models/IContact';
import {IPerson} from 'src/models/IPerson';
import {getSubmissionError, partialErrorHandler} from 'src/services/ReduxFormHelper';
import AddressService, {IAddressSuccess, IRawContactAddressSuccess} from 'src/services/AddressService';
import {IHttpError} from 'src/models/IHttpError';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {addContactToList, updateContactInList} from 'src/redux/contactsDucks';
import {ThunkDispatch} from 'redux-thunk';
import {connect} from 'react-redux';
import {ITagsSuccess} from 'src/services/TagService';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {IWebSocketNotification} from 'src/models/INotification';
import {IAppState} from 'src/redux';
import {IUserState} from 'src/redux/userDucks';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import ContactMenu from './ContactMenu';
import PageContent from 'src/components/Layout/PageContent';
import * as qs from 'qs';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import styled from 'styled-components';
import NotesAndMessagesService, {INotesSuccess} from 'src/services/NotesAndMessagesService';
import ContactMeetingForm, {IFormData} from './ContactMeetingForm';
import DateTransformer from 'src/transformers/DateTransformer';
import MeetingsSevice from 'src/services/MeetingsSevice';
import Company from '../../Company/Company';
import Person from '../../Person/Person';
import CompanyForm from './Company/CompanyForm';
import PersonForm from './Person/PersonForm';
import {ICompany} from 'src/models/ICompany';
import Typography from 'src/constants/Typography';
import {openModal} from 'src/redux/modalDucks';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import NoteBasedItemsList from 'src/components/Layout/NoteBasedItemsList';
import moment from 'moment';
import CompanyRightInfoBlock from './Company/CompanyRightInfoBlock';
import PersonRightInfoBlock from './Person/PersonRightInfoBlock';
import {getEcho} from 'src/utility/Echo';
import ScrollToComponent from 'src/components/AppLayout/ScrollToComponent';
import {INote} from 'src/models/INotesAndMessages';

interface IWithDataProps {
  contactNotes: IResource<INotesSuccess>;
  contact: IResource<IObjectEnvelope<Partial<IContact>>>;
  tags: IResource<ITagsSuccess>;
}

interface IConnectProps {
  user: IUserState;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IParams {
  id?: string;
  type?: string;
  category?: string;
}

interface IPartialUpdates {
  contact?: IContactSuccess | IHttpError;
  address?: IRawContactAddressSuccess | IHttpError;
  mailingAddress?: IRawContactAddressSuccess | IHttpError;
}

interface IState {
  note: string;
  meetingNote: string;
  loading: boolean;
  savingMeeting: boolean;
  updateByMe: boolean;
}

type IProps = RouteComponentProps<IParams> & IWithDataProps;

const EditorWrapper = styled.div`
  margin: 10px -30px 40px -30px;
  padding: 0 30px 40px 30px;
  overflow: hidden;
  position: relative;
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

const AvatarContainer = styled.div`
  margin-bottom: 80px;
`;

const SimilarContact = styled.div`
  padding: 0 0 10px 0;
  margin: 0 0 10px 0;
  border-bottom: 1px solid ${ColorPalette.gray2};
  cursor: pointer;

  :last-of-type {
    border: 0;
    margin: 0;
  }
`;

const NotesWrapper = styled.div`
  position: relative;
  margin: 0 -30px -30px;
  min-height: 100px;
  border-top: 1px solid ${ColorPalette.gray2};
`;

const RightMargin = styled.div`
  width: 300px;
  border-left: 1px solid ${ColorPalette.gray2};
  background: ${ColorPalette.gray1};
`;

class ContactDetailsPage extends ScrollToComponent<IProps & IConnectProps, IState> {
  public state = {
    note: '',
    meetingNote: '',
    loading: false,
    savingMeeting: false,
    updateByMe: false
  };

  private static personContactFields: any[] = ['first_name', 'last_name', 'job_title', 'direct_phone', 'mobile_phone'];
  private static companyContactFields: any[] = [
    'legal_name',
    'default_payment_terms_days',
    'abn',
    'website',
    'trading_name'
  ];
  private static commonContactFields: any[] = ['id', 'email', 'business_phone'];

  private newEntityPosted: boolean = false;

  public componentDidMount() {
    this.joinContactChannels();
    this.fetchContact(true);
    this.scrollToHighlightedItem(this.getHighlightedItemSelector());
  }

  public componentDidUpdate(prevProps: IProps) {
    const {id} = this.props.match.params;
    const {id: pId} = prevProps.match.params;

    if (id !== pId) {
      this.props.contact.reset();
      getEcho().leave(`contact-${pId}`);
      this.joinContactChannels();
      this.fetchContact(true);
    }

    if (this.notesCounter(this.props) !== this.notesCounter(prevProps)) {
      this.scrollToHighlightedItem(this.getHighlightedItemSelector());
    }
  }

  public componentWillUnmount() {
    const {id} = this.props.match.params;

    getEcho().leave(`contact-${id}`);
  }

  private notesCounter = (props: IProps) => {
    return props.contactNotes.data ? props.contactNotes.data.data.length : 0;
  };

  private joinContactChannels = () => {
    const {match, user: usr} = this.props;
    const {id} = match.params;

    getEcho()
      .private(`contact-${id}`)
      .listen('.contact.updated', (data: IWebSocketNotification) => {
        if (usr.me) {
          this.setState({
            updateByMe: usr.me.id === data.notification.sender!.id
          });
        }
        this.debouncedFetchContact(true);
      });
  };

  private loadContactTags = () => {
    const {match, tags} = this.props;

    return tags.fetch(match.params.id);
  };

  private fetchContact = async (reinitializeForm: boolean = false) => {
    const {contactNotes, match, contact} = this.props;
    if (match.params.id) {
      if (reinitializeForm) {
        this.loadContactTags();
        contactNotes.fetch(match.params.id);
        await contact.fetch(match.params.id);
        this.setState({updateByMe: false});
      }
    } else {
      const blankContact = {
        data: {
          contact_type: match.params.type as ContactType,
          default_payment_terms_days: 30,
          contact_category: {id: +match.params.category!},
          address: {type: AddressType.street},
          mailing_address: {type: AddressType.mailing}
        }
      };
      contact.init(blankContact as IContactSuccess);
      this.setState({updateByMe: false});
    }
  };

  private debouncedFetchContact = debounce((reinitializeForm: boolean = false) => {
    this.fetchContact(reinitializeForm);
  }, 500);

  private updateContact = (data: Partial<IContact>) => {
    this.newEntityPosted = false;
    return this.createOrUpdateContactAndAddresses(data)
      .then(this.handlePartialUpdates)
      .then(this.linkEntitiesToContact(data))
      .then(res => {
        if (res && res.data!.id && !this.props.match.params.id) {
          this.props.history.push(`/contacts/${this.props.match.params.category}/edit/${res.data.id}`);
        } else if (this.newEntityPosted) {
          this.fetchContact();
        }
      });
  };

  private needToUpdateContact = (data: Partial<IContact>) => {
    const oldData = this.props.contact.data!.data;
    const contactFields =
      data.contact_type === ContactType.person
        ? ContactDetailsPage.commonContactFields.concat(ContactDetailsPage.personContactFields)
        : ContactDetailsPage.commonContactFields.concat(ContactDetailsPage.companyContactFields);
    return !!contactFields.find(key => data[key] !== oldData[key]);
  };

  private needToUpdateEntity = (data: Partial<IContact>, name: string) => {
    const oldData = this.props.contact.data!.data;
    return !!(
      data[name] &&
      oldData[name] &&
      Object.keys(data[name]).find(key => data[name][key] !== oldData[name][key])
    );
  };

  private createOrUpdateContactAndAddresses = (data: Partial<IContact>): Promise<IPartialUpdates> => {
    const updatePromises = [];
    const setContactPromise = this.needToUpdateContact(data);
    const setAddressPromise = this.needToUpdateEntity(data, 'address');
    const setMailingPromise = this.needToUpdateEntity(data, 'mailing_address');

    if (setContactPromise) {
      updatePromises.push(this.createOrUpdateContact(data).catch(partialErrorHandler));
    }
    if (setAddressPromise) {
      updatePromises.push(this.createOrUpdateAddress(data.address).catch(partialErrorHandler));
    }
    if (setMailingPromise) {
      updatePromises.push(this.createOrUpdateAddress(data.mailing_address).catch(partialErrorHandler));
    }

    return Promise.all(updatePromises as any).then((res: any) => {
      const contact = setContactPromise ? res.shift() : undefined;
      const address = setAddressPromise ? res.shift() : undefined;
      const mailingAddress = setMailingPromise ? res.shift() : undefined;
      return {contact, address, mailingAddress};
    });
  };

  private updateWithoutFetch = (
    contact?: IContactSuccess,
    address?: IRawContactAddressSuccess,
    mailingAddress?: IRawContactAddressSuccess
  ) => {
    const contactData: Partial<IContact> | undefined = contact && contact.data;
    const addressData: IAddress | undefined = address && AddressService.expandAddress(address);
    const mailingAddressData: IAddress | undefined = mailingAddress && AddressService.expandAddress(mailingAddress);
    const updatedData = contactData || {};

    if (addressData) {
      updatedData.address = {
        ...addressData,
        type: this.props.contact.data!.data.address!.type
      };
    }
    if (mailingAddressData) {
      updatedData.mailing_address = {
        ...mailingAddressData,
        type: this.props.contact.data!.data.mailing_address!.type
      };
    }
    this.props.contact.init({
      data: {
        ...this.props.contact.data!.data,
        ...updatedData
      }
    });
  };

  private createOrUpdateContact = (data: Partial<IContact>) => {
    const contactId = this.props.contact.data!.data.id;
    const promise = contactId ? ContactService.update(contactId, data) : this.createContact(data);
    return promise.then((res: IContactSuccess) => {
      const action = contactId ? updateContactInList(res.data.id, res.data) : addContactToList(res.data);
      this.props.dispatch(action);
      this.newEntityPosted = this.newEntityPosted || !contactId;
      return res;
    });
  };

  private createContact = (data: Partial<IContact>) => {
    const postData = {
      ...data,
      contact_category_id: data.contact_category && data.contact_category.id
    };
    return data.contact_type === ContactType.company
      ? ContactService.createCompany(postData)
      : ContactService.createPerson(postData);
  };

  private createOrUpdateAddress = (
    address?: IContactAddress
  ): Promise<IAddressSuccess | IRawContactAddressSuccess | void> => {
    if (!address || (!address.suburb && !address.address_line_1)) {
      return Promise.resolve();
    }

    const promise = address.id ? AddressService.update(address.id, address) : AddressService.create(address);
    this.newEntityPosted = this.newEntityPosted || !address.id;
    return promise;
  };

  private handlePartialUpdates = (res: IPartialUpdates): Promise<any> => {
    let addressError;
    let mailingAddressError;
    let contactError;
    let compoundError;

    const errorMarker = 'error_code';
    const {address, mailingAddress, contact} = res;

    if (address && address.hasOwnProperty(errorMarker)) {
      addressError = address as IHttpError;
    }
    if (mailingAddress && mailingAddress.hasOwnProperty(errorMarker)) {
      mailingAddressError = mailingAddress as IHttpError;
    }
    if (contact && contact.hasOwnProperty(errorMarker)) {
      contactError = contact as IHttpError;
    }

    if (addressError || mailingAddressError || contactError) {
      compoundError = contactError ? contactError.fields : {};
      if (addressError) {
        compoundError.address = addressError.fields;
      }
      if (mailingAddressError) {
        compoundError.mailing_address = mailingAddressError.fields;
      }
      return getSubmissionError(compoundError);
    }

    if (!this.newEntityPosted) {
      this.updateWithoutFetch(
        contact as IContactSuccess,
        address as IRawContactAddressSuccess,
        mailingAddress as IRawContactAddressSuccess
      );
    }

    return Promise.resolve(res);
  };

  private linkEntitiesToContact = (data: Partial<IContact>) => (res: IPartialUpdates) => {
    const contact = this.props.contact.data!.data;
    const hasAddress = !!contact.address!.id;
    const hasMailingAddress = !!contact.mailing_address!.id;
    const wasChangedCompany = this.wasChangedCompany(data);
    const contactSuccess = res.contact as IContactSuccess;
    const addressSuccess = res.address as IAddressSuccess;
    const mailingAddressSuccess = res.mailingAddress as IAddressSuccess;
    const contactId = contactSuccess ? contactSuccess!.data.id : contact!.id;
    const linkPromises = [];
    if (contactId && !hasAddress && addressSuccess) {
      linkPromises.push(ContactService.addContactAddress(contactId, addressSuccess.data, AddressType.street));
    }
    if (contactId && !hasMailingAddress && mailingAddressSuccess) {
      linkPromises.push(ContactService.addContactAddress(contactId, mailingAddressSuccess.data, AddressType.mailing));
    }
    if (contactId && wasChangedCompany) {
      const company = (data as IPerson).parent_company!;
      linkPromises.push(
        ContactService.linkPersonToCompany(contactId, company).then(() => {
          this.props.contact.init({data: {...this.props.contact.data!.data, parent_company: company}});
        })
      );
    }
    return Promise.all(linkPromises).then(() => contactSuccess);
  };

  private wasChangedCompany = (data: Partial<IContact>): boolean | undefined => {
    if (data.contact_type !== ContactType.person) {
      return;
    }
    const actualContactData: IPerson = data as IPerson;
    const oldContactData: IPerson = this.props.contact.data!.data as IPerson;

    if (!actualContactData.parent_company) {
      return;
    }

    return actualContactData.parent_company.id !== (oldContactData.parent_company && oldContactData.parent_company.id);
  };

  private redirectToNotes = () => {
    this.props.history.push(
      `/contacts/${this.props.match.params.category}/edit/${this.props.match.params.id}?note=true`
    );
  };

  private redirectToMeetings = () => {
    this.props.history.push(
      `/contacts/${this.props.match.params.category}/edit/${this.props.match.params.id}?meeting=true`
    );
  };

  private isNoteEditorVisible = () => {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    return params.note === 'true';
  };

  private isMeetingEditorVisible = () => {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    return params.meeting === 'true';
  };

  private getHighlightedItemSelector = () => {
    let selector;
    const highlightedItem = this.getHighlightedItem();

    if (highlightedItem.note) {
      selector = `note-${highlightedItem.note}`;
    }

    return selector;
  };

  private saveNoteDraft = async (note: INote) => {
    const {
      contact: {data},
      contactNotes,
      match
    } = this.props;

    if (data && data.data.id) {
      await NotesAndMessagesService.addNoteToContact(note.id, data.data.id);
      await contactNotes.fetch(data.data.id);
      this.props.history.replace(`/contacts/${match.params.category}/edit/${match.params.id}`);
    }
  };

  private onSubmitMeeting = async (data: IFormData) => {
    const {
      contactNotes,
      match,
      contact: {data: dt}
    } = this.props;
    const contact = dt!.data;

    this.setState({savingMeeting: true});

    try {
      const newMeeting = await MeetingsSevice.createMeeting({
        title: data.note,
        scheduled_at: DateTransformer.dehydrateDateTime(data.meeting_date.utc()) || '---'
      });

      if (contact.id) {
        const {data: savedNote} = await NotesAndMessagesService.postNote(data.note);

        await NotesAndMessagesService.addNoteToContact(savedNote.id, contact.id, {
          meeting_id: newMeeting.data.id
        });

        this.setState({savingMeeting: false});
        this.props.history.replace(`/contacts/${match.params.category}/edit/${match.params.id}`);

        await contactNotes.fetch(contact.id);
      }
    } catch (er) {
      this.setState({savingMeeting: false});
    }
  };

  private beforeSubmit = async (data: Partial<ICompany>) => {
    const isNew = this.props.match.url.includes('/create/');
    const categoryId = +(this.props.match.params.category || '');
    const {dispatch} = this.props;

    if (!isNew) {
      return this.updateContact(data);
    }

    this.setState({loading: true});

    const similar = await ContactService.getContacts({
      contact_category_id: categoryId,
      contact_type: data.contact_type,
      term: `${data.legal_name}`
    });
    let cond;

    if (similar.data.length > 0) {
      cond = await dispatch(
        openModal(
          'Confirm',
          'Do you really want to create new contact?',
          <>
            <ColoredDiv margin="0 0 20px 0">Similar companies: {similar.data.length}</ColoredDiv>
            {similar.data.map((contact: any) => (
              <SimilarContact
                key={contact.id}
                onClick={() => {
                  window.open(`/contacts/${categoryId}/edit/${contact.id}`);
                }}
              >
                <ColoredDiv color={ColorPalette.black0} weight={Typography.weight.bold}>
                  ;
                </ColoredDiv>
                <ColoredDiv color={ColorPalette.gray5}>
                  {contact.addresses[0] && contact.addresses[0].full_address}
                </ColoredDiv>
                <ColoredDiv color={ColorPalette.gray5}>{contact.website}</ColoredDiv>
              </SimilarContact>
            ))}
          </>
        )
      );
    } else {
      cond = true;
    }

    if (cond) {
      return this.updateContact(data).then(() => {
        this.setState({loading: false});
      });
    }

    this.setState({loading: false});
    return Promise.resolve(true);
  };

  private getSortedNotes = () => {
    const {contactNotes} = this.props;

    if (contactNotes.data) {
      return contactNotes.data.data.sort((a: any, b: any) => moment(b.created_at || '').diff(a.created_at || ''));
    }

    return [];
  };

  private loadContactNotes = () => {
    const {contactNotes} = this.props;
    contactNotes.fetch(this.props.match.params.id);
  };

  private revertBackToNotes = () => {
    this.props.history.push(this.props.location.pathname);
  };

  public render() {
    const {contact, tags, contactNotes, user, match} = this.props;
    const {data, loading: loadingContact} = contact;
    const {updateByMe, savingMeeting} = this.state;

    const pageProps = {
      tags: tags.data!.data,
      onSubmit: this.updateContact,
      onUpdate: this.debouncedFetchContact,
      loading: loadingContact,
      redirectToNotes: this.redirectToNotes,
      redirectToMeetings: this.redirectToMeetings,
      categoryId: +(match.params.category || ''),
      isNew: this.props.match.url.includes('/create/')
    };

    if (data) {
      return (
        <UserContext.Consumer>
          {context => {
            const isDisabled = !context.has(pageProps.isNew ? Permission.CONTACTS_CREATE : Permission.CONTACTS_UPDATE);
            const isCreateMeetingEnabled = context.has(Permission.MEETINGS_CREATE);

            return (
              <div className="d-flex flex-row">
                <div className="flex-grow-1">
                  {data.data.id && (
                    <ContactMenu
                      contact={data.data}
                      contactTags={tags.data ? tags.data.data : []}
                      onNoteAdd={this.redirectToNotes}
                      onMeetingAdd={this.redirectToMeetings}
                      newContact={pageProps.loading && !updateByMe}
                      onUpdate={this.debouncedFetchContact}
                      onTagsUpdate={this.loadContactTags}
                    />
                  )}
                  <PageContent>
                    <div style={{position: 'relative'}}>
                      {pageProps.loading && !updateByMe && <BlockLoading size={40} color={ColorPalette.white} />}
                      {this.isNoteEditorVisible() && (
                        <EditorWrapper>
                          <NoteComponent
                            afterSave={this.saveNoteDraft}
                            color={ColorPalette.orange0}
                            disableTemplatesControl={true}
                            onCancel={this.revertBackToNotes}
                          />
                        </EditorWrapper>
                      )}
                      {this.isMeetingEditorVisible() && isCreateMeetingEnabled && (
                        <EditorWrapper>
                          {savingMeeting && <BlockLoading size={40} color={ColorPalette.white} />}
                          <ContactMeetingForm onSubmit={this.onSubmitMeeting} />
                        </EditorWrapper>
                      )}
                      <AvatarContainer>
                        {(() => {
                          if (data) {
                            if (data.data.contact_type === ContactType.company) {
                              if (data.data.id) {
                                return (
                                  <Company
                                    tags={pageProps.tags}
                                    company={data.data}
                                    onUpdate={this.debouncedFetchContact}
                                    disabled={isDisabled}
                                    loadTags={this.loadContactTags}
                                  />
                                );
                              } else {
                                return <h2>New company</h2>;
                              }
                            } else {
                              if (data.data.id) {
                                return (
                                  <Person
                                    person={data.data}
                                    tags={tags.data!.data}
                                    onUpdate={this.debouncedFetchContact}
                                    disabled={isDisabled}
                                    loadTags={this.loadContactTags}
                                  />
                                );
                              } else {
                                return <h2>New contact</h2>;
                              }
                            }
                          }
                          return null;
                        })()}
                      </AvatarContainer>
                      {(() => {
                        if (data) {
                          if (data.data.contact_type === ContactType.company) {
                            return (
                              <CompanyForm
                                company={data.data}
                                initialValues={data.data}
                                onSubmit={this.beforeSubmit}
                                disabled={isDisabled}
                              />
                            );
                          } else {
                            return (
                              <PersonForm
                                person={data.data}
                                initialValues={data.data}
                                onSubmit={this.beforeSubmit}
                                contactCategory={pageProps.categoryId}
                                disabled={isDisabled}
                              />
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                    {contactNotes.data &&
                      (contactNotes.loading || (contactNotes.data.data && contactNotes.data.data.length > 0)) && (
                        <NotesWrapper>
                          <NoteBasedItemsList
                            notes={this.getSortedNotes()}
                            user={user}
                            loading={contactNotes.loading}
                            highlightedItemId={this.getHighlightedItem().itemId}
                            afterEditSuccess={this.loadContactNotes}
                          />
                        </NotesWrapper>
                      )}
                  </PageContent>
                </div>
                <RightMargin className="flex-shrink-0">
                  {(() => {
                    if (data) {
                      if (data.data.contact_type === ContactType.company) {
                        return (
                          <CompanyRightInfoBlock
                            company={data.data}
                            onLoadTags={this.loadContactTags}
                            contactLoading={pageProps.loading && !updateByMe}
                            receivables={{}}
                            referrals={[]}
                          />
                        );
                      } else {
                        return (
                          <PersonRightInfoBlock
                            person={data.data}
                            onLoadTags={this.loadContactTags}
                            contactLoading={pageProps.loading && !updateByMe}
                            receivables={{}}
                            referrals={[]}
                          />
                        );
                      }
                    }
                    return null;
                  })()}
                </RightMargin>
              </div>
            );
          }}
        </UserContext.Consumer>
      );
    } else {
      return (
        <div className="d-flex h-100" style={{position: 'relative'}}>
          <BlockLoading size={40} color={ColorPalette.white} />
        </div>
      );
    }
  }
}

const mapStateToProps = (state: IAppState) => ({
  user: state.user
});

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  connect(mapStateToProps),
  withData({
    contact: {
      fetch: ContactService.findById
    },
    tags: {
      fetch: ContactService.getTags,
      initialData: {
        data: []
      }
    },
    contactNotes: {
      fetch: NotesAndMessagesService.getContactNotesAndMeetings,
      initialData: {data: []}
    }
  })
)(ContactDetailsPage);
