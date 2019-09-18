import {Reducer, Dispatch, combineReducers} from 'redux';
import {
  reduxWrap,
  IReturnType,
  createStandardActionsCreators,
  createSelectionReducer,
  createSelectActionsCreators
} from './reduxWrap';
import {IInvoiceForPayment, PaymentTypesEnum} from 'src/models/FinanceModels/IInvoices';
import InvoicesService from 'src/services/InvoicesService';

const LOAD = 'Steamatic/Finance/ReceivePayments/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/ReceivePayments/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/ReceivePayments/RESET';
const ERROR = 'Steamatic/Finance/ReceivePayments/ERROR';

const TOGGLE_INVOICE = 'Steamatic/Finance/ReceivePayments/TOGGLE_INVOICE';
const RESET_SELECTED_INVOICES = 'Steamatic/Finance/ReceivePayments/RESET_SELECTED_INVOICES';
const MASS_SELECT_INVOICES = 'Steamatic/Finance/ReceivePayments/MASS_SELECT_INVOICES';

const SET_PAYMENT_TYPE = 'Steamatic/Finance/ReceivePayments/SET_PAYMENT_TYPE';
const SET_AMOUNT = 'Steamatic/Finance/ReceivePayments/SET_AMOUNT';

export interface IReceivePaymentsState {
  data: IInvoiceForPayment[];
  selectedIds: Array<number | string>;
}

export type ReceivePaymentsStateType = IReturnType<IReceivePaymentsState>;

const listReducerConfig = {
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
};

const selectReducerConfig = {
  toggle: TOGGLE_INVOICE,
  resetSelected: RESET_SELECTED_INVOICES,
  massSelect: MASS_SELECT_INVOICES
};

const addPaymentFields = (paymentInvoice: IInvoiceForPayment) => ({
  ...paymentInvoice,
  payment_type: PaymentTypesEnum.DP,
  payment_amount: 0
});

const paymentsReducer: Reducer<any> = (state = [], action = {type: null, payload: null}) => {
  const findIndexById = (id: number | string) =>
    state.findIndex((paymentInvoice: IInvoiceForPayment) => paymentInvoice.id === id);
  let foundIndex;

  switch (action.type) {
    case LOAD_COMPLETE:
      return action.payload.data.map(addPaymentFields);
    case SET_PAYMENT_TYPE:
      foundIndex = findIndexById(action.payload.id);
      if (foundIndex >= 0) {
        state[foundIndex].payment_type = action.payload.payment_type;
      }
      return [...state];
    case SET_AMOUNT:
      foundIndex = findIndexById(action.payload.id);
      if (foundIndex >= 0) {
        state[foundIndex].payment_amount = action.payload.amount;
      }
      return [...state];
    case RESET:
      return [];
    default:
      return state;
  }
};

const receivePaymentsReducer = reduxWrap<IReceivePaymentsState>({
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

export const toggleSelection = (paymentInvoice: IInvoiceForPayment) =>
  selectionActionCreators.toggle(paymentInvoice.id);

export const reset = actionCreators.reset();

export const setPaymentType = (id: string | number, paymentType: 'DP' | 'FP') => ({
  type: SET_PAYMENT_TYPE,
  payload: {id, payment_type: paymentType}
});

export const setAmount = (id: string | number, amount: number) => ({
  type: SET_AMOUNT,
  payload: {id, amount}
});

export const searchPaymentInvoices = (term: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(selectionActionCreators.resetSelected());
    dispatch(actionCreators.load());
    try {
      const response = await InvoicesService.search({id: term, virtual_status: 'unpaid'});
      dispatch(actionCreators.loadComplete(response));
    } catch (err) {
      dispatch(actionCreators.error(err));
      throw err;
    }
  };
};

export default receivePaymentsReducer;
