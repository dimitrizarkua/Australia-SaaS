import {IBaseContact} from './IContact';
import {ITag} from './ITag';
import {IUser} from './IUser';

export interface ICompany extends IBaseContact {
  logo: string;
  email: string;
  business_phone: string;
  legal_name: string;
  trading_name: string;
  abn: string;
  website: string;
  default_payment_terms_days: number;
  tags?: ITag[];
  managed_accounts: IUser[];
}
