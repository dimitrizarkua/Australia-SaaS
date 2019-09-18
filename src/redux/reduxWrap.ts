import {IHttpError} from 'src/models/IHttpError';
import {combineReducers, Dispatch, Reducer} from 'redux';

export interface ISelectionReducerConfig {
  toggle: string;
  massSelect: string;
  resetSelected: string;
}

export interface IReduxWrapConfig {
  load: string;
  loadComplete: string;
  reset: string;
  error: string;
  customReducers?: {
    data?: Reducer<any>;
    loading?: Reducer<boolean>;
    ready?: Reducer<boolean>;
    error?: Reducer<unknown>;
  };
  additionalReducers?: {};
}

export interface IReturnType<T> {
  data: T | null;
  loading: boolean;
  ready: boolean;
  error: IHttpError | null;
}

export function reduxWrap<T>(config: IReduxWrapConfig) {
  const customReducers = config.customReducers || {};

  const dataReducer: Reducer<T | null> =
    (customReducers.data as Reducer<T | null>) ||
    ((state = null, action = {type: null}) => {
      switch (action.type) {
        case config.loadComplete:
          return action.payload;
        case config.reset:
          return null;
        default:
          return state;
      }
    });

  const loadingReducer: Reducer<boolean> =
    customReducers.loading ||
    ((state = false, action = {type: null}) => {
      switch (action.type) {
        case config.load:
          return true;
        case config.loadComplete:
        case config.error:
        case config.reset:
          return false;
        default:
          return state;
      }
    });

  const readyReducer: Reducer<boolean> =
    customReducers.ready ||
    ((state = false, action = {type: null}) => {
      switch (action.type) {
        case config.loadComplete:
          return true;
        case config.reset:
          return false;
        default:
          return state;
      }
    });

  const errorReducer: Reducer<unknown> =
    customReducers.error ||
    ((state = null, action = {type: null}) => {
      switch (action.type) {
        case config.error:
          return action.payload;
        case config.loadComplete:
        case config.reset:
          return null;
        default:
          return state;
      }
    });

  return combineReducers({
    data: dataReducer,
    loading: loadingReducer,
    ready: readyReducer,
    error: errorReducer
  });
}

export function createStandardActionsCreators<T>(config: IReduxWrapConfig) {
  return {
    reset: () => ({type: config.reset}),
    load: () => ({type: config.load}),
    loadComplete: (payload: T) => ({type: config.loadComplete, payload}),
    error: (err: any) => ({type: config.error, payload: err})
  };
}

export function createSelectionReducer(config: ISelectionReducerConfig) {
  const selectReducer: Reducer<Array<number | string>> = (state = [], action = {type: null, payload: null}) => {
    const addIndex = (id: number | string) => [...state, id];
    const removeIndex = (id: number | string) => state.filter((selId: number | string) => id !== selId);
    const alreadyIncluded = (id: number | string) => !!state.includes(id);
    let selectedIds;

    switch (action.type) {
      case config.toggle:
        selectedIds = alreadyIncluded(action.payload) ? removeIndex(action.payload) : addIndex(action.payload);
        return selectedIds;
      case config.massSelect:
        return [...action.payload];
      case config.resetSelected:
        return [];
      default:
        return state;
    }
  };

  return selectReducer;
}

export function createSelectActionsCreators(config: ISelectionReducerConfig) {
  return {
    toggle: (id: number | string) => ({type: config.toggle, payload: id}),
    massSelect: (ids: Array<number | string>) => ({type: config.massSelect, payload: ids}),
    resetSelected: () => ({type: config.resetSelected})
  };
}

export function createAsyncAction<T = any>(
  load: string,
  loadComplete: string,
  error: string,
  loadFunction: () => Promise<any>,
  loadActionParams: any = null
) {
  return async (dispatch: Dispatch): Promise<T> => {
    dispatch({type: load, payload: loadActionParams});

    try {
      const data = await loadFunction();
      dispatch({type: loadComplete, payload: data});
      return data;
    } catch (err) {
      dispatch({type: error, payload: err});
      throw err;
    }
  };
}

export function createSyncAction<T = any>(actionName: string, actionData: T) {
  return (dispatch: Dispatch) => {
    dispatch({type: actionName, payload: actionData});
  };
}
