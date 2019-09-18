import {IContact} from './IContact';

export interface IGLAccount {
  id: number;
  code: string | null;
  name: string;
  account_type: IGLAccountType;
}

export interface IGLAccountType {
  id: number;
  name: string;
  increase_action_is_debit: boolean;
  account_type_group_id: null | number;
  show_on_bs: boolean;
  show_on_pl: boolean;
}

export interface ITaxRate {
  id: number;
  name: string;
  rate: string;
}

export interface IGSCode {
  id: number;
  name: string;
  description: string;
  is_buy: boolean;
  is_sell: boolean;
}

export interface IAccountingOrganization {
  id: number;
  contact_id: number;
  contact: IContact;
  tax_payable_account_id: number;
  tax_receivable_account_id: number;
  accounts_payable_account_id: number;
  accounts_receivable_account_id: number;
  payment_details_account_id: number;
  cc_payments_api_key: string;
  is_active: boolean;
  lock_day_of_month: string;
}
