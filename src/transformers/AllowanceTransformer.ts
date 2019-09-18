import {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalAllowance';
import {IAllowance} from 'src/models/UsageAndActualsModels/IAllowance';
import {BACKEND_DATE} from 'src/constants/Date';
import moment from 'moment';

const convertToApi = (data: IFormValues): IAllowance => {
  return {
    ...data,
    user_id: data.user.id,
    allowance_type_id: data.allowance_type.id,
    date_given: data.date_given.format(BACKEND_DATE)
  } as IAllowance;
};

const convertToForm = (data: IAllowance): IFormValues => {
  return {
    ...data,
    date_given: moment(data.date_given)
  } as IFormValues;
};

export default {convertToApi, convertToForm};
