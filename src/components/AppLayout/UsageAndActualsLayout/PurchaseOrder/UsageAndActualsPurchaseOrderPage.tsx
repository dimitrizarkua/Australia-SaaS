import * as React from 'react';
import UsageAndActualsLayout from '../UsageAndActualsLayout';
import ViewJobButton from '../ViewJobButton';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {RouteComponentProps, withRouter} from 'react-router';
import PageContent from 'src/components/Layout/PageContent';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import PurchaseOrderTableLayout from './PurchaseOrderTableLayout';
import {JobStatuses} from 'src/models/IJob';
import StorageTableLayout from './StorageTableLayout';

interface IParams {
  id: number;
}

interface IConnectProps {
  job: ICurrentJob;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

class UsageAndActualsPurchaseOrderPage extends React.PureComponent<IProps> {
  public renderAdditionalHeaderLayout() {
    return (
      <div>
        <ViewJobButton jobId={this.props.match.params.id} />
      </div>
    );
  }

  public renderContentPage() {
    const {job} = this.props;
    const jobIsClosed = (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;

    return (
      <PageContent>
        <div style={{padding: '0 0 50px 0'}}>
          <PurchaseOrderTableLayout jobIsClosed={jobIsClosed} />
        </div>
        <StorageTableLayout jobIsClosed={jobIsClosed} />
      </PageContent>
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
  job: state.currentJob
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(UsageAndActualsPurchaseOrderPage);
