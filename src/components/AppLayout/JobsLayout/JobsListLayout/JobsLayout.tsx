import * as React from 'react';
import {matchPath, Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router-dom';
import FullSidebarMenu from 'src/components/SidebarMenu/FullSidebarMenu';
import {IconName} from 'src/components/Icon/Icon';
import JobsListLayout from './JobsListLayout';
import FullSidebarMenuItem, {IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import SecondMenuHeader from 'src/components/SidebarMenu/SecondMenuHeader';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {updateJobsInfo} from 'src/redux/jobsInfo';
import {IAppState} from 'src/redux';
import {IJobsInfo} from 'src/models/IJobsInfo';
import BottomIconButton from 'src/components/Layout/LeftMenu/BottomIconButton';
import MenuActionsBar from 'src/components/Layout/LeftMenu/MenuActionsBar';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ReactTooltip from 'react-tooltip';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

interface IConnectProps {
  jobsInfo: IJobsInfo;
  dispatch: ThunkDispatch<unknown, unknown, Action>;
}

class JobsLayout extends React.PureComponent<RouteComponentProps<{}> & IConnectProps> {
  public componentDidMount() {
    this.props.dispatch(updateJobsInfo());
  }

  private getJobsMenuMainItems(): IMenuItem[] {
    return [
      {
        path: '/jobs/inbox',
        label: 'Inbox',
        value: 0,
        icon: IconName.DrawerOpen,
        isActive: this.isActive('/jobs/inbox'),
        type: 'inbox'
      },
      {
        path: '/jobs/mine',
        label: 'Mine',
        value: 0,
        icon: IconName.Hand,
        isActive: this.isActive('/jobs/mine'),
        type: 'mine'
      },
      {
        path: '/jobs/all',
        label: 'All active jobs',
        value: 0,
        icon: IconName.ManCircle,
        isActive: this.isActive('/jobs/all'),
        type: 'active'
      },
      {
        path: '/jobs/closed',
        label: 'Closed',
        value: 0,
        icon: IconName.Archive,
        isActive: this.isActive('/jobs/closed'),
        type: 'closed'
      }
    ].map((el: IMenuItem) => {
      el.value = this.props.jobsInfo[el.type!];
      return Object.assign({}, el);
    });
  }

  private getJobsMenuTeamsItems(): IMenuItem[] {
    return this.props.jobsInfo.teams.map(el => {
      return {
        path: `/jobs/team/${el.id}`,
        label: el.name,
        value: el.jobs_count,
        icon: IconName.People,
        isActive: this.isActive(`/jobs/team/${el.id}`),
        type: 'team'
      };
    });
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private getJobsSecondMenuItems(): IMenuItem[] {
    return [
      {
        path: '/jobs/noContact',
        label: 'No contact 24 hours',
        value: this.props.jobsInfo.no_contact_24_hours,
        isActive: this.isActive('/jobs/noContact'),
        type: 'no_contact_24_hours'
      },
      {
        path: '/jobs/upcomingKPI',
        label: 'Upcoming KPI',
        value: this.props.jobsInfo.upcoming_kpi,
        isActive: this.isActive('/jobs/upcomingKPI'),
        type: 'upcoming_kpi'
      }
    ];
  }

  private getMenuTemplate(context: IUserContext) {
    return (
      <div>
        <ReactTooltip className="overlapping" effect="solid" place="right" id="jobs-sidebar-tooltip" />
        {this.getJobsMenuMainItems().map((item: IMenuItem) => {
          return <FullSidebarMenuItem key={item.label} item={item} />;
        })}
        {this.props.jobsInfo.teams.length ? <SecondMenuHeader>Teams</SecondMenuHeader> : ''}
        {this.getJobsMenuTeamsItems().map((item: IMenuItem) => {
          return <FullSidebarMenuItem key={item.label} item={item} />;
        })}
        <SecondMenuHeader>Folders</SecondMenuHeader>
        {this.getJobsSecondMenuItems().map((item: IMenuItem) => {
          return <FullSidebarMenuItem key={item.label} item={item} />;
        })}
        <MenuActionsBar className="d-flex flex-row align-items-center">
          {context.has(Permission.JOBS_CREATE) && (
            <BottomIconButton
              name={IconName.Add}
              data-tip="Create new job"
              data-for="jobs-sidebar-tooltip"
              onClick={this.createNewJob}
            />
          )}
          <BottomIconButton name={IconName.Filter} data-tip="Filter" data-for="jobs-sidebar-tooltip" />
        </MenuActionsBar>
      </div>
    );
  }

  private createNewJob = () => {
    const {history} = this.props;

    history.push('/job/new/details');
  };

  public render() {
    const {match, jobsInfo} = this.props;

    return (
      <UserContext.Consumer>
        {context => (
          <div className="d-flex h-100 flex-row align-items-stretch">
            <FullSidebarMenu>{jobsInfo ? this.getMenuTemplate(context) : <BlockLoading size={40} />}</FullSidebarMenu>
            <Switch>
              <Route exact={true} path={`${match.url}/:type`} component={JobsListLayout} />
              <Route exact={true} path={`${match.url}/:type/:teamId`} component={JobsListLayout} />
              <Redirect to={`${match.url}/inbox`} />
            </Switch>
          </div>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  jobsInfo: state.jobsInfo
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(JobsLayout);
