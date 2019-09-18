import * as React from 'react';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import styled from 'styled-components';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import TaskListItem from 'src/components/AppLayout/JobsLayout/JobLayout/ScheduleAndTasks/TaskListItem';
import ColorPalette from 'src/constants/ColorPalette';
import {ITask, ITaskType, TaskStatuses} from 'src/models/ITask';
import {RouteComponentProps, withRouter} from 'react-router';
import withData, {IResource} from 'src/components/withData/withData';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import TaskService, {IJobTasksSuccess, ITaskTypesSuccess} from 'src/services/TaskService';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ModalJobTask from 'src/components/Modal/Jobs/ModalJobTask/ModalJobTask';
import TaskTransformer from 'src/transformers/TaskTransformer';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {openModal} from 'src/redux/modalDucks';
import {IAppState} from 'src/redux';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';

interface IParams {
  id: string;
}

interface IWithDataProps {
  tasks: IResource<IJobTasksSuccess>;
  taskTypes: IResource<ITaskTypesSuccess>;
}

interface IConnectProps {
  currentJob: ICurrentJob;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  showModal: boolean;
  editTask: boolean;
  task: ITask;
}

const Wrapper = styled.div`
  display: flex;
  flex-grow: 1;
  position: relative;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  background: ${ColorPalette.gray0};
`;

const UpperWrapper = styled.div`
  padding: 17px 30px 0;
`;

const GroupHolder = styled.div`
  border-bottom: 1px solid ${ColorPalette.gray2};
  margin-bottom: 30px;
`;

const TasksHolder = styled.div`
  margin-top: 30px;
  position: relative;
  width: 100%;
  min-height: 60px;
`;

const Title = StyledComponents.SortedGroupTitle;

class JobScheduleNTasks extends React.PureComponent<
  RouteComponentProps<IParams> & IWithDataProps & IConnectProps,
  IState
> {
  public state = {
    showModal: false,
    editTask: false,
    task: {} as ITask
  };

  public componentDidMount() {
    const {
      match: {
        params: {id}
      },
      tasks: {fetch},
      taskTypes: {fetch: fetchTypes}
    } = this.props;

    fetch(id);
    fetchTypes();
  }

  private convertTaskTypes = (): ITaskType[] => {
    const {
      taskTypes: {data}
    } = this.props;

    if (data) {
      return data.data;
    } else {
      return [];
    }
  };

  private onSave = async () => {
    const {
      match: {
        params: {id}
      },
      tasks: {fetch}
    } = this.props;

    fetch(id);
  };

  private getSortedTasks = (): {completed: ITask[]; notCompleted: ITask[]} => {
    const {
      tasks: {data}
    } = this.props;
    const result = {
      completed: [] as ITask[],
      notCompleted: [] as ITask[]
    };

    if (data) {
      result.completed = data.data.filter(task => task.latest_status.status === TaskStatuses.Completed);
      result.notCompleted = data.data.filter(task => task.latest_status.status === TaskStatuses.Active);
    }

    return result;
  };

  private editTask = (task: ITask) => {
    this.setState({
      showModal: true,
      editTask: true,
      task
    });
  };

  private deleteTask = async (task: ITask) => {
    const {
      dispatch,
      match: {
        params: {id}
      },
      tasks: {fetch}
    } = this.props;
    const res = await dispatch(openModal('Confirm', `Delete task #${task.id} ${task.name}?`));

    if (res) {
      await TaskService.removeTaskFromJob(id, task.id);
      fetch(id);
    }
  };

  private showAddNewTaskModal = () => {
    this.setState({
      editTask: false,
      showModal: true
    });
  };

  public render() {
    const {showModal, editTask, task} = this.state;
    const {
      tasks: {loading: loadingTasks, fetch},
      match: {
        params: {id}
      },
      currentJob: {data}
    } = this.props;
    const sortedTasks = this.getSortedTasks();

    return (
      <UserContext.Consumer>
        {context => {
          const canCreateTasks = context.has(Permission.JOBS_TASK_MANAGE);
          const locationId = (data && data.id === +id && data.assigned_location_id) || undefined;

          return (
            <Wrapper>
              {showModal && (
                <ModalJobTask
                  locationId={locationId}
                  jobId={+id}
                  edit={editTask}
                  item={editTask ? TaskTransformer.hydrate(task) : null}
                  isOpen={showModal}
                  onClose={() => this.setState({showModal: false})}
                  onSave={this.onSave}
                  doAssign={true}
                  doSave={true}
                  taskTypes={this.convertTaskTypes()}
                />
              )}
              {canCreateTasks && (
                <UpperWrapper className="d-flex justify-content-end w-100">
                  <PrimaryButton
                    className="btn"
                    onClick={this.showAddNewTaskModal}
                    disabled={!!data && data.edit_forbidden}
                  >
                    Add Task
                  </PrimaryButton>
                </UpperWrapper>
              )}
              <TasksHolder>
                {loadingTasks && <BlockLoading size={40} color={ColorPalette.gray0} />}
                {sortedTasks.notCompleted.length > 0 && (
                  <GroupHolder style={{width: '100%'}}>
                    {sortedTasks.notCompleted.map(el => (
                      <TaskListItem
                        onTaskEdit={() => this.editTask(el)}
                        jobId={+id}
                        fetch={() => fetch(id)}
                        deleteTask={() => this.deleteTask(el)}
                        key={el.id}
                        item={el}
                      />
                    ))}
                  </GroupHolder>
                )}
                {sortedTasks.completed.length > 0 && (
                  <GroupHolder style={{width: '100%'}}>
                    <Title padding="0 30px 10px 30px">Completed</Title>
                    {sortedTasks.completed.map(el => (
                      <TaskListItem
                        onTaskEdit={() => this.editTask(el)}
                        jobId={+id}
                        fetch={() => fetch(id)}
                        deleteTask={() => this.deleteTask(el)}
                        key={el.id}
                        item={el}
                      />
                    ))}
                  </GroupHolder>
                )}
              </TasksHolder>
            </Wrapper>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({currentJob: state.currentJob});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter,
  withData<{}>({
    tasks: {
      fetch: TaskService.getJobTasks
    },
    taskTypes: {
      fetch: TaskService.getTaskTypes
    }
  })
)(JobScheduleNTasks);
