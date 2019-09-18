import * as React from 'react';
import {connect} from 'react-redux';
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IconName} from 'src/components/Icon/Icon';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import FullSidebarMenu from 'src/components/SidebarMenu/FullSidebarMenu';
import FullSidebarMenuItem, {IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import SecondMenuHeader from 'src/components/SidebarMenu/SecondMenuHeader';
import {IAppState} from 'src/redux';
import {ICurrentJob, loadCurrentJob} from 'src/redux/currentJob/currentJobDucks';
import JobService, {IJobCostingCountersSuccess} from 'src/services/JobService';
import styled from 'styled-components';
import UsageAndActualsHeader from './UsageAndActualsHeader';
import {ReactElement} from 'react';
import {loadJobCostingCounters} from 'src/redux/currentJob/currentJobUsageAndActuals';
import {IResource} from 'src/components/withData/withData';

const PageWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

interface IOwnProps {
  contentLayout?: any;
  additionalHeaderLayout?: any;
  customHeaderTitle?: string;
  customMenuElements?: ReactElement<unknown> | string;
}

interface IParams {
  id: string;
}

interface IConnectProps {
  job: ICurrentJob;
  jobCostingCounters: IResource<IJobCostingCountersSuccess>;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps & IOwnProps;

class UsageAndActualsLayout extends React.PureComponent<IProps> {
  public componentDidMount() {
    const {
      job,
      match: {
        params: {id}
      },
      dispatch
    } = this.props;

    if (!job.data || (job.data && job.data.id !== +id)) {
      dispatch(loadCurrentJob(id));
      dispatch(loadJobCostingCounters(+id));
    }
  }

  public componentDidUpdate(prevProps: IProps) {
    const {
      job,
      match: {
        params: {id}
      },
      dispatch
    } = this.props;
    const {
      match: {
        params: {id: prevId}
      }
    } = prevProps;

    if (!job.data || id !== prevId) {
      dispatch(loadCurrentJob(id));
    }
  }

  private getMenuItems(): IMenuItem[] {
    const {
      match: {
        params: {id}
      }
    } = this.props;
    return [
      {
        path: `/usage-and-actuals/${id}/summary`,
        label: 'Summary & Reports',
        icon: IconName.AnalyticsBar,
        isActive: this.isActive(`/usage-and-actuals/${id}/summary`),
        type: 'summary'
      },
      {
        path: `/usage-and-actuals/${id}/labour`,
        label: 'Time',
        icon: IconName.Stopwatch,
        isActive: this.isActive(`/usage-and-actuals/${id}/labour`),
        type: 'time',
        value: 0
      },
      {
        path: `/usage-and-actuals/${id}/equipment`,
        label: 'Equipment',
        icon: IconName.Tools,
        isActive: this.isActive(`/usage-and-actuals/${id}/equipment`),
        type: 'equipment',
        value: 0
      },
      {
        path: `/usage-and-actuals/${id}/materials`,
        label: 'Materials',
        icon: IconName.Materials,
        isActive: this.isActive(`/usage-and-actuals/${id}/materials`),
        type: 'materials',
        value: 0
      },
      {
        path: `/usage-and-actuals/${id}/purchase-order`,
        label: `PO's, Storage`,
        icon: IconName.File,
        isActive: this.isActive(`/usage-and-actuals/${id}/purchase-order`),
        type: 'purchase_orders',
        value: 0
      }
    ].map((el: IMenuItem) => {
      const {
        jobCostingCounters: {data}
      } = this.props;
      el.value = data && data.data[el.type!];
      return Object.assign({}, el);
    });
  }

  private getMenu2Items(): IMenuItem[] {
    const {
      match: {
        params: {id}
      }
    } = this.props;
    return [
      {
        path: `/usage-and-actuals/${id}/general-authority`,
        label: 'General Authority',
        icon: IconName.Materials,
        isActive: this.isActive(`/usage-and-actuals/${id}/general-authority`),
        type: 'general-authority'
      },
      {
        path: `/usage-and-actuals/${id}/job-contract`,
        label: 'Job Contract',
        icon: IconName.File,
        isActive: this.isActive(`/usage-and-actuals/${id}/job-contract`),
        type: 'job-contract'
      },
      {
        path: `/usage-and-actuals/${id}/crew-report`,
        label: 'Crew Report',
        icon: IconName.File,
        isActive: this.isActive(`/usage-and-actuals/${id}/crew-report`),
        type: 'crew-report'
      }
    ];
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  public render() {
    const {job, contentLayout, additionalHeaderLayout, customHeaderTitle, customMenuElements} = this.props;

    const currentJob = job.data;
    let jobTitle = currentJob ? JobService.getJobAddress(currentJob) : '';
    const jobName = currentJob && JobService.getJobName(currentJob);
    if (jobName) {
      jobTitle += ` | ${jobName}`;
    }

    return (
      <PageWrapper className="d-flex flex-column flex-grow-1">
        <UsageAndActualsHeader
          customHeaderTitle={customHeaderTitle}
          siteAddress={jobTitle}
          additionalHeaderLayout={additionalHeaderLayout}
        />
        <ScrollableContainer className="h-100 d-flex flex-row min-100">
          <FullSidebarMenu>
            {customMenuElements || (
              <>
                <SecondMenuHeader>Usage and Actuals</SecondMenuHeader>
                {this.getMenuItems().map((item: IMenuItem) => (
                  <FullSidebarMenuItem key={item.label} item={item} />
                ))}

                <SecondMenuHeader>On-Site Data & Contracts</SecondMenuHeader>
                {this.getMenu2Items().map((item: IMenuItem) => (
                  <FullSidebarMenuItem key={item.label} item={item} />
                ))}
              </>
            )}
          </FullSidebarMenu>
          <PageWrapper>{contentLayout}</PageWrapper>
        </ScrollableContainer>
      </PageWrapper>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  job: state.currentJob,
  jobCostingCounters: state.currentJobUsageAndActuals.costingCounters
});

export default compose<React.ComponentClass<IOwnProps>>(
  withRouter,
  connect(mapStateToProps)
)(UsageAndActualsLayout);
