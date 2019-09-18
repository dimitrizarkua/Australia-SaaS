import {uniqueId} from 'lodash';
import {Dispatch} from 'redux';
import {IHttpError} from 'src/models/IHttpError';
import {IInvoice, IInvoiceItem} from 'src/models/FinanceModels/IInvoices';
import InvoicesService from 'src/services/InvoicesService';
import {createAsyncAction} from 'src/redux/reduxWrap';
import {createFinanceReducer} from './financeReduxWrap';
import {IAppState} from './index';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import {required} from 'src/services/ValidationService';

const NEW_ITEM_ID_PREFIX = 'invoice_item_';

const LOAD = 'Steamatic/Invoice/LOAD';
const LOAD_COMPLETE = 'Steamatic/Invoice/LOAD_COMPLETE';
const RESET = 'Steamatic/Invoice/RESET';
const ERROR = 'Steamatic/Invoice/ERROR';
const CREATE_ITEM = 'Steamatic/Invoice/CREATE_ITEM';
const UPDATE_ITEM = 'Steamatic/Invoice/UPDATE_ITEM';
const REMOVE_ITEM = 'Steamatic/Invoice/REMOVE_ITEM';
const UPDATE_TOTALS = 'Steamatic/Invoice/UPDATE_TOTALS';

export interface IInvoiceState {
  data: Partial<IInvoice>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

const blankInvoice: Partial<IInvoice> = {};

export default createFinanceReducer<IInvoiceState, Partial<IInvoice>>(
  {
    load: LOAD,
    loadComplete: LOAD_COMPLETE,
    reset: RESET,
    error: ERROR,
    createItem: CREATE_ITEM,
    updateItem: UPDATE_ITEM,
    removeItem: REMOVE_ITEM,
    updateTotals: UPDATE_TOTALS
  },
  blankInvoice
);

export const loadInvoice = (id: string | number) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD, payload: {id}});

    try {
      let invoice;
      if (id) {
        invoice = await InvoicesService.findById(id);
      } else {
        invoice = {data: {...blankInvoice}};
      }
      dispatch({type: LOAD_COMPLETE, payload: invoice.data});
      return invoice.data;
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const updateInvoice = (id: number, data: IFormData) =>
  createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => InvoicesService.update(id, data).then(res => res.data), {id});

export const reset = () => {
  return {type: RESET};
};

const updateTotals = () => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const invoice = getState().invoice.data;
    if (!invoice || !invoice.id) {
      return Promise.reject(`Invoice doesn't exist`);
    }

    return InvoicesService.findById(invoice.id).then(res => {
      dispatch({type: UPDATE_TOTALS, payload: res.data});
    });
  };
};

export const createItem = () => {
  const newItem: Partial<IInvoiceItem> = {
    id: uniqueId(NEW_ITEM_ID_PREFIX),
    total_amount: 0,
    dirty: true
  };
  return {type: CREATE_ITEM, payload: newItem};
};

export const updateItem = (id: number | string, data: IInvoiceItem, dirty: boolean) => {
  return {type: UPDATE_ITEM, payload: {id, data: {...data, dirty}}};
};

export const submitItem = (id: number | string) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const invoice = getState().invoice.data;
    if (!invoice || !invoice.id) {
      return Promise.reject(`Invoice doesn't exist`);
    }

    const item = invoice.items!.find(i => i.id === id);
    if (!item) {
      return Promise.reject(`Item doesn't exist`);
    }

    const validationErrors =
      required(item.gs_code) ||
      required(item.description) ||
      required(item.unit_cost) ||
      required(item.quantity) ||
      required(item.gl_account) ||
      required(item.tax_rate);
    if (validationErrors) {
      return Promise.reject('Validation errors');
    }

    let promise;
    if (String(item.id).startsWith(NEW_ITEM_ID_PREFIX)) {
      promise = InvoicesService.createItem(invoice.id, item);
    } else {
      promise = InvoicesService.updateItem(invoice.id, item.id, item);
    }

    return promise.then(res => {
      dispatch(updateItem(id, res.data, false));
      dispatch(updateTotals() as any);
    });
  };
};

export const removeItem = (id: number | string) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const invoice = getState().invoice.data;
    if (!invoice || !invoice.id) {
      return Promise.reject(`Invoice doesn't exist`);
    }

    dispatch({type: REMOVE_ITEM, payload: {id}});
    if (!String(id).startsWith(NEW_ITEM_ID_PREFIX)) {
      return InvoicesService.removeItem(invoice.id, id).then(() => dispatch(updateTotals() as any));
    }
    return Promise.resolve();
  };
};
