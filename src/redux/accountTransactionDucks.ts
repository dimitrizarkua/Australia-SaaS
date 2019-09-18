import {reduxWrap, IReturnType, createAsyncAction} from './reduxWrap';
import AccountTransactionService, {IAccountTransactionsListSuccess} from 'src/services/AccountTransactionService';
import {IAccountTransactionListItem} from 'src/models/ReportModels/IAccountTransaction';
import {IHttpError} from 'src/models/IHttpError';

const LOAD = 'Steamatic/Finance/Reports/GlAccounts/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/Reports/GlAccounts/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/Reports/GlAccounts/RESET';
const ERROR = 'Steamatic/Finance/Reports/GlAccounts/ERROR';

export type AccountTransactionStateType = IReturnType<IAccountTransactionsListSuccess>;

export default reduxWrap<IAccountTransactionsListSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export interface IAccountTransactionsState {
  data: Partial<IAccountTransactionListItem>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

export const getAccountTransaction = (id: string | number, params: {}) => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () =>
    AccountTransactionService.getAccountTransactionsByGlAccountId(id, params)
  );
};
