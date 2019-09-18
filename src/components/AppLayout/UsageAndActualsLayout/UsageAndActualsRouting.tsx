import * as React from 'react';
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router-dom';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import AppRoute from 'src/components/AppRoute';
import Permission from 'src/constants/Permission';
import UsageAndActualsCrewReportPage from './CrewReport/UsageAndActualsCrewReportPage';
import UsageAndActualsEquipmentPage from './Equipment/UsageAndActualsEquipmentPage';
import UsageAndActualsGeneralAuthorityPage from './GeneralAuthority/UsageAndActualsGeneralAuthorityPage';
import UsageAndActualsJobContractPage from './JobContract/UsageAndActualsJobContractPage';
import UsageAndActualsMaterialsPage from './Materials/UsageAndActualsMaterialsPage';
import UsageAndActualsPurchaseOrderPage from './PurchaseOrder/UsageAndActualsPurchaseOrderPage';
import UsageAndActualsSummaryPage from './Summary/UsageAndActualsSummaryPage';
import UsageAndActualsLabourPage from './Time/UsageAndActualsLabourPage';
import UsageAndActualsAssessmentReportFrame from 'src/components/AppLayout/UsageAndActualsLayout/AssessmentReports/UsageAndActualsAssessmentReportFrame';

interface IParams {
  id: string;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

class UsageAndActualsRouting extends React.PureComponent<IProps> {
  public render() {
    const {match} = this.props;

    return (
      <Switch>
        <AppRoute
          path={`${match.path}/summary`}
          component={UsageAndActualsSummaryPage}
          permission={Permission.JOBS_USAGE_VIEW}
        />
        <AppRoute
          path={`${match.path}/labour`}
          component={UsageAndActualsLabourPage}
          permission={Permission.JOBS_USAGE_VIEW}
        />
        <AppRoute
          path={`${match.path}/equipment`}
          component={UsageAndActualsEquipmentPage}
          permission={Permission.JOBS_USAGE_VIEW}
        />
        <AppRoute
          path={`${match.path}/materials`}
          component={UsageAndActualsMaterialsPage}
          permission={Permission.JOBS_USAGE_VIEW}
        />
        <Route path={`${match.path}/purchase-order`} component={UsageAndActualsPurchaseOrderPage} />
        <Route path={`${match.path}/general-authority`} component={UsageAndActualsGeneralAuthorityPage} />
        <Route path={`${match.path}/job-contract`} component={UsageAndActualsJobContractPage} />
        <Route path={`${match.path}/crew-report`} component={UsageAndActualsCrewReportPage} />
        <AppRoute
          path={`${match.path}/assessment-reports/:reportId`}
          component={UsageAndActualsAssessmentReportFrame}
          permission={Permission.ASSESSMENT_REPORTS_VIEW}
        />
        <Redirect to={`${match.url}/summary`} />
      </Switch>
    );
  }
}

export default compose<React.ComponentClass<{}>>(withRouter)(UsageAndActualsRouting);
