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
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {JobStatuses} from 'src/models/IJob';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import Icon, {IconName} from 'src/components/Icon/Icon';
import LabourTableLayout from './LabourTableLayout';
import AllowancesTableLayout from './AllowancesTableLayout';
import ReimbursementsTableLayout from './ReimbursementsTableLayout';
import LahaTableLayout from './LahaTableLayout';
import {ActionIcon} from 'src/components/Layout/PageMenu';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import ColorPalette from 'src/constants/ColorPalette';
import {selectCurrentUserId} from 'src/redux/userDucks';
import {loadJobCostingCounters} from 'src/redux/currentJob/currentJobUsageAndActuals';

const TimePageContainer = styled.div`
  margin-bottom: 16px;
`;

interface IParams {
  id: number;
}

interface IConnectProps {
  job: ICurrentJob;
  dispatch: ThunkDispatch<any, any, Action>;
  userId: number;
}

interface IState {
  hideRates: boolean;
  hideMultiselect: boolean;
  showAddAllowanceModal: boolean;
  showAddReimbursementModal: boolean;
  showAddLabourModal: boolean;
  showAddLahaModal: boolean;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

class UsageAndActualsLabourPage extends React.Component<IProps, IState> {
  public state: IState = {
    hideRates: true,
    hideMultiselect: true,
    showAddAllowanceModal: false,
    showAddReimbursementModal: false,
    showAddLabourModal: false,
    showAddLahaModal: false
  };

  public componentWillMount() {
    this.updateLabourCounters();
  }

  private labourMainMenuItems = (context: IUserContext, jobIsClosed: boolean): IMenuItem[] => {
    const allowAddLabour = context.has(Permission.JOBS_USAGE_LABOUR_MANAGE);
    const allowAddAllowance = context.has(Permission.JOBS_USAGE_ALLOWANCES_MANAGE);
    const allowAddReimbursement = context.has(Permission.JOBS_USAGE_REIMBURSEMENTS_MANAGE);
    const allowAddLAHA = context.has(Permission.JOBS_USAGE_LAHA_MANAGE);

    return [
      {
        name: 'Add Labour',
        disabled: !allowAddLabour || jobIsClosed,
        onClick: this.showAddLabourModal
      },
      {
        type: 'divider'
      },
      {
        name: 'Add Allowance',
        disabled: !allowAddAllowance || jobIsClosed,
        onClick: this.showAddAllowanceModal
      },
      {
        name: 'Add Reimbursement',
        disabled: !allowAddReimbursement || jobIsClosed,
        onClick: this.showAddReimbursementModal
      },
      {
        name: 'Add LAHA',
        disabled: !allowAddLAHA || jobIsClosed,
        onClick: this.showAddLahaModal
      }
    ];
  };

  private toggleRateView = () => {
    this.setState({hideRates: !this.state.hideRates});
  };

  private toggleMultiselectView = () => {
    this.setState({
      hideMultiselect: !this.state.hideMultiselect,
      hideRates: this.state.hideMultiselect ? true : this.state.hideRates
    });
  };

  private showAddAllowanceModal = () => this.setState({showAddAllowanceModal: true});

  private hideAddAllowanceModal = () => this.setState({showAddAllowanceModal: false});

  private showAddLabourModal = () => this.setState({showAddLabourModal: true});

  private hideAddLabourModal = () => this.setState({showAddLabourModal: false});

  private showAddReimbursementModal = () => this.setState({showAddReimbursementModal: true});

  private hideAddReimbursementModal = () => this.setState({showAddReimbursementModal: false});

  private showAddLahaModal = () => this.setState({showAddLahaModal: true});

  private hideAddLahaModal = () => this.setState({showAddLahaModal: false});

  private jobIsClosed = (): boolean => {
    const {job} = this.props;

    return (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;
  };

  public updateLabourCounters = () => {
    const {
      dispatch,
      match: {
        params: {id}
      }
    } = this.props;
    dispatch(loadJobCostingCounters(id));
  };

  private mainButtonRender() {
    return (
      <PrimaryButton className="btn" style={{marginLeft: '10px'}}>
        Add <ColoredIcon style={{marginLeft: '10px'}} size={16} color={ColorPalette.white} name={IconName.ArrowDown} />
      </PrimaryButton>
    );
  }

  public renderAdditionalHeaderLayout() {
    const {
      match: {
        params: {id}
      }
    } = this.props;

    const jobIsClosed = this.jobIsClosed();

    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);
          const allowCustomCreate = context.has(Permission.JOBS_USAGE_EQUIPMENT_CREATE);

          return allowRenderView ? (
            <div className="d-flex flex-row">
              <ReactTooltip className="overlapping" id="view-rates-tooltip" effect="solid" />
              <ActionIcon data-tip="Show/Hide rate columns" data-for="view-rates-tooltip" className="align-self-center">
                <Icon name={IconName.View} size={30} onClick={this.toggleRateView} />
              </ActionIcon>

              <ReactTooltip className="overlapping" id="view-multiselect" effect="solid" />
              <ActionIcon
                data-tip="Show/Hide multiselect column"
                data-for="view-multiselect"
                className="align-self-center"
              >
                <Icon name={IconName.BulletList} size={20} onClick={this.toggleMultiselectView} />
              </ActionIcon>

              <ViewJobButton jobId={id} />
              {allowCustomCreate && (
                <DropdownMenuControl
                  direction="right"
                  items={this.labourMainMenuItems(context, jobIsClosed)}
                  trigger={this.mainButtonRender}
                />
              )}
            </div>
          ) : null;
        }}
      </UserContext.Consumer>
    );
  }

  public renderContentPage() {
    const {
      match: {
        params: {id}
      }
    } = this.props;
    const {
      hideRates,
      hideMultiselect,
      showAddLabourModal,
      showAddAllowanceModal,
      showAddReimbursementModal,
      showAddLahaModal
    } = this.state;

    const jobIsClosed = this.jobIsClosed();

    return (
      <PageContent className="d-flex flex-column align-items-start" style={{minHeight: '95%'}}>
        <div className="mb-auto w-100">
          <LabourTableLayout
            jobId={id}
            jobIsClosed={jobIsClosed}
            hideRates={hideRates}
            hideMultiselect={hideMultiselect}
            addNewLabour={showAddLabourModal}
            hideAddLabour={this.hideAddLabourModal}
            updateLabourCounters={this.updateLabourCounters}
          />
        </div>
        <TimePageContainer className="w-100">
          <AllowancesTableLayout
            jobId={id}
            jobIsClosed={jobIsClosed}
            addNewAllowance={showAddAllowanceModal}
            hideAddAllowance={this.hideAddAllowanceModal}
            updateLabourCounters={this.updateLabourCounters}
          />
        </TimePageContainer>
        <TimePageContainer className="w-100">
          <ReimbursementsTableLayout
            jobId={id}
            jobIsClosed={jobIsClosed}
            addNewReimbursement={showAddReimbursementModal}
            hideAddReimbursement={this.hideAddReimbursementModal}
            updateLabourCounters={this.updateLabourCounters}
          />
        </TimePageContainer>
        <TimePageContainer className="w-100">
          <LahaTableLayout
            jobId={id}
            jobIsClosed={jobIsClosed}
            addNewLaha={showAddLahaModal}
            hideAddLaha={this.hideAddLahaModal}
            updateLabourCounters={this.updateLabourCounters}
          />
        </TimePageContainer>
      </PageContent>
    );
  }

  public render() {
    return (
      <>
        <UsageAndActualsLayout
          contentLayout={this.renderContentPage()}
          additionalHeaderLayout={this.renderAdditionalHeaderLayout()}
        />
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userId: selectCurrentUserId(state),
  job: state.currentJob
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(UsageAndActualsLabourPage);
