import HttpService, {IRequestPaginationConfig} from './HttpService';
import {IObjectEnvelope, IListEnvelope} from 'src/models/IEnvelope';
import {
  IJob,
  IContactAssignment,
  IAssignment,
  ILinkedJob,
  JobStatuses,
  IRecurringJob,
  IRecurringJobSimple
} from 'src/models/IJob';
import {ITagsSuccess} from './TagService';
import {IUsersSuccess} from './UserService';
import JobTransformer from 'src/transformers/JobTransformer';
import ContactAssignmentTransformer from 'src/transformers/ContactAssignmentTransformer';
import {INamedEntity} from 'src/models/IEntity';
import {IPhoto} from 'src/models/IPhoto';
import {EntityTypes, IUserTeamSimple} from 'src/models/ITeam';
import {getUserNames} from 'src/utility/Helpers';
import {IAddMaterialToJobConfig, IMaterialInfo} from 'src/models/UsageAndActualsModels/IMaterial';
import PageSizes from 'src/constants/PageSizes';
import {IEquipmentInfo, IAddEquipmentToJobConfig} from 'src/models/UsageAndActualsModels/IEquipment';
import {orderBy} from 'lodash';
import {IJobUsageSummary} from 'src/models/UsageAndActualsModels/IJobSummary';
import {IJobCostingCounters} from 'src/models/UsageAndActualsModels/IJobCostingCounters';

export type IJobSuccess = IObjectEnvelope<IJob>;
export type IJobsSuccess = IListEnvelope<IJob>;
export type IJobServicesSuccess = IListEnvelope<INamedEntity>;
export type IAssignmentSuccess = IListEnvelope<IAssignment>;
export type IJobNextStatusesSuccess = IObjectEnvelope<string[]>;
export type ILinkedJobsSuccess = IListEnvelope<ILinkedJob>;
export type IPhotosSuccess = IListEnvelope<IPhoto>;
export type IPreviousJobsSuccess = IListEnvelope<IRecurringJob>;
export type IJobCostingSummarySuccess = IObjectEnvelope<IJobUsageSummary>;
export type IJobCostingCountersSuccess = IObjectEnvelope<IJobCostingCounters>;

interface INextStatus {
  status: JobStatuses;
  note: string;
}

const getJobName = (job: Partial<IJob> | ILinkedJob) => {
  return `#${job.id}${job.assigned_location ? `-${job.assigned_location.code}` : ''}`;
};

const getJobAddress = (job: Partial<IJob>) => {
  return (job && job.site_address && job.site_address.full_address) || 'No Site Address Specified';
};

const findById = async (id: string | number): Promise<IJob> => {
  const res = await HttpService.get<IObjectEnvelope<any>>(`/v1/jobs/${id}`);
  return JobTransformer.hydrate(res.data);
};

const getInboxJobs = async (params: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>('/v1/jobs/inbox', params);
};

const getMineJobs = async (params: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>('/v1/jobs/mine', params);
};

const getAllJobs = async (params: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>('/v1/jobs/mine/active', params);
};

const getTeamJobs = async (id: string | number, params?: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>(`/v1/jobs/mine/teams/${id}`, params);
};

const getClosedJobs = async (params: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>('/v1/jobs/mine/closed', params);
};

const getNoContactJobs = async (params: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>('/v1/jobs/mine/no-contact', params);
};

const getUpcomingKPIJobs = async (params: {}): Promise<IJobsSuccess> => {
  return await HttpService.get<IJobsSuccess>('/v1/jobs/mine/upcoming-kpi', params);
};

const getServices = async (): Promise<IJobServicesSuccess> => {
  return await HttpService.get<IJobServicesSuccess>('/v1/jobs/services', {per_page: PageSizes.Huge});
};

const deprecatedUpdate = (id: string | number, data: Partial<IJob>): Promise<IJob> => {
  const jobData = JobTransformer.dehydrate(data);
  return update(id, jobData);
};

// TODO specify proper type for PATCH data
const update = (id: string | number, data: Partial<IJob>) => {
  return HttpService.patch<IJobSuccess>(`/v1/jobs/${id}`, data)
    .then(res => JobTransformer.hydrate(res.data))
    .catch(err => Promise.reject(JobTransformer.hydrateError(err)));
};

const getTags = async (id: string | number): Promise<ITagsSuccess> => {
  return await HttpService.get<ITagsSuccess>(`/v1/jobs/${id}/tags`);
};

const assignTag = async (id: string | number, tagId: string | number): Promise<ITagsSuccess> => {
  return await HttpService.post<ITagsSuccess>(`/v1/jobs/${id}/tags/${tagId}`);
};

const removeTag = async (id: string | number, tagId: string | number): Promise<ITagsSuccess> => {
  return await HttpService.remove<ITagsSuccess>(`/v1/jobs/${id}/tags/${tagId}`);
};

const getUsers = async (id: string | number): Promise<IUserTeamSimple[]> => {
  const users = await HttpService.get<IUsersSuccess>(`/v1/jobs/${id}/users`);

  return users.data.map(user => {
    const userNames = getUserNames(user);
    return {
      id: user.id,
      name: userNames.name,
      type: 'user'
    } as IUserTeamSimple;
  });
};

const getTeams = async (id: string | number): Promise<IUserTeamSimple[]> => {
  const teams = await HttpService.get<IListEnvelope<INamedEntity>>(`/v1/jobs/${id}/teams`);

  return teams.data.map(
    team =>
      ({
        ...team,
        type: 'team'
      } as IUserTeamSimple)
  );
};

const assignUser = async (id: string | number, userId: string | number): Promise<IUsersSuccess> => {
  return await HttpService.post<IUsersSuccess>(`/v1/jobs/${id}/users/${userId}`);
};

const assignUserOrTeam = async (
  id: string | number,
  userOrTeamId: string | number,
  type: EntityTypes
): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${id}/${type}s/${userOrTeamId}`);
};

const removeUserOrTeam = async (
  id: string | number,
  userOrTeamId: string | number,
  type: EntityTypes
): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${id}/${type}s/${userOrTeamId}`);
};

const getAssignmentTypes = async (): Promise<IAssignment[]> => {
  const res = await HttpService.get<IAssignmentSuccess>('/v1/jobs/contacts/assignments/types', {
    per_page: PageSizes.Huge
  });
  return res.data;
};

const getContacts = async (id: string | number): Promise<IContactAssignment[]> => {
  const res = await HttpService.get<IListEnvelope<IContactAssignment>>(`/v1/jobs/${id}/contacts/assignments`);

  return res.data.map((r: IContactAssignment) => ContactAssignmentTransformer.hydrate(r));
};

const updateAssignment = async (
  jobId: string | number,
  contactId: string | number,
  params: {}
): Promise<IContactAssignment[]> => {
  const res = await HttpService.patch<IListEnvelope<IContactAssignment>>(
    `/v1/jobs/${jobId}/contacts/assignments/${contactId}`,
    params
  );
  return res.data.map((r: IContactAssignment) => ContactAssignmentTransformer.hydrate(r));
};

const createAssignment = async (
  jobId: string | number,
  contactId: string | number,
  params: {}
): Promise<IContactAssignment[]> => {
  const res = await HttpService.post<IListEnvelope<IContactAssignment>>(
    `/v1/jobs/${jobId}/contacts/assignments/${contactId}`,
    params
  );
  return res.data.map((r: IContactAssignment) => ContactAssignmentTransformer.hydrate(r));
};

const removeAssignment = async (
  jobId: string | number,
  contactId: string | number,
  params: {}
): Promise<IContactAssignment[]> => {
  const res = await HttpService.remove<IListEnvelope<IContactAssignment>>(
    `/v1/jobs/${jobId}/contacts/assignments/${contactId}`,
    params
  );
  return res.data.map((r: IContactAssignment) => ContactAssignmentTransformer.hydrate(r));
};

const getJobNextStatuses = async (jobId: string | number): Promise<IJobNextStatusesSuccess> => {
  return await HttpService.get<IJobNextStatusesSuccess>(`/v1/jobs/${jobId}/next-statuses`);
};

const applyNewJobStatus = async (jobId: string | number, params: INextStatus): Promise<string> => {
  return await HttpService.patch<string>(`/v1/jobs/${jobId}/status`, params);
};

const getLinkedJobs = async (jobId: string | number): Promise<ILinkedJobsSuccess> => {
  return await HttpService.get<ILinkedJobsSuccess>(`/v1/jobs/${jobId}/linked-jobs`);
};

const removeLink = async (fromId: string | number, toId: string | number): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${fromId}/jobs/${toId}`);
};

const linkJobs = async (fromId: string | number, toId: string | number): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${fromId}/jobs/${toId}`);
};

const mergeJobs = async (fromId: string | number, toId: string | number): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${fromId}/jobs/${toId}/merge`);
};

const pinJob = async (id: string | number): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${id}/pin`);
};

const unpinJob = async (id: string | number): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${id}/pin`);
};

const createJob = (data: Partial<IJob>): Promise<IJobSuccess> => {
  const jobData = JobTransformer.dehydrate(data);
  return HttpService.post<IJobSuccess>(`/v1/jobs`, jobData).catch(err =>
    Promise.reject(JobTransformer.hydrateError(err))
  );
};

const duplicateJob = (id: number): Promise<IJobSuccess> => {
  return HttpService.post<IJobSuccess>(`/v1/jobs/${id}/duplicate`);
};

const removeJob = async (id: number | string): Promise<IJobSuccess> => {
  return await HttpService.remove<IJobSuccess>(`/v1/jobs/${id}`);
};

const followJob = async (id: number | string): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${id}/follow`);
};

const unfollowJob = async (id: number | string): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${id}/follow`);
};

const getJobPhotos = async (id: number | string): Promise<IPhotosSuccess> => {
  return await HttpService.get<IPhotosSuccess>(`/v1/jobs/${id}/photos`);
};

const attachPhoto = async (
  jobId: number | string,
  photoId: number | string,
  data: {description: string}
): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${jobId}/photos/${photoId}`, data);
};

const updateAttachedPhoto = async (
  jobId: number | string,
  photoId: number | string,
  data: {description: string}
): Promise<any> => {
  return await HttpService.patch<any>(`/v1/jobs/${jobId}/photos/${photoId}`, data);
};

const detachPhoto = async (jobId: number | string, photoId: number | string): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${jobId}/photos/${photoId}`);
};

const snoozeJob = async (id: number | string, snoozedUntil: string): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${id}/snooze`, {snoozed_until: snoozedUntil});
};

const unSnoozeJob = async (id: number | string): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${id}/unsnooze`);
};

const markJobAsRead = async (id: number): Promise<any> => {
  return await HttpService.patch<any>(`/v1/jobs/${id}/messages/read`);
};

const markJobAsUnread = async (id: number): Promise<any> => {
  return await HttpService.patch<any>(`/v1/jobs/${id}/messages/unread`);
};

const getPreviousJobs = async (id: number): Promise<IPreviousJobsSuccess> => {
  return await HttpService.get<IPreviousJobsSuccess>(`/v1/jobs/${id}/previous`);
};

const createRecurringJob = async (config: IRecurringJobSimple): Promise<any> => {
  return await HttpService.post<any>('/v1/jobs/recurring', config);
};

const searchJobs = async (id: number | string, config?: Partial<IRequestPaginationConfig>): Promise<IJob[]> => {
  const res = await HttpService.get<IListEnvelope<any>>('/v1/jobs/search', {id, ...config});
  return res.data;
};

const getJobMaterials = async (jobId: number): Promise<IMaterialInfo[]> => {
  const res = await HttpService.get<any>(`/v1/jobs/${jobId}/materials`);
  return res.data;
};

const addMaterialToJob = async (jobId: number, config: IAddMaterialToJobConfig) => {
  return await HttpService.post<any>(`/v1/jobs/${jobId}/materials`, config);
};

const updateJobMaterial = async (jobId: number, materialId: number, config: Partial<IAddMaterialToJobConfig>) => {
  return await HttpService.patch<any>(`/v1/jobs/${jobId}/materials/${materialId}`, config);
};

const deleteJobMaterial = async (jobId: number, materialId: number) => {
  return await HttpService.remove<any>(`/v1/jobs/${jobId}/materials/${materialId}`);
};

const getJobMaterial = async (jobId: number, materialId: number) => {
  return await HttpService.get<any>(`/v1/jobs/${jobId}/materials/${materialId}`);
};

const getJobEquipments = async (jobId: number): Promise<IEquipmentInfo[]> => {
  const res = await HttpService.get<any>(`/v1/jobs/${jobId}/equipment`);
  return orderBy(res.data, ['started_at', 'equipment.model'], ['desc', 'asc']);
};

const deleteJobEquipment = (jobId: number, equipmentId: number) => {
  return HttpService.remove<any>(`/v1/jobs/${jobId}/equipment/${equipmentId}`);
};

const updateJobEquipmentFinishUsing = (jobId: number, equipmentId: number, endedAt: string) => {
  return HttpService.patch<any>(`/v1/jobs/${jobId}/equipment/${equipmentId}/finish-using`, {ended_at: endedAt});
};

const updateJobEquipmentOverride = (jobId: number, equipmentId: number, intervalsCountOverride: number) => {
  return HttpService.patch<any>(`/v1/jobs/${jobId}/equipment/${equipmentId}/override`, {
    intervals_count_override: intervalsCountOverride
  });
};

const addEquipmentToJob = (jobId: number, config: IAddEquipmentToJobConfig) => {
  return HttpService.post<any>(`/v1/jobs/${jobId}/equipment`, config);
};

const getJobUsageSummary = (jobId: number) => {
  return HttpService.get<IJobCostingSummarySuccess>(`/v1/jobs/${jobId}/summary`);
};

const getJobCostingCounters = (jobId: number) => {
  return HttpService.get<IJobCostingCountersSuccess>(`/v1/jobs/${jobId}/costing-counters`);
};

export default {
  getJobName,
  getJobAddress,
  findById,
  deprecatedUpdate,
  update,
  getInboxJobs,
  getMineJobs,
  getAllJobs,
  getTeamJobs,
  getNoContactJobs,
  getClosedJobs,
  getUpcomingKPIJobs,
  getServices,
  getTags,
  assignTag,
  removeTag,
  getUsers,
  assignUser,
  removeUserOrTeam,
  getContacts,
  updateAssignment,
  createAssignment,
  removeAssignment,
  getAssignmentTypes,
  getJobNextStatuses,
  applyNewJobStatus,
  getLinkedJobs,
  linkJobs,
  removeLink,
  pinJob,
  unpinJob,
  mergeJobs,
  createJob,
  duplicateJob,
  removeJob,
  followJob,
  unfollowJob,
  getJobPhotos,
  attachPhoto,
  updateAttachedPhoto,
  detachPhoto,
  snoozeJob,
  unSnoozeJob,
  assignUserOrTeam,
  getTeams,
  markJobAsRead,
  markJobAsUnread,
  getPreviousJobs,
  createRecurringJob,
  searchJobs,
  getJobMaterials,
  addMaterialToJob,
  updateJobMaterial,
  deleteJobMaterial,
  getJobMaterial,
  getJobUsageSummary,
  getJobEquipments,
  deleteJobEquipment,
  updateJobEquipmentFinishUsing,
  addEquipmentToJob,
  updateJobEquipmentOverride,
  getJobCostingCounters
};
