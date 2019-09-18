import * as React from 'react';
import {IJob} from 'src/models/IJob';
import withData, {IResource} from 'src/components/withData/withData';
import JobService, {IJobsSuccess} from 'src/services/JobService';
import styled from 'styled-components';
import JobsListItem from './JobsListItem';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import moment from 'moment';
import {orderBy} from 'lodash';
import Typography from 'src/constants/Typography';
import {compose} from 'redux';
import {RouteComponentProps, RouteProps, withRouter} from 'react-router';
import EventBus from 'src/utility/EventBus';
import {UserChannelNotificationTypes} from 'src/models/INotification';

const JobsListContainer = styled.div`
  overflow: hidden;
  position: relative;
`;

const JobsListWrapper = styled.div`
  overflow-y: auto;
  height: 100%;

  > div {
    padding: 35px 0;
    margin: 0 35px;
  }

  > div > div:first-child {
    margin-top: 0px;
  }
`;

const Title = styled.div`
  text-transform: uppercase;
  color: ${ColorPalette.gray4};
  font-weight: ${Typography.weight.medium};
  margin-bottom: 10px;
  margin-top: 50px;
`;

interface IWithDataProps {
  jobs: IResource<IJobsSuccess>;
}

interface IParams {
  type: string;
  teamId?: string;
}

type IProps = RouteComponentProps<IParams> & IWithDataProps;

class JobsListLayout extends React.PureComponent<IProps> {
  private jobCreatedEventHandler = () => {
    this.fetchJobs();
  };

  public componentDidMount() {
    this.fetchJobs();
    EventBus.listen(UserChannelNotificationTypes.JOB_CREATED, this.jobCreatedEventHandler);
  }

  public componentDidUpdate(prevProps: IProps) {
    const {type, teamId} = this.props.match.params;

    if (type !== prevProps.match.params.type || teamId !== prevProps.match.params.teamId) {
      this.fetchJobs();
    }
  }

  public componentWillUnmount() {
    EventBus.removeListener(UserChannelNotificationTypes.JOB_CREATED, this.jobCreatedEventHandler);
  }

  private fetchJobs = () => {
    const {type, teamId} = this.props.match.params;
    const params = type === 'team' ? teamId : {};
    return this.props.jobs.fetch(type, params);
  };

  private jobsCondition = (type: string, job: IJob): boolean => {
    const date = new Date();
    const dateOnly = moment(date).startOf('day');
    const firstDayOfMonth = moment(date).startOf('month');

    switch (type) {
      case 'today':
        return moment(job.touched_at).unix() > dateOnly.unix() || !!job.pinned_at;
      case 'yesterday':
        return (
          moment(job.touched_at).unix() > dateOnly.subtract(1, 'day').unix() &&
          moment(job.touched_at).unix() < dateOnly.unix() &&
          !job.pinned_at
        );
      case 'thisWeek':
        return (
          moment(job.touched_at).unix() >
            moment(date)
              .startOf('week')
              .unix() && !job.pinned_at
        );
      case 'thisMonth':
        return moment(job.touched_at).unix() > firstDayOfMonth.unix() && !job.pinned_at;
      case 'earlier':
        return moment(job.touched_at).unix() < firstDayOfMonth.unix() && !job.pinned_at;
      default:
        return true;
    }
  };

  private getTodayJobs = () => {
    const {data} = this.props.jobs.data!;

    return orderBy(
      data.filter((job: IJob) => {
        return this.jobsCondition('today', job);
      }),
      [(o: IJob) => !!o.pinned_at, (o: IJob) => moment(o.touched_at).unix()],
      ['asc', 'desc']
    );
  };

  private getThisWeekJobs = () => {
    const {data} = this.props.jobs.data!;

    return orderBy(
      data.filter((job: IJob) => {
        return this.jobsCondition('thisWeek', job) && !this.jobsCondition('today', job);
      }),
      [(o: IJob) => moment(o.touched_at).unix()],
      ['desc']
    );
  };

  private getThisMonthJobs = () => {
    const {data} = this.props.jobs.data!;

    return orderBy(
      data.filter((job: IJob) => {
        return (
          this.jobsCondition('thisMonth', job) &&
          !this.jobsCondition('thisWeek', job) &&
          !this.jobsCondition('today', job)
        );
      }),
      [(o: IJob) => moment(o.touched_at).unix()],
      ['desc']
    );
  };

  private getEarlierJobs = () => {
    const {data} = this.props.jobs.data!;

    return orderBy(
      data.filter((job: IJob) => {
        return this.jobsCondition('earlier', job);
      }),
      [(o: IJob) => moment(o.touched_at).unix()],
      ['desc']
    );
  };

  private getJobsWithoutSnoozed = () => {
    const {data} = this.props.jobs.data!;

    return orderBy(
      data.filter((job: IJob) => {
        return !job.snoozed_until;
      }),
      [(o: IJob) => !!o.pinned_at, (o: IJob) => moment(o.touched_at).unix()],
      ['desc', 'desc']
    );
  };

  private getSnoozedJobs = () => {
    const {data} = this.props.jobs.data!;

    return orderBy(
      data.filter((job: IJob) => {
        return job.snoozed_until;
      }),
      [(o: IJob) => !!o.pinned_at, (o: IJob) => moment(o.touched_at).unix()],
      ['desc', 'desc']
    );
  };

  private renderJobsGroup(jobs: IJob[], title?: string) {
    const {type} = this.props.match.params;
    if (jobs.length === 0) {
      return null;
    }

    return (
      <>
        {title && <Title>{title}</Title>}
        {jobs.map((job: IJob) => (
          <JobsListItem job={job} type={type} fetchJobs={this.fetchJobs} key={[job.claim_number, job.id].join('--')} />
        ))}
      </>
    );
  }

  public render() {
    const {type} = this.props.match.params;
    const {loading} = this.props.jobs;

    return (
      <JobsListContainer className="flex-grow-1">
        {loading && <BlockLoading size={40} color={ColorPalette.white} />}
        {type === 'inbox' ? (
          <JobsListWrapper>
            <div>
              {this.renderJobsGroup(this.getTodayJobs(), 'Today')}
              {this.renderJobsGroup(this.getThisWeekJobs(), 'This week')}
              {this.renderJobsGroup(this.getThisMonthJobs(), 'This month')}
              {this.renderJobsGroup(this.getEarlierJobs(), 'Earlier')}
            </div>
          </JobsListWrapper>
        ) : (
          <JobsListWrapper>
            <div>
              {this.renderJobsGroup(this.getJobsWithoutSnoozed())}
              {this.renderJobsGroup(this.getSnoozedJobs(), 'Snoozed')}
            </div>
          </JobsListWrapper>
        )}
      </JobsListContainer>
    );
  }
}

export default compose<React.ComponentClass<RouteProps>>(
  withData<IProps>({
    jobs: {
      fetch: (type: string, params) => {
        switch (type) {
          case 'inbox':
            return JobService.getInboxJobs(params);
          case 'mine':
            return JobService.getMineJobs(params);
          case 'team':
            return JobService.getTeamJobs(params);
          case 'closed':
            return JobService.getClosedJobs(params);
          case 'all':
            return JobService.getAllJobs(params);
          case 'noContact':
            return JobService.getNoContactJobs(params);
          case 'upcomingKPI':
            return JobService.getUpcomingKPIJobs(params);
        }
        return Promise.reject('unknown type');
      },
      initialData: {
        data: []
      }
    }
  }),
  withRouter
)(JobsListLayout);
