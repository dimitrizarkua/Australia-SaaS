import {ITask, ITaskType, TaskStatuses} from '../models/ITask';
import HttpService from './HttpService';
import {IListEnvelope, IObjectEnvelope} from '../models/IEnvelope';

export type ITaskTypeSuccess = IObjectEnvelope<ITaskType>;
export type ITaskTypesSuccess = IListEnvelope<ITaskType>;
export type IJobTasksSuccess = IListEnvelope<ITask>;
export type IJobTaskSuccess = IObjectEnvelope<ITask>;

const getTaskTypes = async (): Promise<ITaskTypesSuccess> => {
  return await HttpService.get<ITaskTypesSuccess>('/v1/jobs/tasks/types');
};

const createTaskType = async (config: Partial<ITaskType>): Promise<ITaskTypeSuccess> => {
  return await HttpService.post<ITaskTypeSuccess>('/v1/jobs/tasks/types', config);
};

const getJobTasks = async (id: number | string): Promise<IJobTasksSuccess> => {
  return await HttpService.get<IJobTasksSuccess>(`/v1/jobs/${id}/tasks`);
};

const createJobTask = async (jobId: number | string, config: any): Promise<IJobTaskSuccess> => {
  return await HttpService.post<IJobTaskSuccess>(`/v1/jobs/${jobId}/tasks`, config);
};

const updateJobTask = async (jobId: number | string, taskId: number, config: any): Promise<IJobTaskSuccess> => {
  return await HttpService.patch<IJobTaskSuccess>(`/v1/jobs/${jobId}/tasks/${taskId}`, config);
};

const assignUserToJobTask = async (jobId: any, taskId: any, userId: any) => {
  return await HttpService.post(`/v1/jobs/${jobId}/tasks/${taskId}/crew/${userId}`);
};

const removeUserFromJobTask = async (jobId: any, taskId: any, userId: any) => {
  return await HttpService.remove(`/v1/jobs/${jobId}/tasks/${taskId}/crew/${userId}`);
};

const assignTeamToJobTask = async (jobId: any, taskId: any, teamId: any) => {
  return await HttpService.post(`/v1/jobs/${jobId}/tasks/${taskId}/teams/${teamId}`);
};

const removeTeamFromJobTask = async (jobId: any, taskId: any, teamId: any) => {
  return await HttpService.remove(`/v1/jobs/${jobId}/tasks/${taskId}/teams/${teamId}`);
};

export interface IStatusConfig {
  status: TaskStatuses;
}

const changeTaskStatus = async (jobId: any, taskId: any, config: IStatusConfig) => {
  return await HttpService.patch(`/v1/jobs/${jobId}/tasks/${taskId}/status`, config);
};

const changeTaskScheduledStatus = async (jobId: any, taskId: any, config: IStatusConfig) => {
  return await HttpService.patch(`/v1/jobs/${jobId}/tasks/${taskId}/status/scheduled`, config);
};

const removeTaskFromJob = async (jobId: any, taskId: any) => {
  return await HttpService.remove(`/v1/jobs/${jobId}/tasks/${taskId}`);
};

export interface ISearchTasksConfig {
  location_id: number;
  term: string;
}

const searchTasks = async (searchConfig: ISearchTasksConfig): Promise<IListEnvelope<ITask>> => {
  return await HttpService.get<any>('/v1/operations/tasks/search', searchConfig);
};

const getTasksFromLocation = async (locationId: number): Promise<IListEnvelope<ITask>> => {
  return await HttpService.get<any>('/v1/operations/tasks', {location_id: locationId});
};

export interface IScheduleTaskDates {
  starts_at: string;
  ends_at: string;
}

const addTaskToRun = async (runId: number, taskId: number, config: IScheduleTaskDates) => {
  return await HttpService.post<any>(`/v1/operations/runs/${runId}/tasks/${taskId}`, config);
};

const removeTaskFromRun = async (runId: number, taskId: number) => {
  return await HttpService.remove<any>(`/v1/operations/runs/${runId}/tasks/${taskId}`);
};

const snoozeTask = (jobId: number, taskId: number, config: {snoozed_until: string}) => {
  return HttpService.post<any>(`/v1/jobs/${jobId}/tasks/${taskId}/snooze`, config);
};

const unsnoozeTask = (jobId: number, taskId: number) => {
  return HttpService.remove<any>(`/v1/jobs/${jobId}/tasks/${taskId}/unsnooze`);
};

export default {
  getTaskTypes,
  createTaskType,
  getJobTasks,
  createJobTask,
  updateJobTask,
  assignUserToJobTask,
  removeUserFromJobTask,
  assignTeamToJobTask,
  removeTeamFromJobTask,
  changeTaskStatus,
  changeTaskScheduledStatus,
  removeTaskFromJob,
  searchTasks,
  addTaskToRun,
  removeTaskFromRun,
  getTasksFromLocation,
  snoozeTask,
  unsnoozeTask
};
