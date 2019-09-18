import * as React from 'react';
import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';
import ColorPalette from 'src/constants/ColorPalette';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import {IRun} from 'src/models/IRun';
import {DropTarget, DropTargetMonitor} from 'react-dnd';
import {EssencesTypes} from 'src/constants/Operations';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import OperationsService from 'src/services/OperationsService';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import ModalOperationsRunSettings, {
  Tabs
} from 'src/components/Modal/Operations/Schedule/ModalOperationsRunSettings/ModalOperationsRunSettings';
import {IStaff, IUser} from 'src/models/IUser';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {getUserNames} from 'src/utility/Helpers';
import ReactTooltip from 'react-tooltip';
import ReactDOMServer from 'react-dom/server';
import {IVehicle} from 'src/models/IVehicle';
import {TooltipHeaderId} from 'src/components/ScheduleCalendar/ScheduleCalendar';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import Notify, {NotifyType} from 'src/utility/Notify';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';

const Block = styled(withoutProps(['width', 'dragEntered'])('div'))<{
  width: number;
  dragEntered?: boolean;
}>`
  width: ${props => props.width}px;
  min-width: ${props => props.width}px;
  height: 100%;
  border-bottom: 1px solid ${ColorPalette.gray2};
  position: relative;
  box-sizing: unset;
  padding-left: 1px;
  background: ${props => (props.dragEntered ? ColorPalette.blue0 : 'transparent')};
`;

const InnerBlock = styled.div`
  position: absolute;
  bottom: 5px;
  left: 7px;
`;

const RunName = styled.div`
  font-weight: ${Typography.weight.bold};
`;

const CogwheelButtonWrapper = styled.div`
  position: absolute;
  bottom: 7px;
  right: 7px;
  background: ${ColorPalette.white};
`;

const {Link, ColoredDiv} = StyledComponents;

interface IInputProps {
  blockWidth: number;
  newRun?: boolean;
  run?: IRun;
  createNewRun?: () => any;
  loadRuns?: () => any;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IDropProps {
  connectDropTarget: any;
  isOver: boolean;
  canDrop: boolean;
}

interface IState {
  isHovered: boolean;
  showModal: boolean;
  loading: boolean;
  startOpenTabId?: Tabs;
}

class ScheduleCalendarRunHeader extends React.PureComponent<IInputProps & IDropProps & IConnectProps, IState> {
  public state = {
    isHovered: false,
    showModal: false,
    loading: false,
    startOpenTabId: undefined
  };

  public componentDidMount() {
    ReactTooltip.rebuild();
  }
  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  private set setIsHovered(isHovered: boolean) {
    this.setState({isHovered});
  }

  private openModal = (tabId?: Tabs) => {
    this.setState({
      showModal: true,
      startOpenTabId: tabId
    });
  };

  private closeModal = () => {
    this.setState({
      showModal: false,
      startOpenTabId: undefined
    });
  };

  public render() {
    const {blockWidth, newRun, createNewRun, run, connectDropTarget, isOver, loadRuns} = this.props;
    const {isHovered, showModal, loading, startOpenTabId} = this.state;
    const assignedUsers = run ? run.assigned_users : [];
    const assignedVehicles = run ? run.assigned_vehicles : [];
    const assignedUsersNames = assignedUsers.map((user: IUser) => getUserNames(user));
    const restUsers = assignedUsersNames.filter((el, index) => index > 1);
    const assignedVehiclesRegs = assignedVehicles.map((vehicle: IVehicle) => vehicle.registration);
    const restVehicles = assignedVehiclesRegs.filter((el, index) => index > 0);

    return (
      <UserContext.Consumer>
        {context => {
          const ableToRunManage = context.has(Permission.OPERATIONS_RUNS_MANAGE);

          return connectDropTarget(
            <div className="h-100 position-relative">
              {loading && <BlockLoading size={30} color={ColorPalette.white} />}
              {run && showModal && (
                <ModalOperationsRunSettings
                  afterSubmit={loadRuns}
                  isOpen={showModal}
                  startOpenTabId={startOpenTabId}
                  onClose={this.closeModal}
                  run={run}
                  title={`Run Settings (${run.name})`}
                />
              )}
              <Block
                width={blockWidth}
                dragEntered={isOver && !newRun}
                onMouseOver={() => (this.setIsHovered = true)}
                onMouseLeave={() => (this.setIsHovered = false)}
              >
                {ableToRunManage && isHovered && !newRun && (
                  <CogwheelButtonWrapper>
                    <ColoredDiv margin="5px 0 0 0" style={{cursor: 'pointer'}}>
                      <ColoredIcon
                        color={ColorPalette.gray4}
                        name={IconName.CogWheel}
                        size={16}
                        hoverColor={ColorPalette.blue4}
                        onClick={() => this.openModal()}
                      />
                    </ColoredDiv>
                  </CogwheelButtonWrapper>
                )}
                <InnerBlock>
                  {run && (
                    <>
                      <RunName>{run.name}</RunName>
                      {assignedUsers.length > 0 || assignedVehicles.length > 0 ? (
                        <>
                          <ColoredDiv color={ColorPalette.gray4}>
                            <div
                              style={{width: 'fit-content'}}
                              data-tip={ReactDOMServer.renderToStaticMarkup(
                                <>
                                  {assignedVehiclesRegs.map((el, index) => (
                                    <div key={index}>{el}</div>
                                  ))}
                                </>
                              )}
                              data-for={TooltipHeaderId}
                            >
                              {assignedVehiclesRegs.filter((el, index) => index < 1).join(', ')}
                              {restVehicles.length > 0 && ` + ${restVehicles.length}`}
                            </div>
                          </ColoredDiv>
                          <ColoredDiv color={ColorPalette.gray4}>
                            <div
                              style={{width: 'fit-content'}}
                              data-tip={ReactDOMServer.renderToStaticMarkup(
                                <>
                                  {assignedUsersNames.map((el, index) => (
                                    <div key={index}>{el.name}</div>
                                  ))}
                                </>
                              )}
                              data-for={TooltipHeaderId}
                            >
                              {assignedUsersNames
                                .filter((el, index) => index < 2)
                                .map(el => el.initials)
                                .join(', ')}
                              {restUsers.length > 0 && ` + ${restUsers.length}`}
                            </div>
                          </ColoredDiv>
                        </>
                      ) : (
                        ableToRunManage && (
                          <ColoredDiv color={ColorPalette.blue4} className="d-flex align-items-center">
                            Add&nbsp;
                            <Link fontSize={Typography.size.normal} onClick={() => this.openModal(Tabs.Staff)}>
                              crew
                            </Link>
                            &nbsp;/&nbsp;
                            <Link fontSize={Typography.size.normal} onClick={() => this.openModal(Tabs.Vehicles)}>
                              vehicle
                            </Link>
                          </ColoredDiv>
                        )
                      )}
                    </>
                  )}
                  {ableToRunManage && newRun && (
                    <Link fontSize={Typography.size.normal} onClick={createNewRun}>
                      Add run
                    </Link>
                  )}
                </InnerBlock>
              </Block>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

type DropItemsType = IUser | IVehicle;

interface IDropItemStructure {
  item: DropItemsType;
  type: EssencesTypes;
}

const dropSpec = {
  canDrop(props: IInputProps) {
    return !props.newRun;
  },
  drop(props: IInputProps & IConnectProps, monitor: DropTargetMonitor, component: ScheduleCalendarRunHeader) {
    const {run, loadRuns} = props;
    const item: IDropItemStructure = {
      item: monitor.getItem(),
      type: monitor.getItemType() as EssencesTypes
    };
    const asyncProcess = async () => {
      component.setState({loading: true});

      try {
        switch (item.type) {
          case EssencesTypes.CREW:
            const staff = item.item as IStaff;
            await OperationsService.assignStaffToRun(run!.id, staff.id);
            if (staff.working_hours_per_week && staff.date_hours >= staff.working_hours_per_week! / 5) {
              Notify(NotifyType.Warning, `${getUserNames(staff).name} is already booked`);
            }
            EventBus.emit(EventBusEventName.StaffAssignedToTask);
            break;
          case EssencesTypes.VEHICLE:
            await OperationsService.assignVehicleToRun(run!.id, (item.item as IVehicle).id);
            EventBus.emit(EventBusEventName.VehicleAssignedToTask);
            break;
        }
        loadRuns!();
      } finally {
        component.setState({loading: false});
      }
    };

    asyncProcess();

    return item;
  }
};

const dropCollect = (dropConnect: any, monitor: DropTargetMonitor) => {
  return {
    connectDropTarget: dropConnect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default compose<React.ComponentClass<IInputProps>>(
  connect(),
  DropTarget([EssencesTypes.CREW, EssencesTypes.VEHICLE], dropSpec, dropCollect)
)(ScheduleCalendarRunHeader);
