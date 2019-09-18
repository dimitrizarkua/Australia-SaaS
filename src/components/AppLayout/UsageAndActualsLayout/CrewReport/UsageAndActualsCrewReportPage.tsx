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

interface IParams {
  id: number;
}

interface IConnectProps {
  job: ICurrentJob;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

class UsageAndActualsCrewReportPage extends React.PureComponent<IProps> {
  public renderAdditionalHeaderLayout() {
    const {
      match: {
        params: {id}
      }
    } = this.props;

    return (
      <div>
        <ViewJobButton jobId={id} />
      </div>
    );
  }

  public renderContentPage() {
    return <PageContent>UsageAndActualsCrewReportPage</PageContent>;
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
)(UsageAndActualsCrewReportPage);
