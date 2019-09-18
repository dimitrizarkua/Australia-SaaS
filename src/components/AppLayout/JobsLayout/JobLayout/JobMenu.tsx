import * as React from 'react';
import PageMenu, {ActionIcon} from 'src/components/Layout/PageMenu';
import Icon, {IconName} from 'src/components/Icon/Icon';
import TagsControl from 'src/components/Layout/MenuItems/TagsControl';
import UsersControl from 'src/components/Layout/MenuItems/UsersControl';
import {ITag} from 'src/models/ITag';
import {IContactAssignment, IJob, IJobNextStatus, JobStatuses} from 'src/models/IJob';
import JobService from 'src/services/JobService';
import withData, {IResource} from 'src/components/withData/withData';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import ModalCreateRecurringJob from 'src/components/Modal/Jobs/ModalCreateRecurringJob';
import StatusControl, {IStatusMenuItem} from 'src/components/Layout/MenuItems/StatusControl';
import {RouteComponentProps, withRouter} from 'react-router';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {openModal} from 'src/redux/modalDucks';
import {ThunkDispatch} from 'redux-thunk';
import ReactTooltip from 'react-tooltip';
import {IUserTeamSimple} from 'src/models/ITeam';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import OnlineUsers from 'src/components/OnlineUsers/OnlineUsers';
import {assignJobTag} from 'src/redux/currentJob/currentJobDucks';
import {isContactsVisible} from 'src/components/AppLayout/JobsLayout/JobLayout/JobLayout';
import {IReturnType} from 'src/redux/reduxWrap';
import InvoicesService from 'src/services/InvoicesService';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import moment from 'moment';
import {IInvoiceListItem} from 'src/models/FinanceModels/IInvoices';
import {FinanceEntityVirtualStatus} from 'src/constants/FinanceEntityStatus';
import Notify, {NotifyType} from 'src/utility/Notify';
import {selectCurrentUserId} from 'src/redux/userDucks';

interface IProps {
  onNoteAdd: () => void;
  onEmailReply: () => void;
  onContactsToggle: () => void;
  onUpdate: () => void;
  job: IJob;
  jobInvoices: IInvoiceListItem[] | null;
}

interface IWithDataProps {
  nextStatuses: IResource<IObjectEnvelope<string[]>>;
}

interface IConnectProps {
  userId: null | number;
  currentJobContacts: IReturnType<IContactAssignment[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IParams {
  id: string;
}

class JobMenu extends React.PureComponent<RouteComponentProps<IParams> & IProps & IWithDataProps & IConnectProps> {
  public state = {
    stateCreateRecurringJobModal: false
  };

  public componentDidMount() {
    const {job, nextStatuses} = this.props;
    nextStatuses.fetch(job.id);
  }

  public componentDidUpdate(prevProps: IProps) {
    ReactTooltip.rebuild();
  }

  private onUserClick = (userOrTeam: IUserTeamSimple) => {
    return JobService.assignUserOrTeam(this.props.job.id, userOrTeam.id, userOrTeam.type).then(this.props.onUpdate);
  };

  private onSelectedUserClick = (userOrTeam: IUserTeamSimple) => {
    return JobService.removeUserOrTeam(this.props.job.id, userOrTeam.id, userOrTeam.type).then(this.props.onUpdate);
  };

  private onTagClick = async (tag: ITag) => {
    await this.props.dispatch(assignJobTag(this.props.job.id, tag));
  };

  private onStatusClick = async (status: IJobNextStatus) => {
    try {
      await JobService.applyNewJobStatus(this.props.job.id, {
        status: status.name,
        note: '---'
      });
      this.props.nextStatuses.fetch(this.props.job.id);
      this.props.onUpdate();
    } catch (e) {
      Notify(NotifyType.Danger, "This status can't be applied");
    }
  };

  private getNextStatuses(): IStatusMenuItem[] {
    const {nextStatuses, jobInvoices} = this.props;

    if (!nextStatuses || !nextStatuses.data) {
      return [];
    } else {
      const hasUnpaidInvoices =
        !jobInvoices ||
        (!!jobInvoices &&
          jobInvoices.filter(
            (invoice: IInvoiceListItem) => invoice.virtual_status === FinanceEntityVirtualStatus.unpaid
          ).length > 0);
      const statuses = nextStatuses.data.data.map(
        (el, index) =>
          ({
            id: index,
            name: el,
            onClick:
              hasUnpaidInvoices && [JobStatuses.Cancelled, JobStatuses.Closed].includes(el as JobStatuses)
                ? () => Notify(NotifyType.Warning, 'There are outstanding invoices that have not been paid.')
                : undefined
          } as IStatusMenuItem)
      );

      return statuses;
    }
  }

  private openModal = (type: string) => {
    this.setState({[type]: true});
  };

  private closeModal = (type: string) => {
    this.setState({[type]: false});
  };

  private deleteJob = async () => {
    const {history, job, dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete job ${JobService.getJobName(job)}?`));

    if (!res) {
      return Promise.reject(true);
    }
    return JobService.removeJob(job.id).then(() => {
      if (window.location.pathname.startsWith(`/job/${job.id}`)) {
        history.replace('/jobs/inbox');
      }
    });
  };

  private followJob = async () => {
    const {job, onUpdate} = this.props;

    const res = await JobService.followJob(job.id);
    onUpdate();
    return res;
  };

  private unfollowJob = async () => {
    const {job, onUpdate} = this.props;

    const res = await JobService.unfollowJob(job.id);
    onUpdate();
    return res;
  };

  private canICreateRecurringJob = () => {
    const {job} = this.props;

    return job.job_service_id && job.insurer_id && job.site_address_id && job.owner_location_id;
  };

  private getRestMenuItems(context: IUserContext): IMenuItem[] {
    const {
      job,
      userId,
      location,
      currentJobContacts: {data},
      onContactsToggle
    } = this.props;
    const isFollowing = (job.followers || []).map(el => el.id).includes(userId!);
    const jobHasInvoiceToContact = !!(data && data.find((el: IContactAssignment) => el.invoice_to));

    return [
      {
        name: isContactsVisible(location) ? 'Hide Contacts' : 'Assign contacts',
        onClick: onContactsToggle,
        disabled: job.edit_forbidden || !context.has(Permission.JOBS_MANAGE_CONTACTS)
      },
      {
        name: isFollowing ? 'Unfollow job' : 'Follow job',
        onClick: isFollowing ? this.unfollowJob : this.followJob,
        disabled: job.edit_forbidden || !context.has(Permission.JOBS_VIEW) || !userId
      },
      {
        name: 'Create recurring job',
        disabled: !this.canICreateRecurringJob() || !context.has(Permission.JOBS_MANAGE_RECURRING),
        onClick: () => {
          this.openModal('stateCreateRecurringJobModal');
        }
      },
      {
        type: 'divider'
      },
      {
        name: 'Create Invoice...',
        disabled: !context.has(Permission.INVOICES_MANAGE) || !jobHasInvoiceToContact,
        onClick: this.createInvoiceFromJob
      },
      {
        name: 'Create PO...',
        disabled: !context.has(Permission.PURCHASE_ORDERS_MANAGE),
        onClick: this.createPOFromJob
      },
      {
        name: 'Create CN...',
        disabled: !context.has(Permission.CREDIT_NOTES_MANAGE),
        onClick: this.createCNFromJob
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: this.deleteJob,
        disabled: !context.has(Permission.JOBS_DELETE)
      }
    ];
  }

  private createInvoiceFromJob = async () => {
    const {job, currentJobContacts, history} = this.props;

    try {
      const invoice = await InvoicesService.create({
        location: {
          id: job.assigned_location_id
        },
        recipient_contact: currentJobContacts.data!.find((el: IContactAssignment) => el.invoice_to),
        job: {
          id: job.id
        },
        date: moment(),
        due_at: moment().add(1, 'd')
      } as IFormData);

      if (invoice) {
        history.push(`/finance/invoices/details/${invoice.data.id}`);
      }
    } catch (e) {
      Notify(NotifyType.Danger, 'Could not create invoice');
    }
  };

  private createPOFromJob = () => {
    const {job, history} = this.props;

    history.push(`/finance/purchase-orders/create?form_job_id=${job.id}&form_location_id=${job.assigned_location_id}`);
  };

  private createCNFromJob = () => {
    const {job, history} = this.props;

    history.push(`/finance/credit-notes/create?form_job_id=${job.id}&form_location_id=${job.assigned_location_id}`);
  };

  public render() {
    const {job} = this.props;
    const {stateCreateRecurringJobModal} = this.state;
    const disabled = job.edit_forbidden;
    return (
      <UserContext.Consumer>
        {context => {
          const restMenuItems = this.getRestMenuItems(context);
          return (
            <>
              <ReactTooltip className="overlapping" id="job-menu-tooltip" effect="solid" />
              <PageMenu className="d-flex align-items-center justify-content-between">
                <div>
                  {context.has(Permission.JOBS_MANAGE_MESSAGES) && (
                    <ActionIcon data-tip="Reply" data-for="job-menu-tooltip" disabled={disabled}>
                      <Icon name={IconName.EmailReply} onClick={disabled ? () => null : this.props.onEmailReply} />
                    </ActionIcon>
                  )}
                  {context.has(Permission.JOBS_MANAGE_NOTES) && (
                    <ActionIcon data-tip="Add note" data-for="job-menu-tooltip" disabled={disabled}>
                      <Icon name={IconName.AddNote} onClick={disabled ? () => null : this.props.onNoteAdd} />
                    </ActionIcon>
                  )}
                  {context.has(Permission.JOBS_UPDATE) && (
                    <StatusControl
                      loading={this.props.nextStatuses.loading}
                      type="job"
                      statuses={this.getNextStatuses()}
                      onStatusClick={this.onStatusClick}
                    />
                  )}
                  {context.has(Permission.USERS_VIEW) && (
                    <UsersControl
                      onUserTeamClick={this.onUserClick}
                      onSelectedUserTeamClick={this.onSelectedUserClick}
                      selectedUsersTeams={job.assigned_to}
                      disabled={disabled || !context.has(Permission.JOBS_ASSIGN_STAFF)}
                    />
                  )}
                  {context.has(Permission.TAGS_VIEW) && context.has(Permission.JOBS_MANAGE_TAGS) && (
                    <TagsControl type="job" filter={job.tags} onTagClick={this.onTagClick} disabled={disabled} />
                  )}
                  {restMenuItems.length > 0 && <DropdownMenuControl items={restMenuItems} disabled={disabled} />}
                </div>
                <OnlineUsers channel={`online-job-${job.id}`} />
              </PageMenu>
              {stateCreateRecurringJobModal && (
                <ModalCreateRecurringJob
                  isOpen={stateCreateRecurringJobModal}
                  onClose={() => this.closeModal('stateCreateRecurringJobModal')}
                />
              )}
            </>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userId: selectCurrentUserId(state),
  currentJobContacts: state.currentJobContacts
});

export default compose<React.ComponentClass<IProps>>(
  withRouter,
  connect(mapStateToProps),
  withData<IProps>({
    nextStatuses: {
      fetch: JobService.getJobNextStatuses
    }
  })
)(JobMenu);

export const InternalJobMenu = JobMenu;
