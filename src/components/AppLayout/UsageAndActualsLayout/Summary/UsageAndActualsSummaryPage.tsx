import * as React from 'react';
import UsageAndActualsLayout from '../UsageAndActualsLayout';
import ViewJobButton from '../ViewJobButton';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import PageContent from 'src/components/Layout/PageContent';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import styled from 'styled-components';
import UserContext from '../../UserContext';
import Permission from 'src/constants/Permission';
import {JobStatuses} from 'src/models/IJob';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import AssessmentReportTableLayout from './AssessmentReportTableLayout';
import SummaryTableLayout from './SummaryTableLayout';
import {IResource} from 'src/components/withData/withData';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {IJobCostingSummarySuccess} from 'src/services/JobService';
import {loadJobUsageSummary} from 'src/redux/currentJob/currentJobUsageAndActuals';

const ButtonsMaterial = styled.div`
  display: flex;
  flex-direction: row;
`;

interface IParams {
  id: number;
}

interface IConnectProps {
  job: ICurrentJob;
  currentJobUsageSummary: IResource<IJobCostingSummarySuccess>;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

class UsageAndActualsSummaryPage extends React.PureComponent<IProps> {
  public componentDidMount() {
    const {
      match: {
        params: {id}
      },
      dispatch
    } = this.props;

    dispatch(loadJobUsageSummary(id));
  }

  private onAddReport = () => {
    // TODO: Add implementation
    console.log('Show the Import Usages and Actuals Page');
  };

  public renderAdditionalHeaderLayout() {
    const {
      job,
      match: {
        params: {id}
      }
    } = this.props;

    const jobIsClosed = (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;

    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);
          const allowCustomCreate = context.has(Permission.ASSESSMENT_REPORTS_MANAGE);

          return allowRenderView ? (
            <div>
              <ButtonsMaterial>
                <ViewJobButton jobId={id} />
                {allowCustomCreate && (
                  <PrimaryButton
                    className="btn"
                    disabled={jobIsClosed}
                    onClick={this.onAddReport}
                    style={{marginLeft: '10px'}}
                  >
                    New Report / Quote
                  </PrimaryButton>
                )}
              </ButtonsMaterial>
            </div>
          ) : null;
        }}
      </UserContext.Consumer>
    );
  }

  public renderContentPage() {
    const {
      job,
      currentJobUsageSummary: {data, loading}
    } = this.props;
    const jobIsClosed = (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;
    const assessmentReportsSummary = data && data.data ? data.data.assessment_reports : [];

    return (
      <>
        {loading && <BlockLoading size={40} color={ColorPalette.white} />}
        <PageContent>
          <div style={{padding: '0 0 50px 0'}}>{data && <SummaryTableLayout summary={data.data} />}</div>
          <AssessmentReportTableLayout jobIsClosed={jobIsClosed} assessmentReportSummary={assessmentReportsSummary} />
        </PageContent>
      </>
    );
  }

  public render() {
    return (
      <UsageAndActualsLayout
        contentLayout={this.renderContentPage()}
        additionalHeaderLayout={this.renderAdditionalHeaderLayout()}
      />
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  job: state.currentJob,
  currentJobUsageSummary: state.currentJobUsageAndActuals.summary
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(UsageAndActualsSummaryPage);
