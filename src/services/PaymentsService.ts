import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IInvoicesSuccess} from './InvoicesService';
import {IPaymentToForward, IPaymentReceipt, IReceivePaymentInvoice} from 'src/models/FinanceModels/IPayments';
import {ReceivePaymentFormParams} from 'src/components/AppLayout/FinanceLayout/PaymentPages/ReceivePaymentForm';
import {IForm as ICCPaymentForm} from 'src/components/Modal/Finance/ModalCreditCard';
import {IForm as IDDPaymentForm} from 'src/components/Modal/Finance/ModalDirectDeposit';
import DateTransformer from 'src/transformers/DateTransformer';
import {
  CreditCardPaymentTransformer,
  DirectDepositPaymentTransformer,
  ReceivePaymentTransformer
} from 'src/transformers/PaymentTransformer';

export type IPaymentReceiptSuccess = IObjectEnvelope<IPaymentReceipt>;

const forwardPayments = async (data: IPaymentToForward): Promise<void> => {
  return await HttpService.post<void>('/v1/finance/payments/forward', {
    ...data,
    transferred_at: DateTransformer.dehydrateDateTime(data.transferred_at)
  });
};

const getPaymentsToForward = async (params: {}): Promise<IInvoicesSuccess> => {
  return await HttpService.get<IInvoicesSuccess>('/v1/finance/invoices/listings/unforwarded', params);
};

// TODO: after implement API, use real endpoint
const getForwardedPayments = async (params: {}): Promise<any> => {
  return await Promise.resolve({data: []});
};

// TODO: after implement API, use real endpoint
const getForwardedPaymentsInfo = async (params: {}): Promise<any> => {
  return await Promise.resolve({
    year: 0,
    month: 0,
    overall: 0
  });
};

const receiveWithCreditCard = async (invoiceId: number, params: ICCPaymentForm): Promise<IPaymentReceipt> => {
  const res = await HttpService.post<IPaymentReceiptSuccess>(
    `/v1/finance/invoices/${invoiceId}/payments/receive/credit-card`,
    CreditCardPaymentTransformer.dehydrate(params)
  );
  return CreditCardPaymentTransformer.hydrate(res);
};

const receiveDirectDeposit = async (invoiceId: number, params: IDDPaymentForm): Promise<IPaymentReceipt> => {
  const res = await HttpService.post<IPaymentReceiptSuccess>(
    `/v1/finance/invoices/${invoiceId}/payments/receive/direct-deposit`,
    DirectDepositPaymentTransformer.dehydrate(params)
  );
  return DirectDepositPaymentTransformer.hydrate(res);
};

const receivePayment = (params: ReceivePaymentFormParams, invoices: IReceivePaymentInvoice[]) => {
  return HttpService.post<any>(
    '/v1/finance/payments/transfers/receive',
    ReceivePaymentTransformer.dehydrate(params, invoices)
  );
};

export default {
  forwardPayments,
  getPaymentsToForward,
  getForwardedPayments,
  getForwardedPaymentsInfo,
  receiveWithCreditCard,
  receiveDirectDeposit,
  receivePayment
};
