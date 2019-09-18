import {combineReducers, Reducer} from 'redux';
import {uniqBy} from 'lodash';
import {IHttpError} from 'src/models/IHttpError';
import JobService from 'src/services/JobService';
import {ITag} from 'src/models/ITag';
import {createAsyncAction} from 'src/redux/reduxWrap';
import {IJob, ILinkedJob} from 'src/models/IJob';

const LOAD_JOB = 'Steamatic/CurrentJob/LOAD_JOB';
const LOAD_JOB_COMPLETE = 'Steamatic/CurrentJob/LOAD_JOB_COMPLETE';
const RESET = 'Steamatic/CurrentJob/RESET';
const ERROR = 'Steamatic/CurrentJob/ERROR';
const UPDATE_JOB = 'Steamatic/CurrentJob/UPDATE_JOB';
const ASSIGN_TAG = 'Steamatic/CurrentJob/ASSIGN_TAG';
const REMOVE_TAG = 'Steamatic/CurrentJob/REMOVE_TAG';
const UPDATE_LINKED_JOBS = 'Steamatic/CurrentJob/UPDATE_LINKED_JOBS';

export interface ICurrentJob {
  data: IJob | null;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

const dataReducer: Reducer<IJob | null> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case LOAD_JOB_COMPLETE:
      return action.payload;

    case RESET:
      return null;

    case UPDATE_JOB:
      if (!state) {
        return null;
      }

      // For the sake of minimization of regressions before demo, only few fields are updated here.
      // TODO use this action to update all fields from payload, stop refetch the job on every change
      return {
        ...state,
        site_address: action.payload.data.site_address,
        site_address_id: action.payload.data.site_address_id,
        site_address_lat: action.payload.data.site_address_lat,
        site_address_lng: action.payload.data.site_address_lng
      };

    case ASSIGN_TAG:
      if (!state) {
        return null;
      }
      return {...state, tags: uniqBy([...state.tags, action.payload], 'id')};

    case REMOVE_TAG:
      if (!state) {
        return null;
      }
      return {...state, tags: state.tags.filter(tag => tag.id !== action.payload.id)};

    case UPDATE_LINKED_JOBS:
      if (!state) {
        return null;
      }
      return {...state, linked_jobs: action.payload};

    default:
      return state;
  }
};

const loadingReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_JOB:
      return true;
    case LOAD_JOB_COMPLETE:
      return false;
    case RESET:
      return false;
    default:
      return state;
  }
};

const readyReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_JOB_COMPLETE:
      return true;
    case RESET:
      return false;
    default:
      return state;
  }
};

const errorReducer: Reducer<unknown> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case ERROR:
      return action.payload;

    case LOAD_JOB_COMPLETE:
    case RESET:
      return null;

    default:
      return state;
  }
};

export default combineReducers({
  data: dataReducer,
  error: errorReducer,
  loading: loadingReducer,
  ready: readyReducer
});

export const loadCurrentJob = (id: string | number) => {
  return createAsyncAction(LOAD_JOB, LOAD_JOB_COMPLETE, ERROR, () => JobService.findById(id));
};

export const resetCurrentJob = () => {
  return {type: RESET};
};

export const updateCurrentJob = (data: Partial<IJob>) => {
  return {type: UPDATE_JOB, payload: {data}};
};

export const assignJobTag = (jobId: number, tag: ITag) => {
  return async (dispatch: any) => {
    try {
      await JobService.assignTag(jobId, tag.id);
      dispatch({type: ASSIGN_TAG, payload: tag});
    } catch (e) {
      //
    }
  };
};

export const removeJobTag = (jobId: number, tag: ITag) => {
  return async (dispatch: any) => {
    try {
      await JobService.removeTag(jobId, tag.id);
      dispatch({type: REMOVE_TAG, payload: tag});
    } catch (e) {
      //
    }
  };
};

const updateLinkedJobs = (jobId: number) => {
  return async (dispatch: any) => {
    const jobs = await JobService.getLinkedJobs(jobId);
    dispatch({type: UPDATE_LINKED_JOBS, payload: jobs.data});
  };
};

export const linkJobs = (jobId: number, jobs: Array<string | number>) => {
  return (dispatch: any) => {
    const promises: any[] = [];
    jobs.forEach(job => {
      promises.push(JobService.linkJobs(jobId, job));
    });

    return Promise.all(promises).then(() => {
      dispatch(updateLinkedJobs(jobId));
    });
  };
};

export const unlinkJob = (jobId: number, job: ILinkedJob) => {
  return async (dispatch: any) => {
    const removingLink = await JobService.removeLink(jobId, job.id);
    if (removingLink !== undefined) {
      dispatch(updateLinkedJobs(jobId));
    }
  };
};
