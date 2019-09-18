import {IAllowance, IAllowanceType} from 'src/models/UsageAndActualsModels/IAllowance';
import HttpService from 'src/services/HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IJobAllowanceSuccess} from 'src/services/UsageAndActuals/LabourService';
import {orderBy} from 'lodash';

const getAllowanceTypes = async (): Promise<IAllowanceType[]> => {
  const res = await HttpService.get<IListEnvelope<IAllowanceType>>('/v1/usage-and-actuals/allowance-types');
  return res.data;
};

const createAllowance = (config: Partial<IAllowance> & {job_id: number}) => {
  const {job_id} = config;
  return HttpService.post(`/v1/jobs/${job_id}/allowances`, config);
};

const updateAllowance = (config: IAllowance) => {
  const {job_id, id} = config;
  return HttpService.patch(`/v1/jobs/${job_id}/allowances/${id}`, config);
};

const approveAllowance = (config: IAllowance) => {
  const {job_id, id} = config;
  return HttpService.post(`/v1/jobs/${job_id}/allowances/${id}/approve`);
};

const getJobAllowances = async (jobId: number, params?: {}): Promise<IJobAllowanceSuccess> => {
  const res = await HttpService.get<IJobAllowanceSuccess>(`/v1/jobs/${jobId}/allowances`, params);
  return {data: orderBy(res.data, ['date_given', 'user.full_name'], ['desc', 'asc']), pagination: res.pagination};
};

const deleteJobAllowance = (jobId: number, allowanceId: number) => {
  return HttpService.remove<any>(`/v1/jobs/${jobId}/allowances/${allowanceId}`);
};

export default {
  getAllowanceTypes,
  createAllowance,
  updateAllowance,
  getJobAllowances,
  deleteJobAllowance,
  approveAllowance
};
