import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IGstSummaries} from 'src/models/ReportModels/IGstSummary';

export type IGstSummarySuccess = IObjectEnvelope<IGstSummaries>;

const ENDPOINT_PREFIX_GSTSUMMARY = '/v1/finance/reports/gst';

const getGstSummary = (params?: {}): Promise<IGstSummarySuccess> => {
  return HttpService.get<IGstSummarySuccess>(`${ENDPOINT_PREFIX_GSTSUMMARY}`, params);
};

export default {
  getGstSummary
};
