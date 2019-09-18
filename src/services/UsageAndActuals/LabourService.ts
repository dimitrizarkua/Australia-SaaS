import HttpService from 'src/services/HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IAllowance} from 'src/models/UsageAndActualsModels/IAllowance';
import {orderBy} from 'lodash';
import {ILabour, ILabourType, IEditLabourRequest, IAddLabourRequest} from 'src/models/UsageAndActualsModels/ILabour';
import {IReimbursement} from 'src/models/UsageAndActualsModels/IReimbursement';
import {ILaha} from 'src/models/UsageAndActualsModels/ILaha';

export type IJobLabourSuccess = IListEnvelope<ILabour>;
export type IJobAllowanceSuccess = IListEnvelope<IAllowance>;
export type IJobReimbursementSuccess = IListEnvelope<IReimbursement>;
export type IJobLahaSuccess = IListEnvelope<ILaha>;

const getJobLabours = async (jobId: number, params?: {}): Promise<IJobLabourSuccess> => {
  const res = await HttpService.get<IJobLabourSuccess>(`/v1/jobs/${jobId}/labours`, params);
  return {
    data: orderBy(res.data, ['started_at_override', 'worker.full_name'], ['desc', 'asc']),
    pagination: res.pagination
  };
};

const deleteJobLabour = (jobId: number, labourId: number) => {
  return HttpService.remove<any>(`/v1/jobs/${jobId}/labours/${labourId}`);
};

const updateJobLabour = (jobId: number, labourId: number, request: Partial<IEditLabourRequest>) => {
  return HttpService.patch<any>(`/v1/jobs/${jobId}/labours/${labourId}`, request);
};

const getLabourTypes = async (): Promise<ILabourType[]> => {
  const res = await HttpService.get<IListEnvelope<ILabourType>>('/v1/usage-and-actuals/labour-types');
  return res.data;
};

const createLabour = (request: Partial<IAddLabourRequest>) => {
  return HttpService.post(`/v1/jobs/${request.job_id}/labours`, request);
};

export default {
  getJobLabours,
  createLabour,
  deleteJobLabour,
  updateJobLabour,
  getLabourTypes
};
