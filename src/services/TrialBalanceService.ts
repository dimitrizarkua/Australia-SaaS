import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {ITrialBalances} from 'src/models/ReportModels/ITrialBalance';

export type ITrialBalanceSuccess = IObjectEnvelope<ITrialBalances>;

const ENDPOINT_PREFIX_TRIALBALANCE = '/v1/finance/reports/gl-accounts/trial-report';

const getITrialBalance = async (params?: {}): Promise<ITrialBalanceSuccess> => {
  return await HttpService.get<ITrialBalanceSuccess>(`${ENDPOINT_PREFIX_TRIALBALANCE}`, params);
};

export default {
  getITrialBalance
};
