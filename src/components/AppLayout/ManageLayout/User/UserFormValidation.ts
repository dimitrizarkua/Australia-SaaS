import {createValidator, required, positiveNumber} from 'src/services/ValidationService';

export default createValidator<any>({
  first_name: [required],
  last_name: [required],
  role: [required],
  purchase_order_approve_limit: [positiveNumber],
  credit_note_approval_limit: [positiveNumber],
  invoice_approve_limit: [positiveNumber],
  working_hours_per_week: [positiveNumber]
});
