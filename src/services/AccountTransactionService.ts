import HttpService from './HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IAccountTransactionListItem} from 'src/models/ReportModels/IAccountTransaction';
import {IGLAccount} from 'src/models/IFinance';

export interface IAccountTransactionsListSuccess extends IListEnvelope<IAccountTransactionListItem> {
  additional: {
    gl_account: IGLAccount;
    total_transactions: number;
    total_balance: number;
  };
}

const ENDPOINT_PREFIX_TRANSACTIONS = '/v1/finance/reports/gl-accounts';
const ENDPOINT_POSTFIX_TRANSACTIONS = 'transactions/info';

const getAccountTransactionsByGlAccountId = async (
  id: string | number,
  params: {}
): Promise<IAccountTransactionsListSuccess> => {
  return await HttpService.get<IAccountTransactionsListSuccess>(
    `${ENDPOINT_PREFIX_TRANSACTIONS}/${id}/${ENDPOINT_POSTFIX_TRANSACTIONS}`,
    params
  );
};

export default {
  getAccountTransactionsByGlAccountId
};
