import {Moment} from 'moment';
import {IInvoiceForPayment} from './IInvoices';

export interface IPaymentToForwardParams {
  location_id?: number;
  source_gl_account_id: number | string;
  destination_gl_account_id: number | string;
  transferred_at: Moment;
  remittance_reference: string;
}

export interface IPaymentToForward extends IPaymentToForwardParams {
  invoices_ids: Array<number | string>;
}

export interface IForwardedPayment extends IPaymentToForwardParams {
  invoices: IInvoiceForPayment[];
}

export interface IReceivePaymentParams {
  paid_at: Moment;
  reference: string;
  accounting_organization_id: number;
  dst_gl_account_id: number;
  location_id: number;
}

export interface IReceivePaymentInvoice {
  invoice_id: number;
  is_fp: boolean;
  amount: number;
}

export interface IReceivePayment {
  paiment_data: IReceivePaymentParams;
  invoices_list: IReceivePaymentInvoice[];
}

export interface ICCPayment {
  name: string;
  cvv: number;
  number: string;
  expiry_month: string;
  expiry_year: string;
  billing_address1: string;
  billing_city: string;
  billing_country: string;
  email: string;
}

export interface IPaymentReceipt {
  type: 'credit_card' | 'direct_deposit';
  amount: number;
  created_at: Moment;
  paid_at: Moment;
  updated_at: Moment;
  id: number;
  payment_id: number;
  external_transaction_id: string;
  transaction_id: number;
  user_id: number;
  credit_card_transaction?: any;
}
