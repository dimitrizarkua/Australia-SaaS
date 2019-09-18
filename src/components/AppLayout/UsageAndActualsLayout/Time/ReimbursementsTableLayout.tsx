import * as React from 'react';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {connect} from 'react-redux';
import moment, {Moment} from 'moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import UsageTableLayout from 'src/components/AppLayout/UsageAndActualsLayout/UsageTableLayout';
import DataGrid from 'src/components/Tables/DataGrid';
import {ColumnType, IColumn} from 'src/components/Tables/IColumn';
import {formatPrice} from 'src/utility/Helpers';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import {IReimbursement} from 'src/models/UsageAndActualsModels/IReimbursement';
import DocumentsService from 'src/services/DocumentsService';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import Permission from 'src/constants/Permission';
import {openModal} from 'src/redux/modalDucks';
import {IJobReimbursementSuccess} from 'src/services/UsageAndActuals/LabourService';
import {loadJobReimbursements} from 'src/redux/currentJob/currentJobUsageAndActuals';
import Tag from 'src/components/Tag/Tag';
import {ITag} from 'src/models/ITag';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import Pagination from 'src/components/Tables/Pagination';
import {IAppState} from 'src/redux';
import {IResource} from 'src/components/withData/withData';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import ModalReimbursement, {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalReimbursement';
import ReimbursementTransformer from 'src/transformers/ReimbursementTransformer';
import {selectCurrentUserId} from 'src/redux/userDucks';

const ActionLink = styled.div`
  cursor: pointer;
  color: ${ColorPalette.blue4};
  font-size: ${Typography.size.smaller};
`;

interface IProps {
  jobId: number;
  jobIsClosed: boolean;
  dispatch: ThunkDispatch<any, any, Action>;
  addNewReimbursement: boolean;
  hideAddReimbursement: () => void;
  updateLabourCounters: () => void;
}

interface IConnectProps {
  currentJobReimbursements: IResource<IJobReimbursementSuccess>;
  userId: number;
}

interface IState {
  loading: boolean;
  showReimbursementModal: boolean;
  item?: IReimbursement;
}

class ReimbursementsTableLayout extends React.PureComponent<IProps & IConnectProps, IState> {
  public state: IState = {
    loading: false,
    showReimbursementModal: false,
    item: undefined
  };

  private showReimbursementModal = () => this.setState({showReimbursementModal: true});

  private hideReimbursementModal = () => {
    this.setState({showReimbursementModal: false});
    this.props.hideAddReimbursement();
  };

  public componentDidMount() {
    this.loadReimbursement();
  }

  public reimbursementsColumns = (): Array<IColumn<IReimbursement>> => [
    {
      id: 'item',
      header: 'Reimbursements',
      width: '10%',
      type: ColumnType.Text,
      cell: item => <span>{moment(item.date_of_expense).format(FRONTEND_DATE)}</span>
    },
    {
      id: 'user',
      width: '15%',
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
      id: 'description',
      width: '35%',
      type: ColumnType.Text,
      cell: item => <span>{item.description}</span>
    },
    {
      id: 'amount',
      width: '15%',
      type: ColumnType.Text,
      cell: item => <ActionLink onClick={() => this.viewAttachmentRender(item.document_id)}>View attachment</ActionLink>
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

  private tableMenuItems = (context: IUserContext, item: IReimbursement, jobIsClosed: boolean): IMenuItem[] => {
    const allowManage = context.has(Permission.JOBS_USAGE_REIMBURSEMENTS_MANAGE);
    const allowApprove = context.has(Permission.JOBS_USAGE_REIMBURSEMENTS_APPROVE);

    return [
      {
        name: 'View / Edit',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.editTableItem(item)
      },
      {
        name: 'Approve',
        disabled: !!item.approved_at || !allowApprove || jobIsClosed,
        onClick: () => this.approveReimbursement(item)
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

  private approveReimbursement = async (item: IReimbursement) => {
    const {dispatch} = this.props;

    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          `Approve Reimbursement for ${item.user.full_name} at ${moment(item.date_of_expense).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await UsageAndActualsService.approveReimbursement(item);
        this.setState({loading: false});
        this.loadReimbursement();
      } else {
        return Promise.resolve();
      }
    }
  };

  private editTableItem(item: IReimbursement) {
    this.setState({item});
    this.showReimbursementModal();
  }

  private async deleteItem(item: IReimbursement) {
    const {jobId, dispatch, updateLabourCounters} = this.props;

    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          `Delete Reimbursement for ${item.user.full_name} at ${moment(item.date_of_expense).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await UsageAndActualsService.deleteJobReimbursement(jobId, item.id);
        this.setState({loading: false});
        this.loadReimbursement();
        updateLabourCounters();
      } else {
        return Promise.resolve();
      }
    }
  }

  private loadReimbursement(page?: number) {
    const {jobId, dispatch} = this.props;
    dispatch(loadJobReimbursements(jobId, page));
  }

  private async viewAttachmentRender(documentId: number) {
    this.setState({loading: true});
    const fileInfo = await DocumentsService.getDocumentInfo(documentId);
    DocumentsService.downloadDocument(documentId, fileInfo.data ? fileInfo.data.file_name : 'attachment').finally(
      () => {
        this.setState({loading: false});
      }
    );
  }

  private pendingRender(approve: Moment | null) {
    if (approve && approve.isValid()) {
      return <div>&nbsp;</div>;
    }
    return <Tag tag={{name: 'PENDING', color: ColorPalette.gray6} as ITag} />;
  }

  private onSubmit = async (data: IFormValues) => {
    const {addNewReimbursement, jobId, userId, updateLabourCounters} = this.props;
    if (addNewReimbursement) {
      await UsageAndActualsService.createReimbursement({
        ...ReimbursementTransformer.convertToApi(data),
        job_id: jobId,
        creator_id: userId
      });
      updateLabourCounters();
    } else {
      const convertedData = ReimbursementTransformer.convertToApi(data);
      await UsageAndActualsService.updateReimbursement(convertedData);
    }
    this.loadReimbursement();
  };

  public render() {
    const {currentJobReimbursements, addNewReimbursement} = this.props;
    const {loading, showReimbursementModal, item} = this.state;

    const reimbursementsData = currentJobReimbursements.data;
    const data = reimbursementsData && reimbursementsData.data ? reimbursementsData.data : [];
    const loadingStatus = currentJobReimbursements.loading || loading;
    const openReimbursementModal = showReimbursementModal || addNewReimbursement;

    return (
      <>
        {openReimbursementModal && (
          <ModalReimbursement
            isOpen={openReimbursementModal}
            onClose={this.hideReimbursementModal}
            title={addNewReimbursement ? 'Add Reimbursement' : 'Edit Reimbursement'}
            initialValues={
              addNewReimbursement
                ? ({} as IReimbursement)
                : ReimbursementTransformer.convertToForm(item || ({} as IReimbursement))
            }
            onSubmit={this.onSubmit}
            isEdit={!addNewReimbursement}
          />
        )}
        {loadingStatus && <BlockLoading size={40} color={ColorPalette.white} />}
        <UsageTableLayout className="table">
          <DataGrid dataSource={data} columnsDefinition={this.reimbursementsColumns()} useCustomStyle={true} />
        </UsageTableLayout>
        {reimbursementsData && reimbursementsData.pagination && reimbursementsData.pagination.last_page > 1 && (
          <Pagination pagination={reimbursementsData.pagination} onChange={this.loadReimbursement} />
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userId: selectCurrentUserId(state),
  currentJobReimbursements: state.currentJobUsageAndActuals.labourReimbursements
});

export default connect(mapStateToProps)(ReimbursementsTableLayout);
