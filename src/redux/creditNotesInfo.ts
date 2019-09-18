import {Dispatch} from 'redux';
import {ICreditNotesInfo} from 'src/models/FinanceModels/ICreditNotes';
import CreditNotesService from 'src/services/CreditNotesService';
import {reduxWrap} from 'src/redux/reduxWrap';

const LOAD = 'Steamatic/Finance/CreditNotesInfo/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/CreditNotesInfo/LOAD_COMPLETE';
const RESET = 'Steamatic/Finance/CreditNotesInfo/RESET';
const ERROR = 'Steamatic/Finance/CreditNotesInfo/ERROR';

export default reduxWrap<ICreditNotesInfo>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const resetInfo = () => ({type: RESET});

export const getCreditNotesInfo = () => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});

    try {
      const response = await CreditNotesService.getInfo();
      dispatch({type: LOAD_COMPLETE, payload: response});
    } catch (err) {
      console.error(err);
    }
  };
};
