import {IPayment} from './IPayment';
import {Moment} from 'moment';

export interface ITransaction {
  id: number;
  accounting_organization_id: number;
  created_at: Moment;
  payment: IPayment;
}
