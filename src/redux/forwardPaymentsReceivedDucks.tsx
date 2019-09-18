import {Dispatch} from 'redux';
import {reduxWrap, createStandardActionsCreators} from './reduxWrap';
// TODO change to final API version
import {IForwardedPayment} from 'src/models/FinanceModels/IPayments';
import PaymentsService from 'src/services/PaymentsService';

const LOAD = 'Steamatic/Finance/ForwardPaymentsReceived/LOAD_JOB';
const LOAD_COMPLETE = 'Steamatic/Finance/ForwardPaymentsReceived/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/ForwardPaymentsReceived/RESET';
const ERROR = 'Steamatic/Finance/ForwardPaymentsReceived/ERROR';

const LOAD_INFO = 'Steamatic/Finance/ForwardPaymentsReceived/LOAD_JOB_INFO';
const LOAD_COMPLETE_INFO = 'Steamatic/Finance/ForwardPaymentsReceived/LOAD_COMPLETE_INFO';
const RESET_INFO = 'Steamatic/Finance/ForwardPaymentsReceived/RESET_INFO';
const ERROR_INFO = 'Steamatic/Finance/ForwardPaymentsReceived/ERROR_INFO';

const listReducerConfig = {
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
};

const infoReducerConfig = {
  load: LOAD_INFO,
  loadComplete: LOAD_COMPLETE_INFO,
  reset: RESET_INFO,
  error: ERROR_INFO
};

export const forwardedPaymentsReducer = reduxWrap<IForwardedPayment[]>(listReducerConfig);
const listActionCreators = createStandardActionsCreators(listReducerConfig);

export const forwardedPaymentsInfoReducer = reduxWrap<IForwardedPayment[]>(infoReducerConfig);
const infoActionCreators = createStandardActionsCreators(infoReducerConfig);

export const getReceivedPayments = (params: any) => {
  return async (dispatch: Dispatch) => {
    dispatch(listActionCreators.load());
    try {
      const response = await PaymentsService.getForwardedPayments(params);
      dispatch(listActionCreators.loadComplete(response));
    } catch (err) {
      dispatch(listActionCreators.error(err));
      throw err;
    }
  };
};

export const getReceivedPaymentsInfo = (params: any) => {
  return async (dispatch: Dispatch) => {
    dispatch(infoActionCreators.load());
    try {
      const response = await PaymentsService.getForwardedPaymentsInfo(params);
      dispatch(infoActionCreators.loadComplete(response));
    } catch (err) {
      dispatch(infoActionCreators.error(err));
      throw err;
    }
  };
};
