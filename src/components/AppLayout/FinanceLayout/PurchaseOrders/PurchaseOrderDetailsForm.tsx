import {reduxForm} from 'redux-form';
import FinanceDetailsFormValidator from '../FinanceComponents/FinanceDetailsFormValidator';
import FinanceFormUnwrapped from '../FinanceComponents/FinanceFormUnwrapped';
import {IFormData} from '../FinanceComponents/FinanceFormUnwrapped';

export default reduxForm<IFormData, any>({
  form: 'PurchaseOrderDetailsForm',
  validate: FinanceDetailsFormValidator,
  enableReinitialize: true
})(FinanceFormUnwrapped);
