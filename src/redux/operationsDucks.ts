import {reduxWrap} from 'src/redux/reduxWrap';
import {IRun} from 'src/models/IRun';
import {Dispatch} from 'redux';
import {IConfigForRunsSearch, default as OperationsService} from 'src/services/OperationsService';

const LOAD = 'Steamatic/Operations/Runs/LOAD';
const LOAD_COMPLETE = 'Steamatic/Operations/Runs/LOAD_COMPLETE';
const RESET = 'Steamatic/Operations/Runs/RESET';
const ERROR = 'Steamatic/Operations/Runs/ERROR';

export const searchRunsListReducer = reduxWrap<IRun[]>({
  load: LOAD,
  loadComplete: LOAD_COMPLETE,
  reset: RESET,
  error: ERROR
});

export const searchRuns = (config: IConfigForRunsSearch) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD});

    try {
      const loadingResult = await OperationsService.getRuns(config);
      dispatch({type: LOAD_COMPLETE, payload: loadingResult});
      return loadingResult;
    } catch (er) {
      dispatch({type: ERROR, payload: er});
      throw er;
    }
  };
};

export const resetRuns = () => {
  return {type: RESET};
};
