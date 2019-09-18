import {reduxWrap, IReturnType, createAsyncAction} from '../reduxWrap';
import AddressService, {ICountriesSuccess} from 'src/services/AddressService';

const LOAD = 'Steamatic/Contacts/Countries/LOAD';
const LOAD_COMPLETE = 'Steamatic/Contacts/Countries/LOAD_COMPLETE';
const RESET = 'Steamatic/Contacts/Countries/RESET';
const ERROR = 'Steamatic/Contacts/Countries/ERROR';

export type CountriesStateType = IReturnType<ICountriesSuccess>;

export default reduxWrap<ICountriesSuccess>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadAllCountries = () => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, AddressService.searchCountries);
};
