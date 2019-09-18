import * as React from 'react';
import styled from 'styled-components';
import {ITask} from 'src/models/ITask';
import withoutProps from 'src/components/withoutProps/withoutProps';
import moment, {Moment} from 'moment';
import {ScheduleConfig} from 'src/components/ScheduleCalendar/ScheduleCalendar';
import {colorTransformer} from 'src/utility/Helpers';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import {ITeamSimple} from 'src/models/ITeam';
import {IUser} from 'src/models/IUser';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {openModal} from 'src/redux/modalDucks';
import TaskService from 'src/services/TaskService';
import {IRun} from 'src/models/IRun';
import ModalJobTask, {IAddTaskToRunConfig} from 'src/components/Modal/Jobs/ModalJobTask/ModalJobTask';
import TaskTransformer from 'src/transformers/TaskTransformer';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';
import DateTransformer from 'src/transformers/DateTransformer';
import {IFormValues} from 'src/components/Modal/Jobs/ModalJobTask/JobTaskDetailsForm';
import {ILocation} from 'src/models/IAddress';

const TaskContainer = styled.div<{
  top?: number;
  color?: string;
  height: number;
  isHovered: boolean;
}>`
  position: absolute;
  top: ${props => props.top}px;
  left: 0;
  width: calc(100% - 15px);
  color: ${props => props.color};
  box-shadow: 4px 0 0 ${props => props.color} inset;
  height: ${props => props.height || 0}px;
  font-size: 0.72em;
  ${props => props.isHovered && 'z-index: 100;'}
`;

const TaskBackground = styled(withoutProps(['color'])('div'))<{
  color?: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.color};
  opacity: 0.1;
`;

const DropDownTriggerHolder = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  z-index: 5;
  cursor: pointer;
`;

const {ColoredDiv} = StyledComponents;

const TaskInner = styled(withoutProps(['showWhite'])(ColoredDiv))<{
  showWhite: boolean;
}>`
  min-height: 100%;
  margin-left: 5px;
  background: ${props => (props.showWhite ? `${ColorPalette.white}dc` : 'transparent')};
`;

interface IInputProps {
  task: ITask;
  run: IRun;
  loadRuns: () => any;
  location: ILocation;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  top: number;
  height: number;
  isHovered: boolean;
  showModal: boolean;
  isVeryShort: boolean;
}

class ScheduleCalendarRunTask extends React.PureComponent<IInputProps & IConnectProps, IState> {
  public state = {
    top: 0,
    height: 0,
    isHovered: false,
    showModal: false,
    isVeryShort: false
  };

  public componentDidMount() {
    this.calculateTaskState();
  }

  public componentDidUpdate(prevProps: IInputProps) {
    const {task} = this.props;

    if ((prevProps && task.starts_at !== prevProps.task.starts_at) || task.ends_at !== prevProps.task.ends_at) {
      this.calculateTaskState();
    }

    if (this.refInner.current && this.refOuter.current) {
      this.setState({isVeryShort: this.refInner.current.clientHeight > this.refOuter.current.clientHeight});
    }
  }

  private calculateTaskState = () => {
    const {task, location} = this.props;
    const taskStartMoment = moment(task.starts_at).utcOffset(location.tz_offset);
    const taskEndMoment = moment(task.ends_at).utcOffset(location.tz_offset);
    const scheduleStartUnix = moment()
      .hours(ScheduleConfig.startHours)
      .minutes(0)
      .unix();
    const scheduleEndUnix = moment()
      .hours(ScheduleConfig.endHours)
      .minutes(0)
      .unix();
    const deltaUnix = scheduleEndUnix - scheduleStartUnix;
    const taskStartOnCurrentMomentUnix = moment()
      .hours(taskStartMoment.hours())
      .minutes(taskStartMoment.minutes())
      .unix();
    const taskEndOnCurrentMomentUnix = moment()
      .hours(taskEndMoment.hours())
      .minutes(taskEndMoment.minutes())
      .unix();
    const taskTopOffset =
      ((taskStartOnCurrentMomentUnix - scheduleStartUnix) *
        ((ScheduleConfig.endHours - ScheduleConfig.startHours) * ScheduleConfig.blockHeight)) /
      deltaUnix;
    const taskHeight =
      ((taskEndOnCurrentMomentUnix - taskStartOnCurrentMomentUnix) *
        ((ScheduleConfig.endHours - ScheduleConfig.startHours) * ScheduleConfig.blockHeight)) /
      deltaUnix;

    this.setState({
      top: taskTopOffset,
      height: taskHeight
    });
  };

  private set setIsHovered(isHovered: boolean) {
    this.setState({isHovered});
  }

  private set setShowModal(showModal: boolean) {
    this.setState({showModal});
  }

  private removeTaskFromRun = async () => {
    const {task, dispatch, loadRuns, run} = this.props;
    const res = await dispatch(openModal('Confirm', `Remove task(${task.type.name})?`));

    if (res) {
      await TaskService.removeTaskFromRun(run.id, task.id);
      EventBus.emit(EventBusEventName.TaskWasRemovedFromRun);
      loadRuns();
    }
  };

  private menuItems = (): IMenuItem[] => {
    return [
      {
        name: 'Edit',
        onClick: async () => (this.setShowModal = true)
      },
      {
        type: 'divider'
      },
      {
        name: 'Remove',
        onClick: this.removeTaskFromRun
      }
    ];
  };

  private onSave = async (data: IFormValues) => {
    const {task, loadRuns, run, location} = this.props;

    if (data) {
      try {
        await TaskService.addTaskToRun(run.id, task.id, {
          starts_at: DateTransformer.dehydrateDateTime(
            (data.starts_at as Moment).add(-location.tz_offset, 'm')
          ) as string,
          ends_at: DateTransformer.dehydrateDateTime((data.ends_at as Moment).add(-location.tz_offset, 'm')) as string
        });
        loadRuns();
      } catch (e) {
        throw false;
      }
    } else {
      throw false;
    }
  };

  private refOuter: React.RefObject<HTMLDivElement> = React.createRef();
  private refInner: React.RefObject<HTMLDivElement> = React.createRef();

  public render() {
    const {task, run, location} = this.props;
    const {top, isHovered, height, showModal, isVeryShort} = this.state;
    const color = task.type.color ? colorTransformer(task.type.color) : ColorPalette.gray5;
    const usersAndTeams = (task.assigned_teams || [])
      .map((el: ITeamSimple) => el.name)
      .concat(task.assigned_users.map((el: IUser) => el.full_name) as any);

    return (
      <UserContext.Consumer>
        {context => {
          const ableToEditTaskFromRun =
            context.has(Permission.OPERATIONS_RUNS_MANAGE) && context.has(Permission.JOBS_TASK_MANAGE);

          return (
            <>
              {showModal && (
                <ModalJobTask
                  edit={true}
                  locationId={run.location_id}
                  locationTimeZoneOffset={location.tz_offset}
                  taskTypes={[task.type]}
                  onSave={this.onSave}
                  isOpen={showModal}
                  item={TaskTransformer.hydrate(task)}
                  isSchedulingActive={true}
                  doAssign={true}
                  doSave={true}
                  assignStaffDate={run.date}
                  onClose={() => (this.setShowModal = false)}
                  addTaskToRunConfig={
                    {
                      runId: run.id,
                      date: moment(run.date),
                      task
                    } as IAddTaskToRunConfig
                  }
                />
              )}
              <TaskContainer
                innerRef={this.refOuter}
                isHovered={isHovered}
                top={top}
                height={height}
                color={color}
                onMouseOver={() => (this.setIsHovered = true)}
                onMouseLeave={() => (this.setIsHovered = false)}
              >
                {ableToEditTaskFromRun && isHovered && (
                  <DropDownTriggerHolder>
                    <DropdownMenuControl
                      noMargin={true}
                      trigger={() => <ColoredIcon color={color} name={IconName.MenuHorizontal} size={18} />}
                      items={this.menuItems()}
                    />
                  </DropDownTriggerHolder>
                )}
                <TaskInner
                  className={`w-100 ${isHovered ? 'h-auto' : 'h-100'}`}
                  showWhite={isHovered && isVeryShort}
                  overflow="hidden"
                >
                  <TaskBackground color={color} />
                  <ColoredDiv padding="5px" className="zindex-dropdown" innerRef={this.refInner}>
                    <ColoredDiv weight={Typography.weight.bold}>
                      {moment(task.starts_at)
                        .utcOffset(location.tz_offset)
                        .format('hh:mma')}{' '}
                      -{' '}
                      {moment(task.ends_at)
                        .utcOffset(location.tz_offset)
                        .format('hh:mma')}
                    </ColoredDiv>
                    <div>#{task.job.id}</div>
                    {task.job.site_address && task.job.site_address.full_address && (
                      <div>{task.job.site_address.full_address}</div>
                    )}
                    <div>{task.type.name}</div>
                    {usersAndTeams.length > 0 && (
                      <ColoredDiv margin="7px 0 0 0" className="d-flex">
                        <ColoredDiv margin="0 5px 0 0" className="flex-shrink-0">
                          <ColoredIcon color={color} name={IconName.People} size={12} />
                        </ColoredDiv>
                        <div className="flex-grow-1">{usersAndTeams.join(', ')}</div>
                      </ColoredDiv>
                    )}
                  </ColoredDiv>
                </TaskInner>
              </TaskContainer>
            </>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<IInputProps>>(connect())(ScheduleCalendarRunTask);
