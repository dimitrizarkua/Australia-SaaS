import {uniqueId} from 'lodash';
import {Dispatch} from 'redux';
import {IHttpError} from 'src/models/IHttpError';
import {IPurchaseOrder, IPurchaseOrderItem} from 'src/models/FinanceModels/IPurchaseOrders';
import PurchaseOrdersService from 'src/services/PurchaseOrdersService';
import {createFinanceReducer} from './financeReduxWrap';
import {createAsyncAction} from 'src/redux/reduxWrap';
import {IAppState} from './index';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import {required} from 'src/services/ValidationService';

const NEW_ITEM_ID_PREFIX = 'purchase_order_item_';

const LOAD = 'Steamatic/PurchaseOrder/LOAD';
const LOAD_COMPLETE = 'Steamatic/PurchaseOrder/LOAD_COMPLETE';
const RESET = 'Steamatic/PurchaseOrder/RESET';
const ERROR = 'Steamatic/PurchaseOrder/ERROR';
const CREATE_ITEM = 'Steamatic/PurchaseOrder/CREATE_ITEM';
const UPDATE_ITEM = 'Steamatic/PurchaseOrder/UPDATE_ITEM';
const REMOVE_ITEM = 'Steamatic/PurchaseOrder/REMOVE_ITEM';
const UPDATE_TOTALS = 'Steamatic/PurchaseOrder/UPDATE_TOTALS';

export interface IPurchaseOrderState {
  data: Partial<IPurchaseOrder>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

const blankPO: Partial<IPurchaseOrder> = {};

export default createFinanceReducer<IPurchaseOrderState, Partial<IPurchaseOrder>>(
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
  blankPO
);

export const reset = () => {
  return {type: RESET};
};

export const loadPurchaseOrder = (id: string | number) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD, payload: {id}});

    try {
      let purchaseOrder;
      if (id) {
        purchaseOrder = await PurchaseOrdersService.findById(id);
      } else {
        purchaseOrder = {data: {...blankPO}};
      }
      dispatch({type: LOAD_COMPLETE, payload: purchaseOrder.data});
      return purchaseOrder.data;
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const updatePurchaseOrder = (id: number, data: IFormData) =>
  createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => PurchaseOrdersService.update(id, data).then(res => res.data), {
    id
  });

const updateTotals = () => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const purchaseOrder = getState().purchaseOrder.data;
    if (!purchaseOrder || !purchaseOrder.id) {
      return Promise.reject(`Purchase Order doesn't exist`);
    }

    return PurchaseOrdersService.findById(purchaseOrder.id).then(res => {
      dispatch({type: UPDATE_TOTALS, payload: res.data});
    });
  };
};

export const createItem = () => {
  const newItem: Partial<IPurchaseOrderItem> = {
    id: uniqueId(NEW_ITEM_ID_PREFIX),
    dirty: true
  };
  return {type: CREATE_ITEM, payload: newItem};
};

export const updateItem = (id: number | string, data: IPurchaseOrderItem, dirty: boolean) => {
  return {type: UPDATE_ITEM, payload: {id, data: {...data, dirty}}};
};

export const submitItem = (id: number | string) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const purchaseOrder = getState().purchaseOrder.data;
    if (!purchaseOrder || !purchaseOrder.id) {
      return Promise.reject(`Purchase Order doesn't exist`);
    }

    const item = purchaseOrder.items!.find(i => i.id === id);
    if (!item) {
      return Promise.reject(`PO item doesn't exist`);
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
      promise = PurchaseOrdersService.createItem(purchaseOrder.id, item);
    } else {
      promise = PurchaseOrdersService.updateItem(purchaseOrder.id, item.id, item);
    }

    return promise.then(res => {
      dispatch(updateItem(id, res.data, false));
      dispatch(updateTotals() as any);
    });
  };
};

export const removeItem = (id: number | string) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const purchaseOrder = getState().purchaseOrder.data;
    if (!purchaseOrder || !purchaseOrder.id) {
      return Promise.reject(`Purchase Order doesn't exist`);
    }

    dispatch({type: REMOVE_ITEM, payload: {id}});
    if (!String(id).startsWith(NEW_ITEM_ID_PREFIX)) {
      return PurchaseOrdersService.removeItem(purchaseOrder.id, id).then(() => dispatch(updateTotals() as any));
    }
    return Promise.resolve();
  };
};
