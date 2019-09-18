import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import {IFinanceEntityItem} from 'src/models/FinanceModels/ICommonFinance';
import DateTransformer from './DateTransformer';
import {IHttpError} from 'src/models/IHttpError';

const dehydrate = (data: IFormData): any => {
  const result = {
    date: DateTransformer.dehydrateDate(data.date),
    items: data.items || []
  } as any;
  if (data.location) {
    result.location_id = data.location.id;
  }
  if (data.recipient_contact) {
    result.recipient_contact_id = data.recipient_contact.id;
  }
  if (data.job) {
    result.job_id = data.job.id;
  }
  if (data.reference) {
    result.reference = data.reference;
  }
  return result;
};

const hydrateError = (err: IHttpError): IHttpError => {
  const result = {...err};
  if (result.fields) {
    result.fields = {
      location: err.fields.location_id,
      recipient_contact: err.fields.recipient_contact_id,
      job: err.fields.job_id,
      date: err.fields.date,
      reference: err.fields.reference
    };
  }
  return result;
};

const dehydrateItem = (item: IFinanceEntityItem): any => {
  const result = {
    description: item.description,
    unit_cost: item.unit_cost,
    quantity: item.quantity
  } as any;
  if (item.gs_code) {
    result.gs_code_id = item.gs_code.id;
  }
  if (item.gl_account) {
    result.gl_account_id = item.gl_account.id;
  }
  if (item.tax_rate) {
    result.tax_rate_id = item.tax_rate.id;
  }
  return result;
};

export default {
  dehydrate,
  hydrateError,
  dehydrateItem
};
