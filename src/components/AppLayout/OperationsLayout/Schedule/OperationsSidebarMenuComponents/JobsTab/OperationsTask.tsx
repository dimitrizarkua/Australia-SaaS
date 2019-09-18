import * as React from 'react';
import {ITask} from 'src/models/ITask';
import {Link} from 'react-router-dom';
import moment, {Moment} from 'moment';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import {IconName} from 'src/components/Icon/Icon';
import OperationsSidebarMenuUnitWrapper from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuUnitWrapper';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import {ILocation} from 'src/models/IAddress';
import styled from 'styled-components';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import ContactService from 'src/services/ContactService';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import TaskService from 'src/services/TaskService';
import {BACKEND_DATE_TIME, FRONTEND_DATE_TIME} from 'src/constants/Date';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';
import {IMenuProps} from 'src/components/Dropdown/Dropdown';
import {css} from 'glamor';
import ReactDatetime from 'react-datetime';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {openModal} from 'src/redux/modalDucks';
import ModalJobTask, {IAddTaskToRunConfig} from 'src/components/Modal/Jobs/ModalJobTask/ModalJobTask';
import TaskTransformer from 'src/transformers/TaskTransformer';
import {IFormValues} from 'src/components/Modal/Jobs/ModalJobTask/JobTaskDetailsForm';
import DateTransformer from 'src/transformers/DateTransformer';

const DropdownWrap = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const AdditionalData = styled.div`
  font-size: ${Typography.size.smaller};
  margin-top: 0.6em;
`;

const SiteContact = styled.div`
  color: ${ColorPalette.gray4};
`;

const InternalNote = styled.div`
  color: ${ColorPalette.gray3};
`;

const datePickerStyle = css({
  padding: 0,
  '& .rdtPicker': {
    border: 0,
    padding: 0
  }
});

export interface IInputProps {
  task: ITask;
  locationArea: ILocation | null;
  date?: Moment;
  currentTime?: Moment; // for tests
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  datePickerLoading: boolean;
  showDatePicker: boolean;
  date: Moment | null;
  showEditModal: boolean;
}

class OperationsTask extends React.Component<IInputProps & IConnectProps, IState> {
  public state = {
    datePickerLoading: false,
    showDatePicker: false,
    date: null,
    showEditModal: false
  };

  private dropdownTriggerRender = () => <ColoredIcon name={IconName.MenuVertical} color={ColorPalette.black0} />;

  private datePickerRender = () => {
    return (
      <ReactDatetime
        input={false}
        timeFormat={true}
        isValidDate={(current: Date) => {
          const now = moment();
          return moment(current).isAfter(now);
        }}
        onChange={date => {
          this.setState({date: date as Moment});
        }}
      />
    );
  };

  private isValidateCustomSnoozeDate = () => {
    const {date} = this.state;

    return !!date && (date as Moment).isAfter(moment());
  };

  private snoozeTaskUntilCustomDate = async (task: ITask, menuProps: IMenuProps) => {
    const {date} = this.state;

    if (!!date) {
      this.setState({datePickerLoading: true});

      try {
        await this.snoozeTask(task, date as Moment);
        menuProps.close();
      } finally {
        this.setState({datePickerLoading: false});
      }
    }
  };

  private taskMenuItems = (task: ITask, context: IUserContext): IMenuItem[] => {
    const {showDatePicker, datePickerLoading} = this.state;
    const ifNotSnoozed: IMenuItem[] = [
      {
        name: 'Snooze for one day',
        onClick: () => this.snoozeTask(task, moment().add(1, 'd')),
        disabled: !context.has(Permission.JOBS_TASK_MANAGE)
      },
      {
        name: 'Snooze for one week',
        onClick: () => this.snoozeTask(task, moment().add(7, 'd')),
        disabled: !context.has(Permission.JOBS_TASK_MANAGE)
      },
      {
        name: 'Snooze for one month',
        onClick: () => this.snoozeTask(task, moment().add(1, 'M')),
        disabled: !context.has(Permission.JOBS_TASK_MANAGE)
      },
      {
        customElements: (menuProps: IMenuProps) => (
          <>
            {showDatePicker ? (
              <div className="position-relative" style={{background: ColorPalette.white, padding: '0 1.5rem'}}>
                {datePickerLoading && <BlockLoading size={30} color={ColorPalette.white} />}
                {this.datePickerRender()}
                <ColoredDiv padding="10px 0">
                  <PrimaryButton
                    className="btn"
                    disabled={!this.isValidateCustomSnoozeDate()}
                    onClick={() => this.snoozeTaskUntilCustomDate(task, menuProps)}
                  >
                    Snooze
                  </PrimaryButton>
                </ColoredDiv>
              </div>
            ) : (
              'Snooze (choose date)'
            )}
          </>
        ),
        classNames: showDatePicker ? `${datePickerStyle}` : '',
        onClick: showDatePicker ? undefined : this.showDatePicker,
        noClose: true,
        disabled: !context.has(Permission.JOBS_TASK_MANAGE),
        onOutsideClick: this.closeDatePicker
      }
    ];
    const ifSnoozed: IMenuItem[] = [
      {
        name: 'Unsnooze',
        onClick: async () => await this.unsnoozeTask(task),
        disabled: !context.has(Permission.JOBS_TASK_MANAGE)
      }
    ];
    const options = task.snoozed_until ? ifSnoozed : ifNotSnoozed;

    return [
      {
        name: 'Edit',
        onClick: this.showEditModal,
        disabled: !context.has(Permission.JOBS_TASK_MANAGE)
      },
      {
        type: 'divider'
      },
      ...options,
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: this.removeTask,
        disabled: !context.has(Permission.JOBS_TASK_MANAGE)
      }
    ];
  };

  private removeTask = async () => {
    const {task, dispatch} = this.props;
    const confirm = await dispatch(openModal('Confirm', `Delete task ${task.type.name}?`));

    if (confirm) {
      await TaskService.removeTaskFromJob(task.job_id, task.id);
      EventBus.emit(EventBusEventName.TaskWasSnoozed);
    }
  };

  private showDatePicker = () => {
    this.setState({showDatePicker: true});
  };

  private closeDatePicker = () => {
    this.setState({showDatePicker: false});
  };

  private showEditModal = () => {
    this.setState({showEditModal: true});
  };

  private closeEditModal = () => {
    this.setState({showEditModal: false});
  };

  private snoozeTask = async (task: ITask, until: Moment) => {
    await TaskService.snoozeTask(task.job_id, task.id, {
      snoozed_until: until.add(-until.utcOffset(), 'm').format(BACKEND_DATE_TIME)
    });
    EventBus.emit(EventBusEventName.TaskWasSnoozed);
  };

  private unsnoozeTask = async (task: ITask) => {
    await TaskService.unsnoozeTask(task.job_id, task.id);
    EventBus.emit(EventBusEventName.TaskWasUnsnoozed);
  };

  private onTaskUpdate = async (data: IFormValues) => {
    const {locationArea} = this.props;
    const t = TaskTransformer.dehydrate(data) as ITask;

    if (data && locationArea) {
      try {
        await TaskService.addTaskToRun(t.job_run_id, t.id, {
          starts_at: DateTransformer.dehydrateDateTime(
            (data.starts_at as Moment).add(-locationArea.tz_offset, 'm')
          ) as string,
          ends_at: DateTransformer.dehydrateDateTime(
            (data.ends_at as Moment).add(-locationArea.tz_offset, 'm')
          ) as string
        });
      } catch (e) {
        throw false;
      }
    } else {
      throw false;
    }

    EventBus.emit(EventBusEventName.TaskWasAddedToRun);
  };

  private isScheduled = () => {
    const {task} = this.props;

    return !!task.starts_at && !!task.ends_at;
  };

  public render() {
    const {task, locationArea, date, currentTime: ct} = this.props;
    const currentTime = ct || moment();
    const dueTime = moment(task.due_at);
    const hoursLeft = dueTime.diff(currentTime, 'h');
    const diffDuration = moment.duration(dueTime.diff(currentTime));
    const kpi = task.type.kpi_hours || 12;
    const isTimeOnFire = hoursLeft < kpi;
    const {showEditModal} = this.state;

    return (
      <UserContext.Consumer>
        {context => (
          <>
            {showEditModal && (
              <ModalJobTask
                locationId={task.job.assigned_location_id}
                edit={true}
                taskTypes={[task.type]}
                locationTimeZoneOffset={locationArea ? locationArea.tz_offset : undefined}
                isSchedulingActive={this.isScheduled()}
                onSave={this.onTaskUpdate}
                isOpen={showEditModal}
                doSave={true}
                doAssign={true}
                item={TaskTransformer.hydrate(task)}
                onClose={this.closeEditModal}
                addTaskToRunConfig={
                  this.isScheduled()
                    ? ({
                        date
                      } as IAddTaskToRunConfig)
                    : undefined
                }
              />
            )}
            <OperationsSidebarMenuUnitWrapper>
              <ColoredDiv fontSize={Typography.size.smaller}>
                <ColoredDiv padding="0 30px 0 0" className="d-flex justify-content-between">
                  <ColoredDiv weight={Typography.weight.bold}>
                    {task.job.site_address ? task.job.site_address!.full_address : 'No Site Address'}
                  </ColoredDiv>
                  <Link to={`/job/${task.job.id}/details`} style={{whiteSpace: 'nowrap'}}>
                    #{`${task.job.id}${locationArea && `-${locationArea.code}`}`}
                  </Link>
                </ColoredDiv>
                <ColoredDiv padding="0 30px 0 0" className="d-flex justify-content-between">
                  <div>{task.type.name}</div>
                  <ColoredDiv color={ColorPalette.gray4} className="d-flex">
                    {dueTime.format('D MMM, A')}
                    {isTimeOnFire && (
                      <>
                        &nbsp;|&nbsp;
                        <ColoredDiv
                          className="close-to-kpi"
                          weight={Typography.weight.bold}
                          color={hoursLeft > kpi / 2 ? ColorPalette.orange2 : ColorPalette.red1}
                        >
                          {hoursLeft > -1
                            ? `${`0${hoursLeft}`.slice(-2)}:${moment(diffDuration.asMilliseconds()).format('mm')}`
                            : '00:00'}
                          hrs
                        </ColoredDiv>
                      </>
                    )}
                  </ColoredDiv>
                </ColoredDiv>
              </ColoredDiv>
              {(task.job.site_contact || task.internal_note) && (
                <AdditionalData>
                  {task.job.site_contact && (
                    <SiteContact>
                      {ContactService.getContactName(task.job.site_contact)}
                      {ContactService.getContactPhone(task.job.site_contact) &&
                        `: ${ContactService.getContactPhone(task.job.site_contact)}`}
                    </SiteContact>
                  )}
                  {task.internal_note && <InternalNote>{task.internal_note}</InternalNote>}
                </AdditionalData>
              )}
              {task.snoozed_until && (
                <ColoredDiv color={ColorPalette.orange2} fontSize={Typography.size.smaller} margin="10px 0 0 0">
                  Snoozed until {moment(task.snoozed_until).format(FRONTEND_DATE_TIME)}
                </ColoredDiv>
              )}
              <DropdownWrap>
                <DropdownMenuControl
                  trigger={this.dropdownTriggerRender}
                  items={this.taskMenuItems(task, context)}
                  direction="right"
                />
              </DropdownWrap>
            </OperationsSidebarMenuUnitWrapper>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default connect()(OperationsTask);

export const InternalComponent = OperationsTask;
