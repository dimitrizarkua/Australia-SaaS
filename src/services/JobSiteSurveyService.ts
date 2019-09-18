import HttpService from './HttpService';
import {IRoomType, ISurveyType} from 'src/models/ISiteSurvey';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';

export type ISurveyTypeSuccess = IObjectEnvelope<ISurveyType>;
export type IRoomSuccess = IObjectEnvelope<IRoomType>;
export type IRoomsSuccess = IListEnvelope<IRoomType>;

const getJobSurvey = async (jobId: number | string): Promise<ISurveyTypeSuccess> => {
  return await HttpService.get<ISurveyTypeSuccess>(`/v1/jobs/${jobId}/site-survey`);
};

const attachQuestionOption = async (jobId: number | string, questionId: number | string, params = {}): Promise<any> => {
  return await HttpService.post<any>(`/v1/jobs/${jobId}/site-survey/questions/${questionId}`, params);
};

const detachQuestionOption = async (jobId: number | string, questionId: number | string, params = {}): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${jobId}/site-survey/questions/${questionId}`, params);
};

const postJobRooms = async (jobId: number | string, params = {}): Promise<IRoomSuccess> => {
  return await HttpService.post<IRoomSuccess>(`/v1/jobs/${jobId}/areas`, params);
};

const removeJobRooms = async (jobId: number | string, areaId: number | string): Promise<any> => {
  return await HttpService.remove<any>(`/v1/jobs/${jobId}/areas/${areaId}`);
};

export default {
  getJobSurvey,
  attachQuestionOption,
  detachQuestionOption,
  postJobRooms,
  removeJobRooms
};
