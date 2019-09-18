import {IBaseContact} from './IContact';
import {ICompany} from './ICompany';
import {ITag} from './ITag';
import {IUser} from './IUser';

export interface IPerson extends IBaseContact {
  avatar: string;
  parent_company?: ICompany;
  first_name: string;
  last_name: string;
  job_title: string;
  email: string;
  business_phone: string;
  mobile_phone: string;
  direct_phone: string;
  tags?: ITag[];
  managed_accounts: IUser[];
}
