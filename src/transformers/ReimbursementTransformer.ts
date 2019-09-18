import {BACKEND_DATE} from 'src/constants/Date';
import {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalReimbursement';
import {IReimbursement} from 'src/models/UsageAndActualsModels/IReimbursement';
import moment from 'moment';

const convertToApi = (data: IFormValues): IReimbursement => {
  return {
    ...data,
    user_id: data.user.id,
    date_of_expense: data.date_of_expense.format(BACKEND_DATE),
    is_chargeable: data.is_chargeable ? data.is_chargeable : false
  } as IReimbursement;
};

const convertToForm = (data: IReimbursement): IFormValues => {
  return {
    ...data,
    date_of_expense: moment(data.date_of_expense)
  } as IFormValues;
};

export default {convertToApi, convertToForm};
