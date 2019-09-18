import {reduxWrap} from './reduxWrap';
import {
  default as PurchaseOrdersService,
  IPurchaseOrdersInfoSuccess,
  IPurchaseOrdersSuccess
} from 'src/services/PurchaseOrdersService';
import {Dispatch} from 'redux';
import {StatusType} from 'src/redux/invoicesDucks';
import {FinanceEntityStatus, FinanceEntityVirtualStatus} from 'src/constants/FinanceEntityStatus';

const LOAD = 'Steamatic/Finance/PurchaseOrdersInfo/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/PurchaseOrdersInfo/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/PurchaseOrdersInfo/RESET';
const ERROR = 'Steamatic/Finance/PurchaseOrdersInfo/ERROR';

const LOAD_LIST = 'Steamatic/Finance/PurchaseOrders/LOAD';
const LOAD_COMPLETE_LIST = 'Steamatic/Finance/PurchaseOrders/LOAD_COMPLETE';
const RESET_LIST = 'Steamatic/Finance/PurchaseOrders/RESET';
const ERROR_LIST = 'Steamatic/Finance/PurchaseOrders/ERROR';

export const purchaseOrdersInfoReducer = reduxWrap<IPurchaseOrdersInfoSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const purchaseOrdersListReducer = reduxWrap<IPurchaseOrdersSuccess>({
  load: LOAD_LIST,
  loadComplete: LOAD_COMPLETE_LIST,
  reset: RESET_LIST,
  error: ERROR_LIST
});

const getListingPromise = (type?: StatusType, params?: any): Promise<IPurchaseOrdersSuccess> => {
  switch (type!) {
    case FinanceEntityVirtualStatus.draft:
      return PurchaseOrdersService.getDraft(params);
    case FinanceEntityVirtualStatus.pending_approval:
      return PurchaseOrdersService.getPendingApproval(params);
    case FinanceEntityStatus.approved:
      return PurchaseOrdersService.getApproved(params);
    default:
      return PurchaseOrdersService.getAll(params);
  }
};

export const loadPurchaseOrdersInfo = () => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});

    try {
      const loadingResult = await PurchaseOrdersService.getInfo();
      dispatch({type: LOAD_COMPLETE, payload: loadingResult});
      return loadingResult;
    } catch (er) {
      dispatch({type: ERROR, payload: er});
      throw er;
    }
  };
};

export const getPurchaseOrders = (type?: StatusType, params?: any) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD_LIST});

    try {
      const response = await getListingPromise(type, params);
      dispatch({type: LOAD_COMPLETE_LIST, payload: response});
    } catch (err) {
      dispatch({type: ERROR_LIST, payload: err});
      throw err;
    }
  };
};

export const searchPurchaseOrders = (params?: any) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD_LIST});

    try {
      const response = await PurchaseOrdersService.getFoundPurchaseOrders(params);
      dispatch({type: LOAD_COMPLETE_LIST, payload: response});
    } catch (err) {
      dispatch({type: ERROR_LIST, payload: err});
      throw err;
    }
  };
};
