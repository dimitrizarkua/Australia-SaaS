import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IPurchaseOrder, IPurchaseOrderItem} from 'src/models/FinanceModels/IPurchaseOrders';
import DateTransformer from './DateTransformer';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import CommonFinanceTransformer from './CommonFinanceTransformer';
import JobTransformer from 'src/transformers/JobTransformer';

const hydrate = (res: IObjectEnvelope<any>): IObjectEnvelope<IPurchaseOrder> => {
  const purchaseOrder = {
    ...res.data,
    date: DateTransformer.hydrateDate(res.data.date)
  };
  if (res.data.job) {
    purchaseOrder.job = JobTransformer.hydrate(res.data.job);
  }
  return {data: purchaseOrder};
};

const dehydrate = (data: IFormData): any => {
  const result = {
    ...CommonFinanceTransformer.dehydrate(data),
    purchase_orders_items: []
  } as any;
  return result;
};

const dehydrateItem = (item: IPurchaseOrderItem): any => {
  const result = {
    ...CommonFinanceTransformer.dehydrateItem(item),
    markup: item.markup || 0
  } as any;
  return result;
};

export default {
  hydrate,
  dehydrate,
  dehydrateItem
};
