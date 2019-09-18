import {reduxWrap, createAsyncAction} from 'src/redux/reduxWrap';
import {IEquipment} from 'src/models/UsageAndActualsModels/IEquipment';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';

const LOAD = 'Steamatic/UsageAndActuals/Equipment/LOAD';
const LOAD_COMPLETE = 'Steamatic/UsageAndActuals/Equipment/LOAD_COMPLETE';
const RESET = 'Steamatic/UsageAndActuals/Equipment/RESET';
const ERROR = 'Steamatic/UsageAndActuals/Equipment/ERROR';

export default reduxWrap<IEquipment[]>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadAllEquipment = () => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, UsageAndActualsService.getAllEquipments);
};
