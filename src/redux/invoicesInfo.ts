import {Dispatch} from 'redux';
import {IInvoicesListInfo} from 'src/models/FinanceModels/IInvoices';
import InvoicesService from 'src/services/InvoicesService';
import {reduxWrap} from 'src/redux/reduxWrap';

const LOAD = 'Steamatic/Finance/InvoicesInfo/LOAD';
const LOAD_COMPLETE = 'Steamatic/Finance/InvoicesInfo/LOAD_COMPLETE';
const ERROR = 'Steamatic/Finance/InvoicesInfo/ERROR';
const RESET = 'Steamatic/Finance/InvoicesInfo/RESET';

export default reduxWrap<IInvoicesListInfo>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const setInvoicesInfo = (payload: IInvoicesListInfo) => ({type: LOAD_COMPLETE, payload});

export const resetInvoicesInfo = () => ({type: RESET});

export const getInvoicesInfo = () => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});
    try {
      const response = await InvoicesService.getInfo();
      dispatch(setInvoicesInfo(response.data));
    } catch (err) {
      console.error(err);
    }
  };
};
