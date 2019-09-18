import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {
  IFinancialVolume,
  IFinancialReportParams,
  IFinancialRevenue,
  IFinancialAccReceivable
} from 'src/models/ReportModels/IFinancialReports';
import DateTransformer from 'src/transformers/DateTransformer';

export type IFinancialVolumeSuccess = IObjectEnvelope<IFinancialVolume>;

const dehydrateParams = (params: any) => ({
  ...params,
  current_date_from: DateTransformer.dehydrateDate(params.current_date_from),
  current_date_to: DateTransformer.dehydrateDate(params.current_date_to),
  previous_date_from: DateTransformer.dehydrateDate(params.previous_date_from),
  previous_date_to: DateTransformer.dehydrateDate(params.previous_date_to)
});

const getVolume = async (params?: IFinancialReportParams): Promise<IFinancialVolume> => {
  const res = await HttpService.get<IFinancialVolumeSuccess>(
    '/v1/finance/reports/financial/volume',
    dehydrateParams(params)
  );
  return res.data;
};

const getRevenue = async (params?: IFinancialReportParams): Promise<IFinancialRevenue> => {
  const res = await HttpService.get<any>('/v1/finance/reports/financial/revenue', dehydrateParams(params));
  return res.data;
};

const gerAccountsReceivable = async (params?: IFinancialReportParams): Promise<IFinancialAccReceivable> => {
  const res = await HttpService.get<any>('/v1/finance/reports/financial/accounts_receivables', dehydrateParams(params));
  return res.data;
};

export default {
  getVolume,
  getRevenue,
  gerAccountsReceivable
};
