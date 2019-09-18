import {IReturnType, reduxWrap} from 'src/redux/reduxWrap';
import {combineReducers, Dispatch} from 'redux';
import {ContactStatuses, IContactStatus} from 'src/models/IContactStatus';
import ContactService from 'src/services/ContactService';

const LOAD = 'Steamatic/Contacts/Statuses/LOAD';
const LOAD_COMPLETE = 'Steamatic/Contacts/Statuses/LOAD_COMPLETE';
const RESET = 'Steamatic/Contacts/Statuses/RESET';
const ERROR = 'Steamatic/Contacts/Statuses/ERROR';

const statusesReducer = reduxWrap<IContactStatus[]>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadContactStatuses = () => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});

    try {
      const res = await ContactService.getContactStatuses();
      dispatch({type: LOAD_COMPLETE, payload: res});
    } catch (e) {
      dispatch({type: ERROR, payload: null});
      throw e;
    }
  };
};

export interface IContactStatusesRedux {
  statuses: IReturnType<ContactStatuses[]>;
}

export default combineReducers({
  statuses: statusesReducer
});
