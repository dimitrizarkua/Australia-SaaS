import * as React from 'react';
import UsageAndActualsLayout from '../UsageAndActualsLayout';
import ViewJobButton from '../ViewJobButton';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {matchPath, Route, RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import FullSidebarMenuItem, {IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import {IconName} from 'src/components/Icon/Icon';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import ColorPalette from 'src/constants/ColorPalette';
import {formatPrice} from 'src/utility/Helpers';
import styled from 'styled-components';
import Tag from 'src/components/Tag/Tag';
import Typography from 'src/constants/Typography';
import {ITag} from 'src/models/ITag';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import UsageAndActualsAssessmentReportCosting from 'src/components/AppLayout/UsageAndActualsLayout/AssessmentReports/Costing/UsageAndActualsAssessmentReportCosting';
import UsageAndActualsAssessmentReportDocument from 'src/components/AppLayout/UsageAndActualsLayout/AssessmentReports/Document/UsageAndActualsAssessmentReportDocument';
import UsageAndActualsARCostingSidebar from 'src/components/AppLayout/UsageAndActualsLayout/AssessmentReports/Costing/UsageAndActualsARCostingSidebar';
import UsageAndActualsARDocumentSidebar from 'src/components/AppLayout/UsageAndActualsLayout/AssessmentReports/Document/UsageAndActualsARDocumentSidebar';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {loadCurrentAR, resetCurrentAR} from 'src/redux/assessmentReports/currentAS';

const StatusTag = styled(Tag)`
  margin-left: 10px;
  font-size: ${Typography.size.normal};
  line-height: 24px;
  height: 24px;
`;

interface IParams {
  id: string;
  reportId: string;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

class UsageAndActualsAssessmentReportFrame extends React.PureComponent<IProps> {
  public componentDidMount() {
    const {
      dispatch,
      match: {
        params: {id, reportId}
      }
    } = this.props;

    dispatch(loadCurrentAR(+id, +reportId));
  }

  public componentWillUnmount() {
    const {dispatch} = this.props;

    dispatch(resetCurrentAR());
  }

  private renderAdditionalHeaderLayout() {
    const {
      match: {
        params: {id}
      }
    } = this.props;

    return (
      <div className="d-flex align-items-center h-100 position-relative">
        <ColoredDiv
          color={ColorPalette.orange2}
          margin="0 20px 0 0"
          className="d-flex align-items-center h-100 position-relative"
        >
          <BlockLoading size={30} color={ColorPalette.white} />
          <div>TOTAL {formatPrice(1328)}</div>
          <StatusTag tag={{name: 'Draft', color: ColorPalette.orange2} as ITag} />
        </ColoredDiv>
        <ViewJobButton jobId={+id} />
        <PrimaryButton className="btn" style={{marginLeft: '10px'}}>
          Options
        </PrimaryButton>
      </div>
    );
  }

  private renderContentPage() {
    const {match} = this.props;

    return (
      <>
        <Route path={`${match.path}/costings`} component={UsageAndActualsAssessmentReportCosting} />
        <Route path={`${match.path}/document`} component={UsageAndActualsAssessmentReportDocument} />
      </>
    );
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private customMenuItems = (): IMenuItem[] => {
    const {
      match: {
        params: {id, reportId}
      }
    } = this.props;

    return [
      {
        path: `/usage-and-actuals/${id}/assessment-reports/${reportId}/costings`,
        label: 'Build Costings',
        icon: IconName.FileCash,
        isActive: this.isActive(`/usage-and-actuals/${id}/assessment-reports/${reportId}/costings`),
        type: 'build-costing'
      },
      {
        path: `/usage-and-actuals/${id}/assessment-reports/${reportId}/document`,
        label: 'Build Document',
        icon: IconName.FileEdit,
        isActive: this.isActive(`/usage-and-actuals/${id}/assessment-reports/${reportId}/document`),
        type: 'build-document'
      }
    ];
  };

  private renderCustomMenu = () => {
    const {match} = this.props;

    return (
      <>
        <ColoredDiv padding="20px 0" className="flex-shrink-0">
          {this.customMenuItems().map((item: IMenuItem) => (
            <FullSidebarMenuItem key={item.label} item={item} />
          ))}
        </ColoredDiv>
        <ScrollableContainer className="d-flex flex-column flex-grow-1">
          <ColoredDiv padding="0 13px 26px 13px" overflow="visible">
            <Route path={`${match.path}/costings`} component={UsageAndActualsARCostingSidebar} />
            <Route path={`${match.path}/document`} component={UsageAndActualsARDocumentSidebar} />
          </ColoredDiv>
        </ScrollableContainer>
      </>
    );
  };

  public render() {
    const {
      match: {
        params: {reportId}
      }
    } = this.props;

    return (
      <UsageAndActualsLayout
        contentLayout={this.renderContentPage()}
        additionalHeaderLayout={this.renderAdditionalHeaderLayout()}
        customHeaderTitle={`Assessment Report #${reportId}`}
        customMenuElements={this.renderCustomMenu()}
      />
    );
  }
}

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect()
)(UsageAndActualsAssessmentReportFrame);
