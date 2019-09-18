import HttpService from './HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IInvoicePayment} from 'src/models/ReportModels/IInvoicePayment';

export type IInvoicePaymentSuccess = IListEnvelope<IInvoicePayment>;

const ENDPOINT_PREFIX_INVOICEPAYMENTS = '/v1/finance/reports/invoices/payments';

const getInvoicePayments = async (params?: {}): Promise<IInvoicePaymentSuccess> => {
  return await HttpService.get<IInvoicePaymentSuccess>(`${ENDPOINT_PREFIX_INVOICEPAYMENTS}`, params);
};

export default {
  getInvoicePayments
};
