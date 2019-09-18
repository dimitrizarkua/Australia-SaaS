import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import styled from 'styled-components';
import {ModalStyles} from 'src/components/Modal/ModalStyles';
import ColorPalette from 'src/constants/ColorPalette';
import DetailsForm, {
  IFormValues,
  JobTaskDetailsFormName
} from 'src/components/Modal/Jobs/ModalJobTask/JobTaskDetailsForm';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {isValid, submit} from 'redux-form';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {ITask, ITaskType} from 'src/models/ITask';
import AssignedToForm, {
  IFormValues as IAssignedFormValues,
  JobTaskAssignedToFormName
} from 'src/components/Modal/Jobs/ModalJobTask/JobTaskAssignedToForm';
import moment, {Moment} from 'moment';
import LongAlert from 'src/components/LongAlert/LongAlert';
import TabNav, {ITab} from 'src/components/TabNav/TabNav';
import {IAppState} from 'src/redux';
import TaskService from 'src/services/TaskService';
import TaskTransformer from 'src/transformers/TaskTransformer';
import {IUser} from 'src/models/IUser';
import {ITeamSimple} from 'src/models/ITeam';
import {intersection, difference} from 'lodash';
import {delay} from 'q';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';

export enum ModalModes {
  ADD_TASK_TO_RUN = 'ADD_TASK_TO_RUN'
}

export interface IAddTaskToRunConfig {
  runId: number | string;
  task: ITask;
  startHour: number | string;
  date: Moment;
}

interface IProps {
  jobId?: number;
  locationId?: number;
  locationTimeZoneOffset?: number;
  assignStaffDate?: string;
  edit: boolean;
  taskTypes: ITaskType[];
  onSave: (dataDetails: IFormValues, dataAssign: IAssignedFormValues) => any;
  doAssign: boolean;
  doSave: boolean;
  item?: ITask;
  isSchedulingActive?: boolean;
  addTaskToRunConfig?: IAddTaskToRunConfig;
  mode?: ModalModes;
}

interface IConnectProps {
  validFormDetails: boolean;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  loading: boolean;
  activeTabId: Tabs;
  detailsValues: IFormValues | null;
  assignedToValues: IAssignedFormValues | null;
  addTaskToRunFormValues: any;
}

enum Tabs {
  Details,
  AssignedTo
}

const TopMenu = styled.div`
  padding: 0 ${ModalStyles.horizontalPadding}px;
  height: 60px;
  margin: -30px -${ModalStyles.horizontalPadding}px 30px;
  border-bottom: 1px solid ${ColorPalette.gray2};
  display: flex;
`;

class ModalJobTask extends React.PureComponent<IProps & IModal & IConnectProps, IState> {
  public state = {
    loading: false,
    activeTabId: Tabs.Details,
    detailsValues: null,
    assignedToValues: null,
    addTaskToRunFormValues: {}
  };

  public componentDidMount() {
    const {addTaskToRunConfig} = this.props;

    if (addTaskToRunConfig && !!addTaskToRunConfig.startHour) {
      this.setState({
        addTaskToRunFormValues: {
          starts_at: moment(addTaskToRunConfig.date).hours(+addTaskToRunConfig.startHour),
          ends_at: moment(addTaskToRunConfig.date)
            .hours(+addTaskToRunConfig.startHour)
            .add(60, 'm')
        }
      });
    }
  }

  private onDetailsSubmit = (detailsValues: IFormValues) => {
    this.setState({detailsValues});
  };

  private onAssignedToSubmit = (assignedToValues: IAssignedFormValues) => {
    this.setState({assignedToValues});
  };

  private submitCombine = async () => {
    const {dispatch, onSave, onClose, doAssign, item, doSave} = this.props;

    this.setState({loading: true});

    dispatch(submit(JobTaskDetailsFormName));
    dispatch(submit(JobTaskAssignedToFormName));

    await delay(100);

    try {
      if (doSave) {
        let task: ITask;

        const res = await this.onInternalSave();
        task = res!.data;

        if (doAssign && (!!item || !!task!)) {
          await this.onInternalAssign(item || task!);
        }
      }

      const {detailsValues, assignedToValues} = this.state;

      await onSave(detailsValues!, assignedToValues!);

      EventBus.emit(EventBusEventName.TaskWasUpdated);

      // hack to avoid changing state of unmounted component
      setTimeout(onClose);
    } finally {
      this.setState({loading: false});
    }
  };

  private onInternalSave = async () => {
    const {edit, item, jobId} = this.props;
    const {detailsValues} = this.state;

    if (detailsValues) {
      const task = TaskTransformer.dehydrate(detailsValues);

      if (!edit && jobId) {
        return await TaskService.createJobTask(jobId, task);
      } else if (item) {
        return await TaskService.updateJobTask(item.job_id, item.id, task);
      }
    }

    return;
  };

  private onInternalAssign = async (taskToAssign?: ITask) => {
    const {assignedToValues: data} = this.state;
    if (data && taskToAssign) {
      const id = taskToAssign.job_id;
      const existedUsersId = (taskToAssign.assigned_users || []).map((el: IUser) => el.id);
      const newUsersId = ((data as IAssignedFormValues).selectedUsers || []).map((el: IUser) => el.id);
      const existedTeamsId = (taskToAssign.assigned_teams || []).map((el: ITeamSimple) => el.id);
      const newTeamsId = ((data as IAssignedFormValues).selectedTeams || []).map((el: ITeamSimple) => el.id);
      const usersIntersection = intersection(existedUsersId, newUsersId);
      const teamsIntersection = intersection(existedTeamsId, newTeamsId);
      const usersToAdd = difference(newUsersId, usersIntersection);
      const usersToRemove = difference(existedUsersId, usersIntersection);
      const teamsToAdd = difference(newTeamsId, teamsIntersection);
      const teamsToRemove = difference(existedTeamsId, teamsIntersection);

      await Promise.all([
        Promise.all(usersToAdd.map(el => TaskService.assignUserToJobTask(id, taskToAssign.id, el))),
        Promise.all(usersToRemove.map(el => TaskService.removeUserFromJobTask(id, taskToAssign.id, el))),
        Promise.all(teamsToAdd.map(el => TaskService.assignTeamToJobTask(id, taskToAssign.id, el))),
        Promise.all(teamsToRemove.map(el => TaskService.removeTeamFromJobTask(id, taskToAssign.id, el)))
      ]);

      EventBus.emit(EventBusEventName.StaffAssignedToTask);
    }
  };

  private isKPIMissed = () => {
    const {item} = this.props;

    return !!item && moment().isAfter(moment(item.due_at).subtract(item.type.kpi_hours || 0, 'h'));
  };

  private tabs: ITab[] = [
    {
      name: 'Details',
      id: Tabs.Details,
      onClick: () => this.setState({activeTabId: Tabs.Details})
    },
    {
      name: 'Assigned To',
      id: Tabs.AssignedTo,
      onClick: () => this.setState({activeTabId: Tabs.AssignedTo}),
      disabled:
        (!!this.props.mode && this.props.mode === ModalModes.ADD_TASK_TO_RUN) ||
        !this.props.locationId ||
        !this.props.assignStaffDate
    }
  ];

  private applyLocationTimezoneOffset = () => {
    const {item, locationTimeZoneOffset} = this.props;

    if (item && locationTimeZoneOffset && item.starts_at && item.ends_at) {
      return {
        ...item,
        starts_at: moment(item.starts_at).add(locationTimeZoneOffset, 'm'),
        ends_at: moment(item.ends_at).add(locationTimeZoneOffset, 'm')
      };
    } else {
      return item || {};
    }
  };

  private renderBody = () => {
    const {
      taskTypes,
      edit,
      item,
      isSchedulingActive,
      addTaskToRunConfig,
      mode,
      locationId,
      assignStaffDate
    } = this.props;
    const {activeTabId, addTaskToRunFormValues} = this.state;
    const KPIIsMissed = this.isKPIMissed();
    const modeCondition = !mode || (mode && mode !== ModalModes.ADD_TASK_TO_RUN);

    return (
      <>
        {modeCondition && (
          <TopMenu>
            <TabNav selectedTabId={activeTabId} items={this.tabs} />
          </TopMenu>
        )}
        <div style={{display: activeTabId === Tabs.Details ? 'block' : 'none'}}>
          {KPIIsMissed && (
            <div>
              <LongAlert>The KPI for this task was missed.</LongAlert>
            </div>
          )}
          <DetailsForm
            taskTypes={taskTypes}
            kpiIsMissed={KPIIsMissed}
            canBeScheduled={item && item.type.can_be_scheduled}
            canEditDueDate={item && item.type.allow_edit_due_date}
            initialValues={Object.assign(this.applyLocationTimezoneOffset(), addTaskToRunFormValues)}
            addTaskToRunConfig={addTaskToRunConfig}
            mode={mode}
            onSubmit={this.onDetailsSubmit}
            isSchedulingActive={!!isSchedulingActive}
            edit={edit}
          />
        </div>
        <div style={{display: activeTabId === Tabs.AssignedTo ? 'block' : 'none'}}>
          <AssignedToForm
            item={item}
            onSubmit={this.onAssignedToSubmit}
            locationId={locationId}
            date={assignStaffDate}
          />
        </div>
      </>
    );
  };

  private renderFooter = () => {
    return (
      <PrimaryButton className="btn" disabled={!this.props.validFormDetails} onClick={this.submitCombine}>
        Save
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, onClose, edit} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          title={`${edit ? 'Edit' : 'Add'} Task`}
          body={this.renderBody()}
          footer={this.renderFooter()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  validFormDetails: isValid(JobTaskDetailsFormName)(state)
});

export default connect(mapStateToProps)(ModalJobTask);
