import {IFinanceCategoryInfo, IFinanceEntity, IFinanceEntityItem} from './ICommonFinance';
import {IGLAccount, IGSCode, ITaxRate} from '../IFinance';
import {ILocation} from '../IAddress';
import {Moment} from 'moment';

export interface IPurchaseOrdersInfo {
  draft: IFinanceCategoryInfo;
}

export interface IPurchaseOrderListItem {
  id: number;
  location_id: number;
  accounting_organization_id: number;
  recipient_contact_id: number;
  job_id: number;
  date: string;
  total_amount: number;
  recipient_name: string;
  job: {
    id: number | string;
    location_code: string;
    insurer_name: string;
  };
  latest_status: IPurchaseOrderStatus;
  reference: string;
}

interface IPurchaseOrderStatus {
  id: number | string;
  purchase_order_id: number | string;
  user_id: number | string;
  status: string;
  gl_account: IGLAccount;
  tax_rate: ITaxRate;
  gs_code: IGSCode;
}

export interface IPurchaseOrderItem extends IFinanceEntityItem {
  purchase_order_id: number;
  gs_code_id: number;
  markup: number;
  gl_account_id: number;
  tax_rate_id: number;
  created_at: Moment | null;
}

export interface IPurchaseOrder extends IFinanceEntity {
  created_at: Moment | null;
  location: ILocation;
  items: IPurchaseOrderItem[];
  reference: string;
}
