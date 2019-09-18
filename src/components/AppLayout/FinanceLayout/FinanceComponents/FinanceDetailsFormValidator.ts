import {createValidator, required} from 'src/services/ValidationService';

const basicFinanceFields = {
  recipient_contact: [required],
  location: [required],
  date: [required]
};

export const InvoiceDetailsValidator = createValidator<any>({
  ...basicFinanceFields,
  due_at: [required]
});

export default createValidator<any>(basicFinanceFields);
