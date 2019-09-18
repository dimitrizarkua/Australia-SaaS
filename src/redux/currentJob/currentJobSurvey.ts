import {combineReducers, Dispatch, Reducer, Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IHttpError} from 'src/models/IHttpError';
import {default as ManagementService} from 'src/services/ManagementService';
import {default as JobSiteSurveyService} from 'src/services/JobSiteSurveyService';
import {IFlooringType, IBaseRoomType, IRoomType, ISurveyType} from 'src/models/ISiteSurvey';
import {IAppState} from '../index';

const LOAD_SITE_SURVEY = 'Steamatic/CurrentJobSurvey/LOAD_SITE_SURVEY';
const LOAD_SITE_SURVEY_COMPLETE = 'Steamatic/CurrentJobSurvey/LOAD_SITE_SURVEY_COMPLETE';

const LOAD_FLOORING_TYPES = 'Steamatic/CurrentJobSurvey/LOAD_FLOORING_TYPES';
const LOAD_FLOORING_TYPES_COMPLETE = 'Steamatic/CurrentJobSurvey/LOAD_FLOORING_TYPES_COMPLETE';

const SEND_SURVEY_ANSWER = 'Steamatic/CurrentJobSurvey/LOAD_SITE_SURVEY';
const SEND_SURVEY_ANSWER_COMPLETE = 'Steamatic/CurrentJobSurvey/LOAD_SITE_SURVEY_COMPLETE';

const REQUEST_JOB_ROOM = 'Steamatic/CurrentJobSurvey/SEND_JOB_ROOM';
const REQUEST_REMOVE_JOB_ROOM = 'Steamatic/CurrentJobSurvey/REQUEST_REMOVE_JOB_ROOM';
const SEND_JOB_ROOM_COMPLETE = 'Steamatic/CurrentJobSurvey/SEND_JOB_ROOM_COMPLETE';
const REMOVE_JOB_ROOM_COMPLETE = 'Steamatic/CurrentJobSurvey/REMOVE_JOB_ROOM_COMPLETE';

const RESET = 'Steamatic/CurrentJobSurvey/RESET';
const ERROR = 'Steamatic/CurrentJobSurvey/ERROR';

interface IExtendedSurvey extends ISurveyType {
  flooringTypes: IFlooringType[];
}

export interface ISurveyState {
  data: IExtendedSurvey;
  error: IHttpError | null;
  loading: boolean;
  removing: {
    rooms: number[];
  };
  ready: {
    surveyIsReady: boolean;
    flooringIsReady: boolean;
  };
}

const initialState: ISurveyState = {
  data: {
    allQuestions: [],
    jobQuestions: [],
    jobRooms: [] as IRoomType[],
    flooringTypes: [] as IFlooringType[]
  },
  error: null,
  removing: {
    rooms: []
  },
  loading: false,
  ready: {
    surveyIsReady: false,
    flooringIsReady: false
  }
};

const dataReducer: Reducer<any | null> = (state = initialState.data, action = {type: null}) => {
  switch (action.type) {
    case LOAD_FLOORING_TYPES_COMPLETE:
      return {
        ...state,
        flooringTypes: action.payload
      };
    case LOAD_SITE_SURVEY_COMPLETE:
      return {
        ...state,
        ...action.payload
      };
    case SEND_JOB_ROOM_COMPLETE:
      return {
        ...state,
        jobRooms: [...state.jobRooms, action.payload]
      };
    case REMOVE_JOB_ROOM_COMPLETE:
      return {
        ...state,
        jobRooms: state.jobRooms.filter((r: IRoomType) => r.id !== action.payload)
      };
    case RESET:
      return initialState.data;
    default:
      return state;
  }
};

const loadingReducer: Reducer<boolean> = (state = initialState.loading, action = {type: null}) => {
  switch (action.type) {
    case LOAD_FLOORING_TYPES:
    case LOAD_SITE_SURVEY:
    case SEND_SURVEY_ANSWER:
    case REQUEST_JOB_ROOM:
      return true;
    case LOAD_FLOORING_TYPES_COMPLETE:
    case LOAD_SITE_SURVEY_COMPLETE:
    case SEND_SURVEY_ANSWER_COMPLETE:
    case SEND_JOB_ROOM_COMPLETE:
    case ERROR:
      return false;
    case RESET:
      return initialState.loading;
    default:
      return state;
  }
};

const removingReducer: Reducer<{rooms: number[]}> = (state = initialState.removing, action = {type: null}) => {
  switch (action.type) {
    case REQUEST_REMOVE_JOB_ROOM:
      return {
        ...state,
        rooms: [...state.rooms, action.payload]
      };
    case REMOVE_JOB_ROOM_COMPLETE:
      return {
        ...state,
        rooms: state.rooms.filter((r: number) => r !== action.payload)
      };
    default:
      return state;
  }
};

const readyReducer: Reducer<{surveyIsReady: boolean; flooringIsReady: boolean}> = (
  state = initialState.ready,
  action = {type: null}
) => {
  switch (action.type) {
    case LOAD_FLOORING_TYPES_COMPLETE:
      return {
        surveyIsReady: state.surveyIsReady,
        flooringIsReady: true
      };
    case LOAD_SITE_SURVEY_COMPLETE:
      return {
        surveyIsReady: true,
        flooringIsReady: state.flooringIsReady
      };
    case RESET:
      return initialState.ready;
    default:
      return state;
  }
};

const errorReducer: Reducer<unknown> = (state = initialState.error, action = {type: null}) => {
  switch (action.type) {
    case ERROR:
      return action.payload;
    case LOAD_SITE_SURVEY_COMPLETE:
    case RESET:
      return initialState.error;
    default:
      return state;
  }
};

export default combineReducers({
  data: dataReducer,
  error: errorReducer,
  loading: loadingReducer,
  removing: removingReducer,
  ready: readyReducer
});

export const reset = () => {
  return {type: RESET};
};

const requestError = (err: any) => ({
  type: ERROR,
  payload: err
});

const startLoadSurvey = () => ({
  type: LOAD_SITE_SURVEY
});

const startSendAnswer = () => ({
  type: SEND_SURVEY_ANSWER
});

const startRoomRequest = () => ({
  type: REQUEST_JOB_ROOM
});

const startRemoveRoom = (id: string | number) => ({
  type: REQUEST_REMOVE_JOB_ROOM,
  payload: Number(id)
});

const loadSurveySuccess = (data: any) => ({
  type: LOAD_SITE_SURVEY_COMPLETE,
  payload: data
});

const sendAnswerSuccess = () => ({
  type: SEND_SURVEY_ANSWER_COMPLETE
});

const sendRoomSuccess = (data: IRoomType) => ({
  type: SEND_JOB_ROOM_COMPLETE,
  payload: data
});

const flooringTypesLoadingSuccess = (data: IFlooringType[]) => ({
  type: LOAD_FLOORING_TYPES_COMPLETE,
  payload: data
});

const removeRoomSuccess = (id: string | number) => ({
  type: REMOVE_JOB_ROOM_COMPLETE,
  payload: Number(id)
});

export const loadFlooringTypes = () => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>, getState: () => IAppState) => {
    const loadedSurvey = getState().currentJobSurvey;
    if (!loadedSurvey.ready.flooringIsReady) {
      const res = await ManagementService.getFlooringTypes();
      dispatch(flooringTypesLoadingSuccess(res.data));
    }
  };
};

export const loadJobSiteSurvey = (id: string | number) => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>) => {
    const promises = [
      JobSiteSurveyService.getJobSurvey(id) as Promise<any>,
      (dispatch as ThunkDispatch<any, any, Action>)(loadFlooringTypes())
    ];
    dispatch(startLoadSurvey());
    try {
      const res = await Promise.all(promises);
      const survey = res[0].data;
      dispatch(loadSurveySuccess(survey));
    } catch (err) {
      dispatch(requestError(err));
      throw err;
    }
  };
};

export const sendSurveyAnswer = (
  jobId: string | number,
  questionId: string | number,
  {optionId, answer}: {optionId?: number | undefined; answer?: string}
) => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>) => {
    const params: any = {};
    if (optionId) {
      params.site_survey_question_option_id = optionId;
    }
    if (answer) {
      params.answer = answer;
    }
    dispatch(startSendAnswer());
    try {
      await JobSiteSurveyService.attachQuestionOption(jobId, questionId, params);
      await (dispatch as ThunkDispatch<any, any, Action>)(loadJobSiteSurvey(jobId));
      dispatch(sendAnswerSuccess());
    } catch (err) {
      dispatch(requestError(err));
      throw err;
    }
  };
};

export const sendJobRoom = (jobId: string | number, room: IBaseRoomType) => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>) => {
    dispatch(startRoomRequest());
    try {
      const res = await JobSiteSurveyService.postJobRooms(jobId, room);
      dispatch(sendRoomSuccess(res.data));
    } catch (err) {
      dispatch(requestError(err));
      throw err;
    }
  };
};

export const removeJobRoom = (jobId: string | number, id: string | number) => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>) => {
    dispatch(startRemoveRoom(id));
    try {
      await JobSiteSurveyService.removeJobRooms(jobId, id);
      dispatch(removeRoomSuccess(id));
    } catch (err) {
      dispatch(requestError(err));
      throw err;
    }
  };
};
