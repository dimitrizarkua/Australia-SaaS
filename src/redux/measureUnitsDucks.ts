import {reduxWrap} from 'src/redux/reduxWrap';
import {IMeasureUnit} from 'src/models/UsageAndActualsModels/IMaterial';
import {Dispatch} from 'redux';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';

const LOAD = 'Steamatic/UsageAndActuals/MeasureUnits/LOAD';
const LOAD_COMPLETE = 'Steamatic/UsageAndActuals/MeasureUnits/LOAD_COMPLETE';
const RESET = 'Steamatic/UsageAndActuals/MeasureUnits/RESET';
const ERROR = 'Steamatic/UsageAndActuals/MeasureUnits/ERROR';

export default reduxWrap<IMeasureUnit[]>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const loadAllMeasureUnits = () => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});

    try {
      const materials = await UsageAndActualsService.getAllMeasureUnits();
      dispatch({type: LOAD_COMPLETE, payload: materials});
      return materials;
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};
