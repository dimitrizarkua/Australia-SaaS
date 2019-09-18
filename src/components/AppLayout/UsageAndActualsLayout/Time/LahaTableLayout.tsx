import * as React from 'react';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {connect} from 'react-redux';
import moment, {Moment} from 'moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import UsageTableLayout from 'src/components/AppLayout/UsageAndActualsLayout/UsageTableLayout';
import DataGrid from 'src/components/Tables/DataGrid';
import {IColumn, ColumnType} from 'src/components/Tables/IColumn';
import {formatPrice} from 'src/utility/Helpers';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import ColorPalette from 'src/constants/ColorPalette';
import Permission from 'src/constants/Permission';
import {openModal} from 'src/redux/modalDucks';
import {IJobLahaSuccess} from 'src/services/UsageAndActuals/LabourService';
import {loadJobLahas} from 'src/redux/currentJob/currentJobUsageAndActuals';
import Tag from 'src/components/Tag/Tag';
import {ITag} from 'src/models/ITag';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import Pagination from 'src/components/Tables/Pagination';
import {IAppState} from 'src/redux';
import {IResource} from 'src/components/withData/withData';
import {ILaha} from 'src/models/UsageAndActualsModels/ILaha';
import NumericInput from 'src/components/Form/NumericInput';
import {debounce} from 'lodash';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import ModalLaha, {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalLaha';
import LahaTransformer from 'src/transformers/LahaTransformer';
import {selectCurrentUserId} from 'src/redux/userDucks';

interface IProps {
  jobId: number;
  jobIsClosed: boolean;
  dispatch: ThunkDispatch<any, any, Action>;
  addNewLaha: boolean;
  hideAddLaha: () => void;
  updateLabourCounters: () => void;
}

interface IConnectProps {
  currentJobLahas: IResource<IJobLahaSuccess>;
  userId: number;
}

interface IState {
  loading: boolean;
  showLahaModal: boolean;
  item?: ILaha;
}

class LahaTableLayout extends React.PureComponent<IProps & IConnectProps, IState> {
  public state: IState = {
    loading: false,
    showLahaModal: false,
    item: undefined
  };

  public componentDidMount() {
    this.loadLaha();
  }

  private showLahaModal = () => this.setState({showLahaModal: true});

  private hideLahaModal = () => {
    this.setState({showLahaModal: false});
    this.props.hideAddLaha();
  };

  public lahaColumns = (): Array<IColumn<ILaha>> => [
    {
      id: 'item',
      header: 'LAHA',
      width: '10%',
      type: ColumnType.Text,
      cell: item => <span>{moment(item.date_started).format(FRONTEND_DATE)}</span>
    },
    {
      id: 'user',
      width: '50%',
      type: ColumnType.Text,
      cell: item => <span>{item.user.full_name}</span>
    },
    {
      id: 'approve',
      width: '10%',
      type: ColumnType.Text,
      cell: item => this.pendingRender(item.approved_at ? moment(item.approved_at) : null)
    },
    {
      id: 'amount',
      width: '15%',
      type: ColumnType.Text,
      cell: item => (
        <div className="d-flex align-items-center">
          <NumericInput quantity={item.days} onChange={q => this.onChangeQuantity(q, item.id)} />
          <span style={{marginLeft: '10px'}}>days</span>
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

  private tableMenuItems = (context: IUserContext, item: ILaha, jobIsClosed: boolean): IMenuItem[] => {
    const allowManage = context.has(Permission.JOBS_USAGE_LAHA_MANAGE);
    const allowApprove = context.has(Permission.JOBS_USAGE_LAHA_APPROVE);

    return [
      {
        name: 'View / Edit',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.editTableItem(item)
      },
      {
        name: 'Approve',
        disabled: !!item.approved_at || !allowApprove || jobIsClosed,
        onClick: () => this.approveLaha(item)
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

  private editTableItem(item: ILaha) {
    this.setState({item});
    this.showLahaModal();
  }

  private approveLaha = async (item: ILaha) => {
    const {dispatch} = this.props;
    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          `Approve LAHA for ${item.user.full_name} at ${moment(item.date_started).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await UsageAndActualsService.approveLaha(item);
        this.setState({loading: false});
        this.loadLaha();
      } else {
        return Promise.resolve();
      }
    }
  };

  private async deleteItem(item: ILaha) {
    const {jobId, dispatch, updateLabourCounters} = this.props;
    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          `Delete LAHA for ${item.user.full_name} at ${moment(item.date_started).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await UsageAndActualsService.deleteJobLaha(jobId, item.id);
        this.setState({loading: false});
        this.loadLaha();
        updateLabourCounters();
      } else {
        return Promise.resolve();
      }
    }
  }

  private onChangeQuantity = (amount: number, lahaId: number) => {
    this.debouncedQuantityUpdate(amount, lahaId);
  };

  private updateQuantity = async (days: number, lahaId: number) => {
    const {jobId} = this.props;
    await UsageAndActualsService.updateJobLaha({job_id: jobId, id: lahaId, days} as ILaha);
    this.loadLaha();
  };

  private debouncedQuantityUpdate = debounce(this.updateQuantity, 1000);

  private loadLaha(page?: number) {
    const {jobId, dispatch} = this.props;
    dispatch(loadJobLahas(jobId, page));
  }

  private pendingRender(approve: Moment | null) {
    if (approve && approve.isValid()) {
      return <div>&nbsp;</div>;
    }
    return <Tag tag={{name: 'PENDING', color: ColorPalette.gray6} as ITag} />;
  }

  private onSubmit = async (data: IFormValues) => {
    const {addNewLaha, jobId, userId, updateLabourCounters} = this.props;
    if (addNewLaha) {
      await UsageAndActualsService.createLaha({
        ...LahaTransformer.convertToApi(data),
        job_id: jobId,
        creator_id: userId
      });
      updateLabourCounters();
    } else {
      const convertedData = LahaTransformer.convertToApi(data);
      await UsageAndActualsService.updateJobLaha(convertedData);
    }
    this.loadLaha();
  };

  public render() {
    const {currentJobLahas, addNewLaha} = this.props;
    const {loading, showLahaModal, item} = this.state;

    const lahaData = currentJobLahas.data;
    const data = lahaData && lahaData.data ? lahaData.data : [];
    const loadingStatus = currentJobLahas.loading || loading;
    const openLahaModal = showLahaModal || addNewLaha;

    return (
      <>
        {openLahaModal && (
          <ModalLaha
            isOpen={openLahaModal}
            onClose={this.hideLahaModal}
            onSubmit={this.onSubmit}
            title={addNewLaha ? 'Add LAHA' : 'Edit LAHA'}
            initialValues={addNewLaha ? ({} as ILaha) : LahaTransformer.convertToForm(item || ({} as ILaha))}
            isEdit={!addNewLaha}
          />
        )}
        {loadingStatus && <BlockLoading size={40} color={ColorPalette.white} />}
        <UsageTableLayout className="table">
          <DataGrid dataSource={data} columnsDefinition={this.lahaColumns()} useCustomStyle={true} />
        </UsageTableLayout>
        {lahaData && lahaData.pagination && lahaData.pagination.last_page > 1 && (
          <Pagination pagination={lahaData.pagination} onChange={this.loadLaha} />
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userId: selectCurrentUserId(state),
  currentJobLahas: state.currentJobUsageAndActuals.labourLahas
});

export default connect(mapStateToProps)(LahaTableLayout);
