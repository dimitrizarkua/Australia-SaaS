import * as qs from 'qs';
import * as React from 'react';
import {matchPath, Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {IconName} from 'src/components/Icon/Icon';
import SidebarMenu, {IMenuItem} from 'src/components/SidebarMenu/SidebarMenu';
import SidebarSubmenu, {ISubmenuItem} from 'src/components/SidebarMenu/SidebarSubmenu';
import ReferenceBar from 'src/components/ReferenceBar/ReferenceBar';
import ReferenceBarFinancials from 'src/components/ReferenceBar/ReferenceBarFinancials';
import ReferenceBarContact from 'src/components/ReferenceBar/ReferenceBarContact';
import ReferenceBarJobDetails from 'src/components/ReferenceBar/ReferenceBarJobDetails';
import ReferenceBarPreviousJobs from 'src/components/ReferenceBar/ReferenceBarPreviousJobs';
import JobNotesAndRepliesPage from './JobNotesAndRepliesPage';
import JobDetailsPage from './JobDetailsPage';
import JobSiteSurvey from './SiteSurvey/JobSiteSurvey';
import JobMenu from './JobMenu';
import styled from 'styled-components';
import JobHeader from './JobHeader';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {ICurrentJob, loadCurrentJob, resetCurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {debounce} from 'lodash';
import JobPhotos from './Photos/JobPhotos';
import PhotosSelected from 'src/components/ReferenceBar/PhotosSelected';
import {ICurrentJobPhotos} from 'src/redux/currentJob/currentJobPhotosDucks';
import {IWebSocketNotification} from 'src/models/INotification';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import JobScheduleAndTasks from 'src/components/AppLayout/JobsLayout/JobLayout/ScheduleAndTasks/JobScheduleAndTasks';
import {IReturnType} from 'src/redux/reduxWrap';
import {loadJobContacts, resetJobContacts} from 'src/redux/currentJob/currentJobContactsDucks';
import {IContactAssignment} from 'src/models/IJob';
import {ICurrentUser} from 'src/models/IUser';
import {getEcho} from 'src/utility/Echo';
import * as H from 'history';
import {initialize} from 'redux-form';
import {JobFormName} from 'src/components/AppLayout/JobsLayout/JobLayout/JobForm';
import InvoicesService from 'src/services/InvoicesService';
import {IInvoiceListItem} from 'src/models/FinanceModels/IInvoices';

interface IParams {
  id: string;
}

interface IConnectProps {
  job: ICurrentJob;
  currentJobPhotos: ICurrentJobPhotos;
  user: ICurrentUser;
  contacts: IReturnType<IContactAssignment[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  jobInvoices: IInvoiceListItem[] | null;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

const PageWrapper = styled.div`
  position: relative;
`;

const Wrapper = styled.div`
  min-height: 100%;
`;

export const isContactsVisible = (location: H.Location) => {
  const params = qs.parse(location.search, {ignoreQueryPrefix: true});
  return params.contacts === 'true';
};

class JobLayout extends React.Component<IProps, IState> {
  public state = {
    jobInvoices: null
  };

  public componentDidMount() {
    this.joinJobChannels();
    this.fetchJob();
    this.getJobInvoices();
  }

  public componentWillUnmount() {
    const {id} = this.props.match.params;
    this.props.dispatch(resetCurrentJob());
    this.props.dispatch(resetJobContacts());
    getEcho().leave(`job-${id}`);
  }

  public componentDidUpdate(prevProps: IProps) {
    const {id} = this.props.match.params;
    const {id: pId} = prevProps.match.params;

    if (id !== pId) {
      getEcho().leave(`job-${pId}`);
      this.joinJobChannels();
      this.fetchJob();
      this.getJobInvoices();
    }
  }

  private getJobInvoices = async () => {
    const {
      match: {
        params: {id}
      }
    } = this.props;

    if (+id) {
      const invoices = await InvoicesService.getAll({job_id: id});

      this.setState({jobInvoices: invoices.data});
    }
  };

  private isCreateNewJob = () => {
    return this.props.match.params.id.toLowerCase() === 'new';
  };

  private fetchJob = (reinitializeForm: boolean = false) => {
    const {id} = this.props.match.params;

    if (!this.isCreateNewJob()) {
      return Promise.all([this.props.dispatch(loadCurrentJob(id)), this.props.dispatch(loadJobContacts(id))]).then(
        () => {
          if (reinitializeForm) {
            this.props.dispatch(initialize(JobFormName, this.props.job.data));
          }
        }
      );
    }

    return Promise.resolve(true);
  };

  private debouncedFetchJob = debounce((reinitializeForm: boolean = false) => this.fetchJob(reinitializeForm), 500);

  private joinJobChannels = () => {
    const {match, user} = this.props;
    const {id} = match.params;

    getEcho()
      .private(`job-${id}`)
      .listen('.job.updated', (data: IWebSocketNotification) => {
        if (user.id !== data.notification.sender!.id) {
          this.debouncedFetchJob(true);
        }
      });
  };

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private getJobsMenuItems(): IMenuItem[] {
    return [
      {path: '/jobs/inbox', icon: IconName.DrawerOpen, isActive: this.isActive('/jobs/inbox'), hint: 'Inbox'},
      {path: '/jobs/mine', icon: IconName.Hand, isActive: this.isActive('/jobs/mine'), hint: 'Mine'},
      {path: '/jobs/all', icon: IconName.ManCircle, isActive: this.isActive('/jobs/all'), hint: 'All active jobs'},
      {path: '/jobs/closed', icon: IconName.Archive, isActive: this.isActive('/jobs/closed'), hint: 'Closed'}
    ];
  }

  private getJobsSubmenuItems(): ISubmenuItem[] {
    const {id} = this.props.match.params;
    return this.isCreateNewJob()
      ? [{path: `/job/${id}/details`, label: 'Job Details', isActive: this.isActive(`/job/${id}/details`)}]
      : [
          {path: `/job/${id}/details`, label: 'Job Details', isActive: this.isActive(`/job/${id}/details`)},
          {
            path: `/job/${id}/notes-and-replies`,
            label: 'Notes and Replies',
            isActive: this.isActive(`/job/${id}/notes-and-replies`)
          },
          {
            path: `/job/${id}/schedule-and-tasks`,
            label: 'Schedule & Tasks',
            isActive: this.isActive(`/job/${id}/schedule-and-tasks`)
          },
          {
            path: `/job/${id}/documents`,
            label: 'Documents',
            isActive: this.isActive(`/job/${id}/documents`),
            removed: true
          },
          {
            path: `/usage-and-actuals/${id}`,
            label: 'Job Costings',
            isActive: this.isActive(`/usage-and-actuals/${id}`)
          },
          {
            path: `/job/${id}/storage-and-inventory`,
            label: 'Storage & Inventory',
            isActive: this.isActive(`/job/${id}/storage-and-inventory`),
            removed: true
          },
          {path: `/job/${id}/site-survey`, label: 'Site Survey', isActive: this.isActive(`/job/${id}/site-survey`)},
          {path: `/job/${id}/photos`, label: 'Photos', isActive: this.isActive(`/job/${id}/photos`)}
        ].filter((el: ISubmenuItem) => !el.removed);
  }

  private renderReferenceBarContacts() {
    return this.props.contacts.data
      ? this.props.contacts.data.map((contact: any, index: number) => (
          <ReferenceBarContact contact={contact} key={`cnt-${contact.type}-${index}`} />
        ))
      : null;
  }

  private redirectToNotes = () => {
    this.props.history.push(`/job/${this.props.match.params.id}/notes-and-replies?note=true`);
  };

  private redirectToReply = () => {
    this.props.history.push(`/job/${this.props.match.params.id}/notes-and-replies?reply=true`);
  };

  private toggleContacts = () => {
    const {history, location, match} = this.props;
    const query = qs.stringify({contacts: !isContactsVisible(location)});
    history.push(`/job/${match.params.id}/details?${query}`);
  };

  private get isBlockingLoading() {
    const {job, match} = this.props;
    return job.loading && (!job.data || String(job.data.id) !== match.params.id);
  }

  public render() {
    const {
      match,
      job: {data, loading},
      currentJobPhotos: {selectedPhotos}
    } = this.props;
    const job = data;
    const isCreate = this.isCreateNewJob();

    return (
      <div className="d-flex h-100 flex-row align-items-stretch" key={match.params.id}>
        <SidebarMenu items={this.getJobsMenuItems()} />
        <SidebarSubmenu items={this.getJobsSubmenuItems()} />
        <UserContext.Consumer>
          {context => {
            return (
              <div className="flex-grow-1">
                <ScrollableContainer className="h-100">
                  <Wrapper className="d-flex flex-row min-100">
                    <PageWrapper className="d-flex flex-column flex-grow-1">
                      {this.isBlockingLoading && <BlockLoading zIndex={200} size={40} color={ColorPalette.white} />}
                      {job && !isCreate && (
                        <>
                          <JobMenu
                            onNoteAdd={this.redirectToNotes}
                            onEmailReply={this.redirectToReply}
                            onContactsToggle={this.toggleContacts}
                            onUpdate={this.debouncedFetchJob}
                            job={job}
                            jobInvoices={this.state.jobInvoices}
                          />
                          <JobHeader job={job} disabled={!context.has(Permission.JOBS_MANAGE_TAGS)} loading={loading} />
                        </>
                      )}
                      <Switch>
                        <Route exact={true} path={`${match.path}/details`} component={JobDetailsPage} />
                        <Route
                          exact={true}
                          path={`${match.path}/notes-and-replies`}
                          component={JobNotesAndRepliesPage}
                        />
                        <Route exact={true} path={`${match.path}/schedule-and-tasks`} component={JobScheduleAndTasks} />
                        <Route exact={true} path={`${match.path}/site-survey`} component={JobSiteSurvey} />
                        <Route exact={true} path={`${match.path}/photos`} component={JobPhotos} />
                        <Redirect to={`${match.url}/notes-and-replies`} />
                      </Switch>
                    </PageWrapper>
                    <ReferenceBar>
                      {loading && <BlockLoading size={40} color={ColorPalette.gray1} />}
                      {job && !this.isCreateNewJob() && selectedPhotos.length === 0 && (
                        <>
                          {this.renderReferenceBarContacts()}
                          <ReferenceBarJobDetails job={job} contacts={this.props.contacts.data || []} />
                          {job.previous_jobs.length > 0 && <ReferenceBarPreviousJobs items={job.previous_jobs} />}
                          <ReferenceBarFinancials financials={{}} />
                        </>
                      )}
                      {job && selectedPhotos.length > 0 && <PhotosSelected job={job} />}
                    </ReferenceBar>
                  </Wrapper>
                </ScrollableContainer>
              </div>
            );
          }}
        </UserContext.Consumer>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  job: state.currentJob,
  contacts: state.currentJobContacts,
  currentJobPhotos: state.currentJobPhotos,
  user: state.user.me
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(JobLayout);

export const InternalJobLayout = JobLayout;
