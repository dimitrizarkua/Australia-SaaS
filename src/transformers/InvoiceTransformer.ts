import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IInvoice, IInvoiceItem} from 'src/models/FinanceModels/IInvoices';
import DateTransformer from './DateTransformer';
import {IFormData} from '../components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import CommonFinanceTransformer from './CommonFinanceTransformer';
import {IHttpError} from 'src/models/IHttpError';
import JobTransformer from 'src/transformers/JobTransformer';

const hydrate = (res: IObjectEnvelope<any>): IObjectEnvelope<IInvoice> => {
  const invoice = {
    ...res.data,
    date: DateTransformer.hydrateDate(res.data.date),
    due_at: DateTransformer.hydrateDate(res.data.due_at)
  };
  if (res.data.job) {
    invoice.job = JobTransformer.hydrate(res.data.job);
  }
  return {data: invoice};
};

const hydrateError = (err: IHttpError): IHttpError => {
  const result = CommonFinanceTransformer.hydrateError(err);
  if (result.fields) {
    result.fields.due_at = err.fields.due_at;
  }
  return result;
};

const dehydrate = (data: IFormData): any => {
  return {
    ...CommonFinanceTransformer.dehydrate(data),
    due_at: DateTransformer.dehydrateDateTime(data.due_at)
  };
};

const dehydrateItem = (item: IInvoiceItem): any => {
  return {
    ...CommonFinanceTransformer.dehydrateItem(item),
    discount: item.discount || 0
  };
};

export default {
  hydrate,
  dehydrate,
  hydrateError,
  dehydrateItem
};
