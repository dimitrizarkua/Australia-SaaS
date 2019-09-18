import {reduxWrap, IReturnType} from './reduxWrap';
import {Dispatch} from 'redux';
import InvoicesService, {IInvoicesSuccess} from 'src/services/InvoicesService';
import {FinanceEntityStatus, FinanceEntityVirtualStatus} from 'src/constants/FinanceEntityStatus';

const LOAD = 'Steamatic/Finance/Invoices/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/Invoices/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/Invoices/RESET';
const ERROR = 'Steamatic/Finance/Invoices/ERROR';

export type InvoicesStateType = IReturnType<IInvoicesSuccess>;

export default reduxWrap<IInvoicesSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export type StatusType = FinanceEntityVirtualStatus & FinanceEntityStatus;

const getListingPromise = (type?: StatusType, params?: any): Promise<IInvoicesSuccess> => {
  switch (type!) {
    case FinanceEntityVirtualStatus.draft:
      return InvoicesService.getDraft(params);
    case FinanceEntityVirtualStatus.unpaid:
      return InvoicesService.getUnpaid(params);
    case FinanceEntityVirtualStatus.overdue:
      return InvoicesService.getOverdue(params);
    default:
      return InvoicesService.getAll(params);
  }
};

export const getInvoices = (type?: StatusType, params?: any) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});
    try {
      const response = await getListingPromise(type, params);
      dispatch({type: LOAD_COMPLETE, payload: response});
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const searchInvoices = (params: {term: string; type?: StatusType; page?: number}) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});
    try {
      const statuses = getValidStatuses(params.type);
      const response = await InvoicesService.search({
        id: params.term,
        virtual_status: statuses.virtualStatus,
        page: params.page,
        status: statuses.status
      });
      dispatch({type: LOAD_COMPLETE, payload: response});
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export function getValidStatuses(type?: StatusType) {
  let virtualStatus = type && FinanceEntityVirtualStatus[type!];
  let status = type && FinanceEntityStatus[type!];

  if (type === FinanceEntityStatus.draft) {
    virtualStatus = undefined;
    status = type;
  }

  return {
    virtualStatus,
    status
  };
}
