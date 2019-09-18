import {IForm as ICCPaymentForm} from 'src/components/Modal/Finance/ModalCreditCard';
import {IForm as IDDPaymentForm} from 'src/components/Modal/Finance/ModalDirectDeposit';
import {ICCPayment} from 'src/models/FinanceModels/IPayments';
import {IPaymentReceipt} from 'src/models/FinanceModels/IPayments';
import {IReceivePaymentInvoice} from 'src/models/FinanceModels/IPayments';
import {ReceivePaymentFormParams} from 'src/components/AppLayout/FinanceLayout/PaymentPages/ReceivePaymentForm';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import DateTransformer from './DateTransformer';

const hydrate = (data: IObjectEnvelope<any>): IPaymentReceipt => {
  return {
    ...data.data,
    created_at: DateTransformer.hydrateDateTime(data.data.created_at),
    paid_at: DateTransformer.hydrateDateTime(data.data.paid_at),
    updated_at: DateTransformer.hydrateDateTime(data.data.updated_at)
  };
};

export const CreditCardPaymentTransformer = {
  dehydrate: (formData: ICCPaymentForm) => {
    const data: ICCPayment = {
      name: formData.name,
      cvv: +formData.cvv,
      number: formData.number.replace(/\D/g, ''),
      expiry_month: formData.expiry_month.value.toString(),
      expiry_year: formData.expiry_year.value.toString(),
      billing_address1: formData.billing_address1,
      billing_city: formData.billing_city,
      billing_country: formData.billing_country,
      email: formData.email
    };
    return data;
  },
  hydrate
};

export const DirectDepositPaymentTransformer = {
  dehydrate: (formData: IDDPaymentForm) => {
    return {
      ...formData,
      paid_at: DateTransformer.dehydrateDate(formData.paid_at),
      gl_account_id: formData.gl_account_id.id,
      amount: priceToValue(formData.amount)
    };
  },
  hydrate
};

export const ReceivePaymentTransformer = {
  dehydrate: (params: ReceivePaymentFormParams, invoices: IReceivePaymentInvoice[]) => ({
    payment_data: {
      ...params,
      paid_at: DateTransformer.dehydrateDateTime(params.paid_at),
      dst_gl_account_id: params.dst_gl_account.id
    },
    invoices_list: invoices
  })
};

export function priceToValue(price: string) {
  return +price.replace(/[^\d\.]/g, '');
}
