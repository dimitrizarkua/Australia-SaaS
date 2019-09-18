import {reduxWrap, IReturnType, createAsyncAction} from './reduxWrap';
import {IHttpError} from 'src/models/IHttpError';
import GstSummaryService, {IGstSummarySuccess} from 'src/services/GstSummaryService';
import {IGstSummary} from 'src/models/ReportModels/IGstSummary';

const LOAD = 'Steamatic/Finance/Reports/GstSummary/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/Reports/GstSummary/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/Reports/GstSummary/RESET';
const ERROR = 'Steamatic/Finance/Reports/GstSummary/ERROR';

export type GstSummaryStateType = IReturnType<IGstSummarySuccess>;

export default reduxWrap<IGstSummarySuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export interface IGstSummaryState {
  data: Partial<IGstSummary>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

export const getGstSummary = (params?: {}) => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => GstSummaryService.getGstSummary(params));
};
