import {createStandardActionsCreators, reduxWrap} from './reduxWrap';
import CreditNotesService, {ICreditNotesSuccess} from 'src/services/CreditNotesService';
import {Dispatch} from 'redux';
import {StatusType} from 'src/redux/invoicesDucks';
import {FinanceEntityStatus, FinanceEntityVirtualStatus} from 'src/constants/FinanceEntityStatus';

const LOAD = 'Steamatic/Finance/CreditNotes/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/CreditNotes/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/CreditNotes/RESET';
const ERROR = 'Steamatic/Finance/CreditNotes/ERROR';

const reduxConfig = {
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
};

export default reduxWrap<ICreditNotesSuccess>(reduxConfig);

const actionsCreators = createStandardActionsCreators(reduxConfig);

const getListingPromise = (type?: StatusType, params?: any): Promise<ICreditNotesSuccess> => {
  switch (type!) {
    case FinanceEntityStatus.draft:
      return CreditNotesService.getDraft(params);
    case FinanceEntityVirtualStatus.pending_approval:
      return CreditNotesService.getPendingApproval(params);
    case FinanceEntityStatus.approved:
      return CreditNotesService.getApproved(params);
    default:
      return CreditNotesService.getAll(params);
  }
};

export const reset = actionsCreators.reset();

export const getCreditNotes = (type?: StatusType, params?: any) => {
  return async (dispatch: Dispatch) => {
    dispatch(actionsCreators.load());

    try {
      const response = await getListingPromise(type, params);
      dispatch(actionsCreators.loadComplete(response));
    } catch (err) {
      dispatch(actionsCreators.error(err));
      throw err;
    }
  };
};

export const searchCreditNotes = (params?: any) => {
  return async (dispatch: Dispatch) => {
    dispatch(actionsCreators.load());

    try {
      const response = await CreditNotesService.search(params);
      dispatch(actionsCreators.loadComplete(response));
    } catch (err) {
      dispatch(actionsCreators.error(err));
      throw err;
    }
  };
};
