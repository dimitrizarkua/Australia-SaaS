import {IEntity, INamedEntity} from 'src/models/IEntity';
import {IDocument} from '../IDocument';
import {IJob} from '../IJob';
import {ILocation} from '../IAddress';
import {ContactType, IContactCategory, IContactAddress} from '../IContact';
import {IGLAccount, IGSCode, ITaxRate, IAccountingOrganization} from '../IFinance';
import {Moment} from 'moment';

export interface IFinanceEntityItem {
  id: number | string;
  description: string;
  unit_cost: number;
  quantity: number;
  gl_account: IGLAccount;
  tax_rate: ITaxRate;
  gs_code: IGSCode;
  total_amount: number;
  dirty?: boolean;
}

export interface IFinanceCategoryInfo {
  count: number;
  amount: number;
}

export interface IFinanceEntityStatus {
  user: {
    id: number | string;
    email: string;
    full_name: string;
    avatar: 'string';
  };
  status: 'draft' | 'approved';
  created_id: Moment;
  created_at?: string | null;
  note?: string;
}

export interface IFinanceRecipientContact extends IEntity {
  id: number;
  contact_type: ContactType;
  contact_category_id: number;
  contact_status_id: number;
  email: string;
  mobile_phone: string;
  business_phone: string;
  mailing_address: IContactAddress;
  is_archived: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
  contact_status: INamedEntity;
  contact_category: IContactCategory;
}

export interface IFinanceEntity extends IEntity {
  location_id: number;
  job_id: number | null;
  accounting_organization_id: number;
  recipient_contact_id: number;
  recipient_address: string;
  recipient_name: string;
  due_at: Moment | null;
  locked_at: Moment | null;
  location: ILocation;
  accounting_organization: IAccountingOrganization;
  recipient_contact: IFinanceRecipientContact;
  latest_status: IFinanceEntityStatus;
  document_id: number;
  document: IDocument;
  statuses: IFinanceEntityStatus[];
  job?: IJob;
  virtual_status: string;
  taxes: number;
  sub_total: number;
  total_amount: number;
  date: Moment | null;
}
