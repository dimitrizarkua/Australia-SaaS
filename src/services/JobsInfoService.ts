import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IJobsInfo} from 'src/models/IJobsInfo';

export type IJobsInfoSuccess = IObjectEnvelope<IJobsInfo>;

const getJobsInfo = async (): Promise<IJobsInfoSuccess> => {
  return await HttpService.get<IJobsInfoSuccess>(`/v1/jobs/info`);
};

export default {
  getJobsInfo
};
