import {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalLaha';
import {ILaha} from 'src/models/UsageAndActualsModels/ILaha';
import moment from 'moment';
import {BACKEND_DATE} from 'src/constants/Date';

const convertToApi = (data: IFormValues): ILaha => {
  return {
    ...data,
    user_id: data.user.id,
    laha_compensation_id: data.laha_compensation.id,
    date_started: data.date_started.format(BACKEND_DATE)
  } as ILaha;
};

const convertToForm = (data: ILaha): IFormValues => {
  return {
    ...data,
    date_started: moment(data.date_started)
  } as IFormValues;
};

export default {convertToApi, convertToForm};
