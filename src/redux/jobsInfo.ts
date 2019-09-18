import {Dispatch, Reducer} from 'redux';
import {IJobsInfo} from 'src/models/IJobsInfo';
import SidebarSummaryService from 'src/services/JobsInfoService';

const SET_JOBS_INFO = 'Steamatic/Jobs/SET_JOBS_INFO';

type State = IJobsInfo | null;

const reducer: Reducer<State> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case SET_JOBS_INFO:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;

export const updateJobsInfo = () => {
  return async (dispatch: Dispatch) => {
    const jobsInfo = await SidebarSummaryService.getJobsInfo();
    dispatch({type: SET_JOBS_INFO, payload: jobsInfo.data});
    return jobsInfo.data;
  };
};
