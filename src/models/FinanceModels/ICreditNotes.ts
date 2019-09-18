import {IEntity} from '../IEntity';
import {IFinanceCategoryInfo, IFinanceEntity, IFinanceEntityItem} from './ICommonFinance';
import {Moment} from 'moment';
import {IJob} from '../IJob';

export interface ICreditNotesInfo {
  draft: IFinanceCategoryInfo;
}

export interface ICreditNoteListItem {
  id: number;
  location_id: number;
  accounting_organization_id: number;
  recipient_contact_id: number;
  recipient_name: string;
  job_id: number;
  document_id: number;
  date: string;
  created_at: string;
  updated_at: string;
  locked_at: string;
  latest_status: {
    status: string;
  };
  total_amount: number;
  sub_total: number;
  taxes: number;
  job: Partial<IJob>;
  credit_note_items: Partial<ICreditNoteItem>;
}

export interface ICreditNoteItem extends IFinanceEntityItem {
  credit_note_id: number;
  gs_code_id: number;
  gl_account_id: number;
  tax_rate_id: number;
  created_at: Moment | null;
}

export interface ICreditNoteTaransaction extends IEntity {
  accounting_organization_id: number;
  created_at: Moment;
}

export interface ICreditNote extends IFinanceEntity {
  payment_id: number;
  created_at: Moment | null;
  items: ICreditNoteItem[];
  approve_requests: any[];
  transactions: ICreditNoteTaransaction[];
}
