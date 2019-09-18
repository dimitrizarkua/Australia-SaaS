import {IPayment} from 'src/models/IPayment';
import {IContact} from 'src/models/IContact';

export interface IInvoicePayment {
  id: number;
  recipient_name: string | null;
  location_code: string;
  due_at: string;
  date: string;
  total_amount: number;
  paid_status: string;
  job: {
    id: number;
    claim_number: string;
  } | null;
  payments: IPayment[];
  recipient_contact: IContact | null;
}

export interface IInvoicePaymentRequest {
  dateFrom?: string | null;
  dateTo?: string | null;
  location?: number | null;
}
