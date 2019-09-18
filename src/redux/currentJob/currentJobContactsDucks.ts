import JobService from 'src/services/JobService';
import {createAsyncAction, reduxWrap} from 'src/redux/reduxWrap';
import {IContactAssignment} from 'src/models/IJob';

const LOAD = 'Steamatic/CurrentJobContacts/LOAD';
const LOAD_COMPLETE = 'Steamatic/CurrentJobContacts/LOAD_COMPLETE';
const RESET = 'Steamatic/CurrentJobContacts/RESET';
const ERROR = 'Steamatic/CurrentJobContacts/ERROR';

export default reduxWrap<IContactAssignment[]>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadJobContacts = (id: string | number) => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, () => JobService.getContacts(id));
};

export const resetJobContacts = () => {
  return {type: RESET};
};
