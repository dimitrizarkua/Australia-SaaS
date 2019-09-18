import HttpService from 'src/services/HttpService';
import {ILaha, ILahaCompensation} from 'src/models/UsageAndActualsModels/ILaha';
import {IJobLahaSuccess} from 'src/services/UsageAndActuals/LabourService';
import {orderBy} from 'lodash';
import {IListEnvelope} from 'src/models/IEnvelope';

const createLaha = (config: ILaha) => {
  const {job_id} = config;
  return HttpService.post(`/v1/jobs/${job_id}/laha`, config);
};

const getJobLahas = async (jobId: number, params?: {}): Promise<IJobLahaSuccess> => {
  const res = await HttpService.get<IJobLahaSuccess>(`/v1/jobs/${jobId}/laha`, params);
  return {data: orderBy(res.data, ['date_started', 'user.full_name'], ['desc', 'asc']), pagination: res.pagination};
};

const updateJobLaha = (config: ILaha) => {
  const {job_id, id} = config;
  return HttpService.patch<any>(`/v1/jobs/${job_id}/laha/${id}`, config);
};

const deleteJobLaha = (jobId: number, lahaId: number) => {
  return HttpService.remove<any>(`/v1/jobs/${jobId}/laha/${lahaId}`);
};

const getLahaCompensations = async () => {
  const res = await HttpService.get<IListEnvelope<ILahaCompensation>>(`/v1/usage-and-actuals/laha-compensations`);
  return res.data;
};

const approveLaha = (config: ILaha) => {
  const {job_id, id} = config;
  return HttpService.post(`/v1/jobs/${job_id}/laha/${id}/approve`);
};

export default {createLaha, getJobLahas, updateJobLaha, deleteJobLaha, getLahaCompensations, approveLaha};
