import {reduxWrap, IReturnType, createAsyncAction} from './reduxWrap';
import InvoicePaymentService, {IInvoicePaymentSuccess} from 'src/services/InvoicePaymentService';
import {IInvoicePayment} from 'src/models/ReportModels/IInvoicePayment';
import {IHttpError} from 'src/models/IHttpError';

const LOAD = 'Steamatic/Finance/Reports/InvoicePayment/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/Reports/InvoicePayment/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/Reports/InvoicePayment/RESET';
const ERROR = 'Steamatic/Finance/Reports/InvoicePayment/ERROR';

export type InvoicePaymentStateType = IReturnType<IInvoicePaymentSuccess>;

export default reduxWrap<IInvoicePaymentSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export interface IInvoicePaymentsState {
  data: Partial<IInvoicePayment>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

export const getInvoicePayments = (params?: {}) => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => InvoicePaymentService.getInvoicePayments(params));
};
