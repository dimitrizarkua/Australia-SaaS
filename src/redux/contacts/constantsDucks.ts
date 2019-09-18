import {Dispatch, Reducer} from 'redux';
import {IAssignment} from 'src/models/IJob';
import JobService from 'src/services/JobService';

const LOAD_COMPLETE = 'Steamatic/Constants/LOAD_COMPLETE';

export interface IConstants {
  jobAssignmentTypes: IAssignment[];
}

const defaultState = {
  jobAssignmentTypes: []
};

const reducer: Reducer<IConstants> = (state = defaultState, action = {type: null}) => {
  switch (action.type) {
    case LOAD_COMPLETE:
      return action.payload;

    default:
      return state;
  }
};

export default reducer;

export const loadConstants = () => {
  return async (dispatch: Dispatch) => {
    return Promise.all([JobService.getAssignmentTypes()]).then(([jobAssignmentTypes]) => {
      dispatch({type: LOAD_COMPLETE, payload: {jobAssignmentTypes}});
    });
  };
};
