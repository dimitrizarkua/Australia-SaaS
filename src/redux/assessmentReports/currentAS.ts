import {reduxWrap} from 'src/redux/reduxWrap';
import {prefix as prfx} from 'src/redux/assessmentReports/assessmentReportsDucks';
import {Dispatch} from 'redux';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';

const prefix = 'CurrentAS/';
const load = `${prfx}${prefix}Load`;
const loadComplete = `${prfx}${prefix}LoadComplete`;
const reset = `${prfx}${prefix}Reset`;
const error = `${prfx}${prefix}Error`;

export const currentAR = reduxWrap({load, loadComplete, reset, error});

export const loadCurrentAR = (jobId: number, arId: number, config?: {}) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: load});

    try {
      const res = await UsageAndActualsService.assessmentReportsGet(jobId, arId, config);
      dispatch({type: loadComplete, payload: res});
    } catch (e) {
      dispatch({type: error, payload: null});
    }
  };
};

export const resetCurrentAR = () => {
  return (dispatch: Dispatch) => {
    dispatch({type: reset});
  };
};
