import {IUpUserForm} from 'src/models/IUser';

export const toUpdateUserStructure = (data: any): Partial<IUpUserForm> => {
  return {
    first_name: data.first_name && data.first_name.trim(),
    last_name: data.last_name && data.last_name.trim(),
    working_hours_per_week: +data.working_hours_per_week,
    purchase_order_approve_limit: +data.purchase_order_approve_limit,
    credit_note_approval_limit: +data.credit_note_approval_limit,
    invoice_approve_limit: +data.invoice_approve_limit
  };
};
