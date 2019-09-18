import {reduxWrap, IReturnType, createAsyncAction} from './reduxWrap';
import {IHttpError} from 'src/models/IHttpError';
import TrialBalanceService, {ITrialBalanceSuccess} from 'src/services/TrialBalanceService';
import {ITrialBalance} from 'src/models/ReportModels/ITrialBalance';

const LOAD = 'Steamatic/Finance/Reports/TrialBalance/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/Reports/TrialBalance/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/Reports/TrialBalance/RESET';
const ERROR = 'Steamatic/Finance/Reports/TrialBalance/ERROR';

export type TrialBalanceStateType = IReturnType<ITrialBalanceSuccess>;

export default reduxWrap<ITrialBalanceSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export interface ITrialBalanceState {
  data: Partial<ITrialBalance>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

export const getTrialBalance = (params?: {}) => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => TrialBalanceService.getITrialBalance(params));
};
