import {IObjectEnvelope} from '../models/IEnvelope';
import {ICreditNote} from '../models/FinanceModels/ICreditNotes';
import DateTransformer from './DateTransformer';
import {IFormData} from '../components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import CommonFinanceTransformer from './CommonFinanceTransformer';
import JobTransformer from 'src/transformers/JobTransformer';

const hydrate = (res: IObjectEnvelope<any>): IObjectEnvelope<ICreditNote> => {
  const creditNote = {
    ...res.data,
    date: DateTransformer.hydrateDate(res.data.date)
  };
  if (res.data.job) {
    creditNote.job = JobTransformer.hydrate(res.data.job);
  }
  return {data: creditNote};
};

const dehydrate = (data: IFormData): any => {
  return {
    ...CommonFinanceTransformer.dehydrate(data),
    credit_note_items: []
  };
};

const dehydrateItem = CommonFinanceTransformer.dehydrateItem;

export default {
  hydrate,
  dehydrate,
  dehydrateItem
};
