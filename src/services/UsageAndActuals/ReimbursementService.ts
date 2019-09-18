import HttpService from 'src/services/HttpService';
import {IJobReimbursementSuccess} from 'src/services/UsageAndActuals/LabourService';
import {orderBy} from 'lodash';
import {IReimbursement} from 'src/models/UsageAndActualsModels/IReimbursement';

const createReimbursement = (config: Partial<IReimbursement> & {job_id: number}) => {
  const {job_id} = config;
  return HttpService.post(`/v1/jobs/${job_id}/reimbursements`, config);
};

const updateReimbursement = (config: IReimbursement) => {
  const {job_id, id} = config;
  return HttpService.patch(`/v1/jobs/${job_id}/reimbursements/${id}`, config);
};

const approveReimbursement = (config: IReimbursement) => {
  const {job_id, id} = config;
  return HttpService.post(`/v1/jobs/${job_id}/reimbursements/${id}/approve`);
};

const getJobReimbursements = async (jobId: number, params?: {}): Promise<IJobReimbursementSuccess> => {
  const res = await HttpService.get<IJobReimbursementSuccess>(`/v1/jobs/${jobId}/reimbursements`, params);
  return {data: orderBy(res.data, ['date_of_expense', 'user.full_name'], ['desc', 'asc']), pagination: res.pagination};
};

const deleteJobReimbursement = (jobId: number, reimbursementId: number) => {
  return HttpService.remove<any>(`/v1/jobs/${jobId}/reimbursements/${reimbursementId}`);
};

export default {
  createReimbursement,
  getJobReimbursements,
  deleteJobReimbursement,
  updateReimbursement,
  approveReimbursement
};
