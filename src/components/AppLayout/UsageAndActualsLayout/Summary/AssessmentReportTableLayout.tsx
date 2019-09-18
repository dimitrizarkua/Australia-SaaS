import * as React from 'react';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import Permission from 'src/constants/Permission';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import PlainTable from 'src/components/Tables/PlainTable';
import {IAssessmentReportSummary} from 'src/models/UsageAndActualsModels/IJobSummary';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {openModal} from 'src/redux/modalDucks';
import {connect} from 'react-redux';
import moment from 'moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import {TextHeader, NumericHeader} from 'src/components/Tables/DataGridHeader';
import {TextCell, NumericCell} from 'src/components/Tables/DataGridCell';

interface IProps {
  jobIsClosed: boolean;
  assessmentReportSummary: IAssessmentReportSummary[];
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

class AssessmentReportTableLayout extends React.PureComponent<IProps & IConnectProps> {
  private reportMenuItems = (
    context: IUserContext,
    report: IAssessmentReportSummary,
    jobIsClosed: boolean
  ): IMenuItem[] => {
    const allowManage = context.has(Permission.ASSESSMENT_REPORTS_MANAGE);

    return [
      {
        name: 'View / Edit',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.editReport(report)
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.deleteReport(report)
      }
    ];
  };

  private editReport(report: IAssessmentReportSummary) {
    // TODO: Add edit implementation
    console.log('View/Edit report');
  }

  private async deleteReport(report: IAssessmentReportSummary) {
    const {dispatch} = this.props;
    if (report.id) {
      const res = await dispatch(openModal('Confirm', `Delete assessment report?`));

      if (res) {
        // TODO: Add delete implementation
        return Promise.resolve();
      } else {
        return Promise.resolve();
      }
    }
  }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={5}>
          No items found
        </td>
      </tr>
    );
  }

  private renderRows(context: IUserContext) {
    const {assessmentReportSummary, jobIsClosed} = this.props;

    if (!assessmentReportSummary) {
      return null;
    }
    return assessmentReportSummary.map((item: IAssessmentReportSummary) => (
      <tr key={item.id}>
        <TextCell>{moment(item.date).format(FRONTEND_DATE)}</TextCell>
        <TextCell>{item.report}</TextCell>
        <NumericCell>{item.total_amount}</NumericCell>
        <NumericCell>{item.status}</NumericCell>
        <NumericCell>
          <DropdownMenuControl
            noMargin={true}
            iconName={IconName.MenuVertical}
            items={this.reportMenuItems(context, item, jobIsClosed)}
            direction="right"
          />
        </NumericCell>
      </tr>
    ));
  }

  public render() {
    const {assessmentReportSummary} = this.props;
    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.ASSESSMENT_REPORTS_VIEW);

          return allowRenderView ? (
            <>
              <PlainTable className="table">
                <thead>
                  <tr>
                    <TextHeader scope="col" width="15%">
                      Date
                    </TextHeader>
                    <TextHeader scope="col" style={{whiteSpace: 'nowrap'}}>
                      Report
                    </TextHeader>
                    <NumericHeader scope="col" width="20%">
                      Total Amount
                    </NumericHeader>
                    <NumericHeader scope="col" width="20%">
                      Status
                    </NumericHeader>
                    <NumericHeader scope="col" width="5%">
                      &nbsp;
                    </NumericHeader>
                  </tr>
                </thead>
                <tbody>
                  {assessmentReportSummary && assessmentReportSummary.length > 0
                    ? this.renderRows(context)
                    : this.renderNodata()}
                </tbody>
              </PlainTable>
            </>
          ) : null;
        }}
      </UserContext.Consumer>
    );
  }
}

export default connect()(AssessmentReportTableLayout);
