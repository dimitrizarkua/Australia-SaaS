import HttpService from './HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IFlooringType} from 'src/models/ISiteSurvey';

export type IFlooringTypesSuccess = IListEnvelope<IFlooringType>;

const getFlooringTypes = async (): Promise<IFlooringTypesSuccess> => {
  return await HttpService.get<IFlooringTypesSuccess>(`/v1/assessment-reports/flooring-types`);
};

export default {
  getFlooringTypes
};
