import {IFinanceEntity, IFinanceEntityItem, IFinanceCategoryInfo} from './ICommonFinance';
import {Moment} from 'moment';

export interface IInvoiceListItem {
  id: number | string;
  recipient_name: string;
  due_at: string;
  total_amount: number | string;
  balance_due: number | string;
  job?: {
    id: number | string;
    location_code: string;
    insurer_name: string;
  } | null;
  latest_status: IInvoiceStatus;
  virtual_status?: string;
}

interface IInvoiceStatus {
  id: number | string;
  invoice_id: number | string;
  user_id: number | string;
  status: string;
}

export interface IInvoicesListInfo {
  draft: IFinanceCategoryInfo;
  unpaid: IFinanceCategoryInfo;
  overdue: IFinanceCategoryInfo;
}

export interface IInvoice extends IFinanceEntity {
  items: IInvoiceItem[];
  due_at: Moment | null;
  amount_due: number;
}

export interface IInvoiceItem extends IFinanceEntityItem {
  discount: number;
}

export enum PaymentTypesEnum {
  DP = 'DP',
  FP = 'FP'
}

export interface IInvoiceForPayment extends IInvoiceListItem {
  payment_type?: PaymentTypesEnum;
  payment_amount?: number;
}
