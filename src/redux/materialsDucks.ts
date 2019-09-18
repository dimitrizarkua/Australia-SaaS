import {IMaterial} from 'src/models/UsageAndActualsModels/IMaterial';
import {reduxWrap, createAsyncAction} from 'src/redux/reduxWrap';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';

const LOAD = 'Steamatic/UsageAndActuals/Materials/LOAD';
const LOAD_COMPLETE = 'Steamatic/UsageAndActuals/Materials/LOAD_COMPLETE';
const RESET = 'Steamatic/UsageAndActuals/Materials/RESET';
const ERROR = 'Steamatic/UsageAndActuals/Materials/ERROR';

export default reduxWrap<IMaterial[]>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadAllMaterials = () => {
  return createAsyncAction(LOAD, LOAD_COMPLETE, ERROR, UsageAndActualsService.getAllMaterials);
};
