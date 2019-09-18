import {reduxWrap, IReturnType, createAsyncAction} from '../reduxWrap';
import AddressService, {IStatesSuccess} from 'src/services/AddressService';

const LOAD = 'Steamatic/Contacts/States/LOAD';
const LOAD_COMPLETE = 'Steamatic/States/Countries/LOAD_COMPLETE';
const RESET = 'Steamatic/Contacts/States/RESET';
const ERROR = 'Steamatic/Contacts/States/ERROR';

export type StatesStateType = IReturnType<IStatesSuccess>;

export default reduxWrap<IStatesSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadAllStates = () => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, AddressService.searchStates);
};
