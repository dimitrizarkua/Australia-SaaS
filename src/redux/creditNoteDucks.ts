import {uniqueId} from 'lodash';
import {Dispatch} from 'redux';
import {IHttpError} from 'src/models/IHttpError';
import {ICreditNote, ICreditNoteItem} from 'src/models/FinanceModels/ICreditNotes';
import CreditNotesService from 'src/services/CreditNotesService';
import {createFinanceReducer} from './financeReduxWrap';
import {createAsyncAction} from 'src/redux/reduxWrap';
import {IAppState} from './index';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import {required} from 'src/services/ValidationService';

const NEW_ITEM_ID_PREFIX = 'credite_note_item_';

const LOAD = 'Steamatic/CreditNote/LOAD';
const LOAD_COMPLETE = 'Steamatic/CreditNote/LOAD_COMPLETE';
const RESET = 'Steamatic/CreditNote/RESET';
const ERROR = 'Steamatic/CreditNote/ERROR';
const CREATE_ITEM = 'Steamatic/CreditNote/CREATE_ITEM';
const UPDATE_ITEM = 'Steamatic/CreditNote/UPDATE_ITEM';
const REMOVE_ITEM = 'Steamatic/CreditNote/REMOVE_ITEM';
const UPDATE_TOTALS = 'Steamatic/CreditNote/UPDATE_TOTALS';

export interface ICreditNoteState {
  data: Partial<ICreditNote>;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

const blankCN: Partial<ICreditNote> = {};

export default createFinanceReducer<ICreditNoteState, Partial<ICreditNote>>(
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
  blankCN
);

export const reset = () => {
  return {type: RESET};
};

export const loadCreditNote = (id: string | number) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD, payload: {id}});

    try {
      let purchaseOrder;
      if (id) {
        purchaseOrder = await CreditNotesService.findById(id);
      } else {
        purchaseOrder = {data: {...blankCN}};
      }
      dispatch({type: LOAD_COMPLETE, payload: purchaseOrder.data});
      return purchaseOrder.data;
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const updateCreditNote = (id: string | number, data: IFormData) =>
  createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => CreditNotesService.update(id, data).then(res => res.data), {id});

const updateTotals = () => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const creditNote = getState().creditNote.data;
    if (!creditNote || !creditNote.id) {
      return Promise.reject(`Credit note doesn't exist`);
    }

    return CreditNotesService.findById(creditNote.id).then(res => {
      dispatch({type: UPDATE_TOTALS, payload: res.data});
    });
  };
};

export const createItem = () => {
  const newItem: Partial<ICreditNoteItem> = {
    id: uniqueId(NEW_ITEM_ID_PREFIX),
    dirty: true
  };
  return {type: CREATE_ITEM, payload: newItem};
};

export const updateItem = (id: number | string, data: ICreditNoteItem, dirty: boolean) => {
  return {type: UPDATE_ITEM, payload: {id, data: {...data, dirty}}};
};

export const submitItem = (id: number | string) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const creditNote = getState().creditNote.data;
    if (!creditNote || !creditNote.id) {
      return Promise.reject(`Credit note doesn't exist`);
    }

    const item = creditNote.items!.find(i => i.id === id);
    if (!item) {
      return Promise.reject(`Credit note item doesn't exist`);
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
      promise = CreditNotesService.createItem(creditNote.id, item);
    } else {
      promise = CreditNotesService.updateItem(creditNote.id, item.id, item);
    }

    return promise.then(res => {
      dispatch(updateItem(id, res.data, false));
      dispatch(updateTotals() as any);
    });
  };
};

export const removeItem = (id: number | string) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const creditNote = getState().creditNote.data;
    if (!creditNote || !creditNote.id) {
      return Promise.reject(`Credit Note doesn't exist`);
    }

    dispatch({type: REMOVE_ITEM, payload: {id}});
    if (!String(id).startsWith(NEW_ITEM_ID_PREFIX)) {
      return CreditNotesService.removeItem(creditNote.id, id).then(() => dispatch(updateTotals() as any));
    }
    return Promise.resolve();
  };
};
