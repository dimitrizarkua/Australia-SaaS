import HttpService from 'src/services/HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';

const assessmentReportsGet = async (jobId: number, arId: number, config?: {}): Promise<IObjectEnvelope<any>> => {
  const res = await HttpService.get<any>(`/v1/jobs/${jobId}/assessment-reports/${arId}`, config);
  return res.data;
};

export default {
  assessmentReportsGet
};
