import {reduxForm} from 'redux-form';
import {InvoiceDetailsValidator} from '../FinanceComponents/FinanceDetailsFormValidator';
import FinanceFormUnwrapped from '../FinanceComponents/FinanceFormUnwrapped';
import {IFormData} from '../FinanceComponents/FinanceFormUnwrapped';

export default reduxForm<IFormData, any>({
  form: 'InvoiceDetailsForm',
  validate: InvoiceDetailsValidator,
  enableReinitialize: true
})(FinanceFormUnwrapped);
