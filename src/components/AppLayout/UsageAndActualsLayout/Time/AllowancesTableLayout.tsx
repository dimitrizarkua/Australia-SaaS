import * as React from 'react';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {connect} from 'react-redux';
import {FRONTEND_DATE} from 'src/constants/Date';
import {IAllowance} from 'src/models/UsageAndActualsModels/IAllowance';
import {IColumn, ColumnType} from 'src/components/Tables/IColumn';
import {formatPrice} from 'src/utility/Helpers';
import DataGrid from 'src/components/Tables/DataGrid';
import moment from 'moment';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import Permission from 'src/constants/Permission';
import {openModal} from 'src/redux/modalDucks';
import {IconName} from 'src/components/Icon/Icon';
import NumericInput from 'src/components/Form/NumericInput';
import {debounce} from 'lodash';
import UsageTableLayout from '../UsageTableLayout';
import {IJobAllowanceSuccess} from 'src/services/UsageAndActuals/LabourService';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {IResource} from 'src/components/withData/withData';
import {IAppState} from 'src/redux';
import {loadJobAllowances} from 'src/redux/currentJob/currentJobUsageAndActuals';
import Pagination from 'src/components/Tables/Pagination';
import ModalAllowance, {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalAllowance';
import AllowanceTransformer from 'src/transformers/AllowanceTransformer';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import {selectCurrentUserId} from 'src/redux/userDucks';

interface IProps {
  jobId: number;
  jobIsClosed: boolean;
  addNewAllowance: boolean;
  dispatch: ThunkDispatch<any, any, Action>;
  hideAddAllowance: () => void;
  updateLabourCounters: () => void;
}

interface IConnectProps {
  currentJobAllowances: IResource<IJobAllowanceSuccess>;
  userId: number;
}

interface IState {
  loading: boolean;
  showAllowanceModal: boolean;
  item?: IAllowance;
}

class AllowancesTableLayout extends React.PureComponent<IProps & IConnectProps, IState> {
  public state: IState = {
    loading: false,
    showAllowanceModal: false,
    item: undefined
  };

  public componentDidMount() {
    this.loadAllowance();
  }

  public allowancesColumns = (): Array<IColumn<IAllowance>> => [
    {
      id: 'item',
      header: 'Allowances',
      width: '10%',
      type: ColumnType.Text,
      cell: item => <span>{moment(item.date_given).format(FRONTEND_DATE)}</span>
    },
    {
      id: 'user',
      width: '35%',
      type: ColumnType.Text,
      cell: item => <span>{item.user.full_name}</span>
    },
    {
      id: 'type',
      width: '25%',
      type: ColumnType.Text,
      cell: item => <span>{item.allowance_type.name}</span>
    },
    {
      id: 'amount',
      width: '15%',
      type: ColumnType.Text,
      cell: item => (
        <div className="d-flex align-items-center">
          <NumericInput quantity={item.amount} onChange={q => this.onChangeQuantity(q, item.id)} />
          <span style={{marginLeft: '10px'}}>{item.allowance_type.charging_interval}</span>
        </div>
      )
    },
    {
      id: 'total_amount',
      width: '10%',
      type: ColumnType.Numeric,
      cell: item => <span>{formatPrice(item.total_amount)}</span>
    },
    {
      id: 'menu',
      width: '5%',
      type: ColumnType.Numeric,
      cell: item => (
        <UserContext.Consumer>
          {context => {
            return (
              <DropdownMenuControl
                noMargin={true}
                iconName={IconName.MenuVertical}
                items={this.tableMenuItems(context, item, this.props.jobIsClosed)}
                direction="right"
              />
            );
          }}
        </UserContext.Consumer>
      )
    }
  ];

  private onChangeQuantity = (amount: number, allowanceId: number) => {
    this.debouncedQuantityUpdate(amount, allowanceId);
  };

  private updateQuantity = async (amount: number, allowanceId: number) => {
    const {jobId} = this.props;
    await UsageAndActualsService.updateAllowance({id: allowanceId, job_id: jobId, amount} as IAllowance);
    this.loadAllowance();
  };

  private debouncedQuantityUpdate = debounce(this.updateQuantity, 1000);

  private showAllowanceModal = () => this.setState({showAllowanceModal: true});

  private hideAllowanceModal = () => {
    this.setState({showAllowanceModal: false});
    this.props.hideAddAllowance();
  };

  private tableMenuItems = (context: IUserContext, item: IAllowance, jobIsClosed: boolean): IMenuItem[] => {
    const allowManage = context.has(Permission.JOBS_USAGE_ALLOWANCES_MANAGE);
    const allowApprove = context.has(Permission.JOBS_USAGE_ALLOWANCES_APPROVE);

    return [
      {
        name: 'View / Edit',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.editTableItem(item)
      },
      {
        name: 'Approve',
        disabled: !!item.approved_at || !allowApprove || jobIsClosed,
        onClick: () => this.approveAllowance(item)
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.deleteItem(item)
      }
    ];
  };

  private loadAllowance(page?: number) {
    const {jobId, dispatch} = this.props;
    dispatch(loadJobAllowances(jobId, page));
  }

  private editTableItem(item: IAllowance) {
    this.setState({item});
    this.showAllowanceModal();
  }

  private approveAllowance = async (item: IAllowance) => {
    const {dispatch} = this.props;
    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          ` Approve Allowance for ${item.user.full_name} at ${moment(item.date_given).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await UsageAndActualsService.approveAllowance(item);
        this.setState({loading: false});
        this.loadAllowance();
      } else {
        return Promise.resolve();
      }
    }
  };

  private async deleteItem(item: IAllowance) {
    const {jobId, dispatch, updateLabourCounters} = this.props;
    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          `Delete Allowance for ${item.user.full_name} at ${moment(item.date_given).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await UsageAndActualsService.deleteJobAllowance(jobId, item.id);
        this.setState({loading: false});
        this.loadAllowance();
        updateLabourCounters();
      } else {
        return Promise.resolve();
      }
    }
  }

  private onSubmit = async (data: IFormValues) => {
    const {jobId, userId, addNewAllowance, updateLabourCounters} = this.props;
    if (addNewAllowance) {
      await UsageAndActualsService.createAllowance({
        ...AllowanceTransformer.convertToApi(data),
        job_id: jobId,
        creator_id: userId
      });
      this.loadAllowance();
      updateLabourCounters();
    } else {
      const convertedData = AllowanceTransformer.convertToApi(data);
      await UsageAndActualsService.updateAllowance(convertedData);
      this.loadAllowance();
    }
  };

  public render() {
    const {currentJobAllowances, addNewAllowance} = this.props;
    const {loading, showAllowanceModal, item} = this.state;

    const allowancesData = currentJobAllowances.data;
    const data = allowancesData && allowancesData.data ? allowancesData.data : [];
    const loadingStatus = currentJobAllowances.loading || loading;
    const openAllowanceModal = showAllowanceModal || addNewAllowance;

    return (
      <>
        {openAllowanceModal && (
          <ModalAllowance
            isOpen={openAllowanceModal}
            onClose={this.hideAllowanceModal}
            initialValues={
              addNewAllowance ? ({} as IAllowance) : AllowanceTransformer.convertToForm(item || ({} as IAllowance))
            }
            onSubmit={this.onSubmit}
            title={addNewAllowance ? 'Add Allowance' : 'Edit Allowance'}
            isEdit={!addNewAllowance}
          />
        )}
        {loadingStatus && <BlockLoading size={40} color={ColorPalette.white} />}
        <UsageTableLayout className="table">
          <DataGrid dataSource={data} columnsDefinition={this.allowancesColumns()} useCustomStyle={true} />
        </UsageTableLayout>
        {allowancesData && allowancesData.pagination && allowancesData.pagination.last_page > 1 && (
          <Pagination pagination={allowancesData.pagination} onChange={this.loadAllowance} />
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userId: selectCurrentUserId(state),
  currentJobAllowances: state.currentJobUsageAndActuals.labourAllowances
});

export default connect(mapStateToProps)(AllowancesTableLayout);
