import {ITransaction} from '../ITransaction';

export interface IAccountTransactionListItem {
  id: number;
  transaction_id: number;
  gl_account_id: number;
  amount: number;
  is_debit: boolean;
  balance: number;
  transaction: ITransaction;
}
