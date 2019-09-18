import {Dispatch, Reducer, combineReducers} from 'redux';
import {INotesAndMessages} from 'src/models/INotesAndMessages';
import {IDocument} from 'src/models/IDocument';
import NotesAndMessagesService from 'src/services/NotesAndMessagesService';
import DocumentsService from 'src/services/DocumentsService';
import {IHttpError} from 'src/models/IHttpError';

const LOAD_NOTES_AND_REPLIES = 'Steamatic/NotesAndReplies/LOAD_JOB_NOTES';
const LOAD_NOTES_AND_REPLIES_COMPLETE = 'Steamatic/NotesAndReplies/LOAD_JOB_NOTES_COMPLETE';
const RESET = 'Steamatic/NotesAndReplies/RESET';
const ERROR = 'Steamatic/NotesAndReplies/ERROR';

export interface INotesAndRepliesState {
  data: INotesAndMessages | null;
  error: IHttpError | null;
  loading: boolean;
}

const dataReducer: Reducer<INotesAndMessages | null> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case LOAD_NOTES_AND_REPLIES_COMPLETE:
      return action.payload;
    case RESET:
      return null;

    default:
      return state;
  }
};

const loadingReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_NOTES_AND_REPLIES:
      return true;
    case LOAD_NOTES_AND_REPLIES_COMPLETE:
      return false;
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

    case LOAD_NOTES_AND_REPLIES_COMPLETE:
    case RESET:
      return null;

    default:
      return state;
  }
};

export default combineReducers({
  data: dataReducer,
  error: errorReducer,
  loading: loadingReducer
});

export const getJobNotesAndReplies = (jobId: number | string) => {
  return async (dispatch: Dispatch) => {
    dispatch({type: LOAD_NOTES_AND_REPLIES});
    try {
      const response = await NotesAndMessagesService.getJobNotesAndMessages(jobId);
      dispatch({type: LOAD_NOTES_AND_REPLIES_COMPLETE, payload: response.data});
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const deleteJobNote = (jobId: number | string, noteId: number | string) => {
  return async (dispatch: Dispatch) => {
    try {
      const noteResponse = await NotesAndMessagesService.getNote(noteId);
      const documents = noteResponse.data && noteResponse.data.documents;
      if (documents) {
        documents.forEach(async (document: IDocument) => DocumentsService.remove(document.id));
      }
      await NotesAndMessagesService.detachNoteFromJob(noteId, jobId);
      return dispatch<any>(getJobNotesAndReplies(jobId));
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const addNoteToJob = (jobId: number | string, noteId: number | string) => {
  return async (dispatch: Dispatch) => {
    try {
      await NotesAndMessagesService.addNoteToJob(noteId, jobId);
      return dispatch<any>(getJobNotesAndReplies(jobId));
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const addReplyToJob = (jobId: number | string, messageId: number | string) => {
  return async (dispatch: Dispatch) => {
    try {
      await NotesAndMessagesService.addMessageToJob(messageId, jobId);
      return dispatch<any>(getJobNotesAndReplies(jobId));
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};
