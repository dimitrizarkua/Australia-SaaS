import * as React from 'react';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import Permission from 'src/constants/Permission';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {openModal} from 'src/redux/modalDucks';
import {connect} from 'react-redux';
import moment, {Moment} from 'moment';
import {FRONTEND_DATE, BACKEND_DATE_TIME, FRONTEND_TIME} from 'src/constants/Date';
import {ILabour} from 'src/models/UsageAndActualsModels/ILabour';
import UsageTableLayout from '../UsageTableLayout';
import {IResource} from 'src/components/withData/withData';
import LabourService, {IJobLabourSuccess} from 'src/services/UsageAndActuals/LabourService';
import {IAppState} from 'src/redux';
import {
  loadJobLabours,
  toggleSelection,
  massSelect,
  resetSelection
} from 'src/redux/currentJob/currentJobUsageAndActuals';
import {IColumn, ColumnType} from 'src/components/Tables/IColumn';
import ReactDatetime from 'react-datetime';
import {formatPrice, convertIntToTimeString, convertIntToTime, contvertTimeToMinutes} from 'src/utility/Helpers';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import DataGrid from 'src/components/Tables/DataGrid';
import Pagination from 'src/components/Tables/Pagination';
import {debounce} from 'lodash';
import StrongSpan from 'src/components/Layout/StrongSpan';
import ModalLabour, {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalLabour';
import LabourTransformer from 'src/transformers/LabourTransformer';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import {selectCurrentUserId} from 'src/redux/userDucks';
import CheckboxSimple from 'src/components/Form/CheckboxSimple';
import LabourSelectingPanel from './LabourSelectingPanel';

interface IProps {
  jobId: number;
  jobIsClosed: boolean;
  hideRates: boolean;
  hideMultiselect: boolean;
  dispatch: ThunkDispatch<any, any, Action>;
  addNewLabour: boolean;
  hideAddLabour: () => void;
  updateLabourCounters: () => void;
}

interface IConnectProps {
  currentJobLabours: IResource<IJobLabourSuccess>;
  selectedLabourIds: Array<number | string>;
  userId: number;
}

interface IState {
  loading: boolean;
  showLabourModal: boolean;
  item?: ILabour;
  allSelected: boolean;
  isMultiEdit: boolean;
}

enum dateType {
  EndDate,
  StartDate
}

class LabourTableLayout extends React.PureComponent<IProps & IConnectProps, IState> {
  public state: IState = {
    loading: false,
    showLabourModal: false,
    item: undefined,
    allSelected: false,
    isMultiEdit: false
  };

  public componentDidMount() {
    this.loadLabour();
  }

  public componentDidUpdate() {
    const {selectedLabourIds, currentJobLabours} = this.props;
    if (currentJobLabours.data && selectedLabourIds.length < currentJobLabours.data.data.length) {
      this.setState({allSelected: false});
    } else {
      this.setState({allSelected: true});
    }
  }

  public labourColumns = (): Array<IColumn<ILabour>> => [
    {
      id: 'multiselectColumn',
      header: <CheckboxSimple size={15} value={this.state.allSelected} onChange={this.selectAll} />,
      width: '5%',
      type: ColumnType.Text,
      hidden: this.props.hideMultiselect,
      cell: item => (
        <CheckboxSimple size={15} value={this.labourIsSelected(+item.id)} onChange={() => this.toggleSelection(item)} />
      )
    },
    {
      id: 'item',
      header: <StrongSpan>Labour</StrongSpan>,
      width: '10%',
      type: ColumnType.Text,
      cell: item => (
        <span>
          {moment(item.started_at_override)
            .utcOffset(0)
            .format(FRONTEND_DATE)}
        </span>
      )
    },
    {
      id: 'worker',
      width: '15%',
      type: ColumnType.Text,
      cell: item => <span>{item.worker.full_name}</span>
    },
    {
      id: 'labour_type_name',
      type: ColumnType.Text,
      cell: item => <span>{item.labour_type.name}</span>
    },
    {
      id: 'period',
      width: '230px',
      type: ColumnType.Text,
      cell: item => (
        <div className="d-flex align-items-center">
          <ReactDatetime
            dateFormat={false}
            viewMode="time"
            timeFormat={FRONTEND_TIME}
            onChange={d => this.onDateChange(d, dateType.StartDate, item.id)}
            value={moment(item.started_at_override).utcOffset(0)}
          />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>to</span>
          <ReactDatetime
            dateFormat={false}
            viewMode="time"
            timeFormat={FRONTEND_TIME}
            onChange={d => this.onDateChange(d, dateType.EndDate, item.id)}
            value={moment(item.ended_at_override).utcOffset(0)}
          />
        </div>
      )
    },
    {
      id: 'break',
      width: '90px',
      type: ColumnType.Text,
      cell: item => (
        <ReactDatetime
          dateFormat={false}
          timeFormat="HH:mm"
          viewMode="time"
          onChange={d => this.onChangeBreak(d, item.id)}
          value={convertIntToTime(item.break)}
        />
      )
    },
    {
      id: 'first_tier_time_amount',
      header: '1.0x',
      width: '5%',
      type: ColumnType.Numeric,
      hidden: this.props.hideRates,
      cell: item => <span>{convertIntToTimeString(item.first_tier_time_amount)}</span>
    },
    {
      id: 'second_tier_time_amount',
      header: '1.5x',
      width: '5%',
      type: ColumnType.Numeric,
      hidden: this.props.hideRates,
      cell: item => <span>{convertIntToTimeString(item.second_tier_time_amount)}</span>
    },
    {
      id: 'third_tier_time_amount',
      header: '2.0x',
      width: '5%',
      type: ColumnType.Numeric,
      hidden: this.props.hideRates,
      cell: item => <span>{convertIntToTimeString(item.third_tier_time_amount)}</span>
    },
    {
      id: 'fourth_tier_time_amount',
      header: '2.5x',
      width: '5%',
      type: ColumnType.Numeric,
      hidden: this.props.hideRates,
      cell: item => <span>{convertIntToTimeString(item.fourth_tier_time_amount)}</span>
    },
    {
      id: 'total_hrs',
      header: 'Total Hrs',
      width: '7%',
      type: ColumnType.Numeric,
      cell: item => (
        <StrongSpan>
          {convertIntToTimeString(
            item.first_tier_time_amount +
              item.second_tier_time_amount +
              item.third_tier_time_amount +
              item.fourth_tier_time_amount
          )}
        </StrongSpan>
      )
    },
    {
      id: 'total_amount',
      header: 'Total Cost',
      width: '10%',
      type: ColumnType.Numeric,
      cell: item => <StrongSpan>{formatPrice(item.calculated_total_amount)}</StrongSpan>
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

  private onDateChange = (date: Moment | string, type: dateType, labourId: number) => {
    this.debouncedDateUpdate(date, type, labourId);
  };

  private updateDate = async (date: Moment | string, type: dateType, labourId: number) => {
    const {jobId} = this.props;
    const dateMoment = moment(date);

    switch (type) {
      case dateType.StartDate:
        await LabourService.updateJobLabour(jobId, labourId, {
          started_at_override: moment(dateMoment).format(BACKEND_DATE_TIME)
        });
        break;
      case dateType.EndDate:
        await LabourService.updateJobLabour(jobId, labourId, {
          ended_at_override: moment(dateMoment).format(BACKEND_DATE_TIME)
        });
        break;
    }

    this.loadLabour();
  };

  private debouncedDateUpdate = debounce(this.updateDate, 1000);

  private onChangeBreak = (breakProp: Moment | string, labourId: number) => {
    const breakToLabour = contvertTimeToMinutes(breakProp);
    this.debouncedBreakUpdate(breakToLabour, labourId);
  };

  private updateBreak = async (breakToLabour: number, labourId: number) => {
    const {jobId} = this.props;
    await LabourService.updateJobLabour(jobId, labourId, {
      break: breakToLabour
    });
    this.loadLabour();
  };

  private debouncedBreakUpdate = debounce(this.updateBreak, 1000);

  private tableMenuItems = (context: IUserContext, item: ILabour, jobIsClosed: boolean): IMenuItem[] => {
    const allowManage = context.has(Permission.JOBS_USAGE_LABOUR_MANAGE);

    return [
      {
        name: 'View / Edit',
        disabled: !allowManage || jobIsClosed,
        onClick: () => this.editTableItem(item)
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

  private editTableItem(item: ILabour) {
    this.setState({item});
    this.showLabourModal();
  }

  private async deleteItem(item: ILabour) {
    const {jobId, dispatch, updateLabourCounters} = this.props;
    if (item.id) {
      const res = await dispatch(
        openModal(
          'Confirm',
          `Delete Labour for ${item.worker.full_name} at ${moment(item.started_at_override).format(FRONTEND_DATE)}?`
        )
      );

      if (res) {
        this.setState({loading: true});
        await LabourService.deleteJobLabour(jobId, item.id);
        this.setState({loading: false});
        this.loadLabour();
        updateLabourCounters();
      } else {
        return Promise.resolve();
      }
    }
  }

  private loadLabour(page?: number) {
    const {jobId, dispatch} = this.props;
    dispatch(loadJobLabours(jobId, page));
  }

  private showLabourModal = () => this.setState({showLabourModal: true, isMultiEdit: false});

  private hideLabourModal = () => {
    this.setState({showLabourModal: false});
    this.props.hideAddLabour();
  };

  private onSubmit = async (data: IFormValues) => {
    const {userId, addNewLabour, jobId, updateLabourCounters, selectedLabourIds} = this.props;
    const {isMultiEdit} = this.state;
    this.setState({loading: true});

    if (addNewLabour) {
      await UsageAndActualsService.createLabour({
        ...LabourTransformer.dehydrateToAdd(data),
        job_id: jobId,
        creator_id: userId
      });
      updateLabourCounters();
      this.loadLabour();
      this.setState({loading: false});
    } else {
      const convertedData = LabourTransformer.dehydrateToEdit(data);
      const ids = isMultiEdit ? selectedLabourIds : [data.id];

      Promise.all(ids.map(id => UsageAndActualsService.updateJobLabour(jobId, +id, convertedData))).finally(() => {
        this.loadLabour();
        this.setState({loading: false});
      });
    }
  };

  private selectAll = () => {
    const {currentJobLabours} = this.props;
    this.setState({allSelected: !this.state.allSelected}, () => {
      if (this.state.allSelected && currentJobLabours.data && currentJobLabours.data.data.length) {
        this.props.dispatch(massSelect(currentJobLabours.data.data));
      } else {
        this.props.dispatch(resetSelection());
      }
    });
  };

  private toggleSelection = (item: ILabour) => {
    this.props.dispatch(toggleSelection(item));
  };

  private labourIsSelected = (id: number) => {
    const {selectedLabourIds} = this.props;
    if (selectedLabourIds) {
      return selectedLabourIds.includes(id);
    }
    return false;
  };

  private onDeleteSelected = async () => {
    const {jobId, dispatch, updateLabourCounters, selectedLabourIds} = this.props;
    if (selectedLabourIds.length > 0) {
      const res = await dispatch(openModal('Confirm', `Delete selected Labour items?`));

      if (res) {
        this.setState({loading: true});
        selectedLabourIds.forEach(async id => {
          await LabourService.deleteJobLabour(jobId, +id);
        });

        this.setState({loading: false});
        this.loadLabour();
        updateLabourCounters();
        this.props.dispatch(resetSelection());
      } else {
        return Promise.resolve();
      }
    }
  };

  private onEditSelected = () => {
    if (this.props.selectedLabourIds.length > 0) {
      this.setState({showLabourModal: true, isMultiEdit: true});
    }
  };

  public render() {
    const {currentJobLabours, addNewLabour, selectedLabourIds, hideMultiselect} = this.props;
    const {loading, showLabourModal, item, isMultiEdit} = this.state;

    const labourData = currentJobLabours.data;
    const data = labourData && labourData.data ? labourData.data : [];
    const loadingStatus = currentJobLabours.loading || loading;
    const openLabourModal = showLabourModal || addNewLabour;
    const emptyInitialValue = addNewLabour || isMultiEdit;

    return (
      <>
        {openLabourModal && (
          <ModalLabour
            isOpen={openLabourModal}
            onClose={this.hideLabourModal}
            initialValues={emptyInitialValue ? ({} as ILabour) : LabourTransformer.hydrate(item || ({} as ILabour))}
            onSubmit={this.onSubmit}
            title={addNewLabour ? 'Add Labour' : isMultiEdit ? 'Edit selected Labour records' : 'Edit Labour'}
            isEdit={!addNewLabour}
            isMultiEdit={isMultiEdit}
          />
        )}
        {loadingStatus && <BlockLoading size={40} color={ColorPalette.white} />}
        <LabourSelectingPanel
          hidden={hideMultiselect}
          onDeleteSelected={this.onDeleteSelected}
          onEditSelected={this.onEditSelected}
          selected={selectedLabourIds.length}
        />
        <UsageTableLayout className="table">
          <DataGrid dataSource={data} columnsDefinition={this.labourColumns()} useCustomStyle={true} />
        </UsageTableLayout>
        {labourData && labourData.pagination && labourData.pagination.last_page > 1 && (
          <Pagination pagination={labourData.pagination} onChange={this.loadLabour} />
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userId: selectCurrentUserId(state),
  currentJobLabours: state.currentJobUsageAndActuals.labours,
  selectedLabourIds: state.currentJobUsageAndActuals.selectedLabourIds
});

export default connect(mapStateToProps)(LabourTableLayout);
