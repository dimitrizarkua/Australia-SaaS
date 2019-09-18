import {Reducer, Dispatch, Action, combineReducers} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {
  reduxWrap,
  IReturnType,
  createSelectionReducer,
  createStandardActionsCreators,
  createSelectActionsCreators
} from './reduxWrap';
import {IAppState} from './index';
// TODO change to final API version
import {IPaymentToForwardParams} from 'src/models/FinanceModels/IPayments';
import PaymentsService from 'src/services/PaymentsService';

const LOAD = 'Steamatic/Finance/ForwardPayments/LOAD_JOB';
const LOAD_COMPLETE = 'Steamatic/Finance/ForwardPayments/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/ForwardPayments/RESET';
const ERROR = 'Steamatic/Finance/ForwardPayments/ERROR';

const TOGGLE_INVOICE_PAYMENT = 'Steamatic/Finance/ForwardPayments/TOGGLE_INVOICE_PAYMENT';
const MASS_SELECT_INVOICE_PAYMENT = 'Steamatic/Finance/ForwardPayments/MASS_SELECT_INVOICE_PAYMENT';
const RESET_SELECTED_INVOICE_PAYMENT = 'Steamatic/Finance/ForwardPayments/RESET_SELECTED_INVOICE_PAYMENT';

export interface IForwardPaymentsState {
  data: any[];
  selectedIds: Array<number | string>;
}

export type InvoicePaymentsStateType = IReturnType<IForwardPaymentsState>;

const listReducerConfig = {
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
};

const selectReducerConfig = {
  toggle: TOGGLE_INVOICE_PAYMENT,
  massSelect: MASS_SELECT_INVOICE_PAYMENT,
  resetSelected: RESET_SELECTED_INVOICE_PAYMENT
};

const paymentsReducer: Reducer<any> = (state = [], action = {type: null, payload: null}) => {
  switch (action.type) {
    case LOAD_COMPLETE:
      return action.payload.data;
    case RESET:
      return [];
    default:
      return state;
  }
};

const forwardPaymentsReducer = reduxWrap<IForwardPaymentsState>({
  ...listReducerConfig,
  customReducers: {
    data: combineReducers({
      data: paymentsReducer,
      selectedIds: createSelectionReducer(selectReducerConfig)
    })
  }
});

const actionCreators = createStandardActionsCreators(listReducerConfig);
const selectionActionCreators = createSelectActionsCreators(selectReducerConfig);

export const resetSelection = selectionActionCreators.resetSelected;

export const togglePayment = (payment: any) => {
  return selectionActionCreators.toggle(payment.id);
};

export const massSelect = (payments: any[]) => {
  return selectionActionCreators.massSelect(payments.map(p => p.id));
};

export const reset = actionCreators.reset();

export const getPayments = (params: any) => {
  return async (dispatch: Dispatch) => {
    dispatch(actionCreators.load());
    try {
      const response = await PaymentsService.getPaymentsToForward(params);
      dispatch(actionCreators.loadComplete(response));
    } catch (err) {
      dispatch(actionCreators.error(err));
      throw err;
    }
  };
};

export const forwardPayments = (data: IPaymentToForwardParams, params: any) => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>, getState: () => IAppState) => {
    try {
      dispatch(actionCreators.load());
      await PaymentsService.forwardPayments({
        ...data,
        invoices_ids: getState().forwardPayments.data!.selectedIds
      });
    } catch (err) {
      dispatch(actionCreators.error(err));
      throw err;
    }
    return await (dispatch as ThunkDispatch<any, any, Action>)(getPayments(params));
  };
};

export default forwardPaymentsReducer;
