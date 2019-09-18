import {combineReducers, Dispatch, Reducer} from 'redux';
import {IHttpError} from 'src/models/IHttpError';
import {default as JobService, ILinkedJobsSuccess, IPhotosSuccess} from 'src/services/JobService';
import {IAppState} from '../index';
import {IPhoto} from 'src/models/IPhoto';

const LOAD_PHOTOS = 'Steamatic/CurrentJob/Photos/LOAD_PHOTOS';
const LOAD_PHOTOS_COMPLETE = 'Steamatic/CurrentJob/Photos/LOAD_PHOTOS_COMPLETE';
const RESET = 'Steamatic/CurrentJob/Photos/RESET';
const ERROR = 'Steamatic/CurrentJob/Photos/ERROR';
const SET_SELECTED_PHOTOS = 'Steamatic/CurrentJob/Photos/SELECTED_PHOTOS';
const RESET_SELECTED_PHOTOS = 'Steamatic/CurrentJob/Photos/RESET_SELECTED_PHOTOS';

export interface ICurrentJobPhotos {
  data: IPhotosSuccess | null;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
  params: {};
  selectedPhotos: IPhoto[];
}

const dataReducer: Reducer<ILinkedJobsSuccess | null> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case LOAD_PHOTOS_COMPLETE:
      return action.payload;
    case RESET:
      return null;

    default:
      return state;
  }
};

const loadingReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_PHOTOS:
      return true;
    case LOAD_PHOTOS_COMPLETE:
      return false;
    case RESET:
      return false;
    default:
      return state;
  }
};

const readyReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_PHOTOS_COMPLETE:
      return true;
    case RESET:
      return false;
    default:
      return state;
  }
};

const paramsReducer: Reducer<{}> = (state = {}, action = {type: null}) => {
  switch (action.type) {
    case LOAD_PHOTOS:
      return action.payload;
    case RESET:
      return {};
    default:
      return state;
  }
};

const errorReducer: Reducer<unknown> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case ERROR:
      return action.payload;

    case LOAD_PHOTOS_COMPLETE:
    case RESET:
      return null;

    default:
      return state;
  }
};

const selectedPhotosReducer: Reducer<unknown> = (state = [], action = {type: null}) => {
  switch (action.type) {
    case SET_SELECTED_PHOTOS:
      return action.payload;
    case RESET:
    case RESET_SELECTED_PHOTOS:
      return [];
    default:
      return state;
  }
};

export default combineReducers({
  data: dataReducer,
  error: errorReducer,
  loading: loadingReducer,
  ready: readyReducer,
  params: paramsReducer,
  selectedPhotos: selectedPhotosReducer
});

export const setSelectedPhotos = (photo: IPhoto) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    const {selectedPhotos} = getState().currentJobPhotos;
    const clone = selectedPhotos.slice(0);

    if (!selectedPhotos.find((el: IPhoto) => el.id === photo.id)) {
      (clone as IPhoto[]).push(photo);
    } else {
      clone.splice(selectedPhotos.map((el: IPhoto) => el.id).indexOf(photo.id), 1);
    }

    dispatch({type: SET_SELECTED_PHOTOS, payload: clone});
  };
};

export const loadCurrentJobPhotos = (id: number | string) => {
  return async (dispatch: Dispatch, getState: () => IAppState) => {
    const requestParams = id || getState().currentJobPhotos.params;

    dispatch({type: LOAD_PHOTOS, payload: requestParams});

    try {
      const photos = await JobService.getJobPhotos(id);
      dispatch({type: LOAD_PHOTOS_COMPLETE, payload: photos});
      return photos;
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const resetJobPhotos = () => {
  return {type: RESET};
};

export const resetSelectedPhotos = () => {
  return {type: RESET_SELECTED_PHOTOS};
};
