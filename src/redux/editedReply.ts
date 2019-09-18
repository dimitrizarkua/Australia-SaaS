import {Dispatch, Reducer} from 'redux';
import {IDocument} from 'src/models/IDocument';
import {IMessage, ICreateMessageRequest, IMessageRecipientRequest, RecipientType} from 'src/models/INotesAndMessages';
import {IFormData as IReplyFormData} from 'src/components/AppLayout/JobsLayout/JobLayout/EmailReplyForm';
import {IAppState} from 'src/redux';
import NotesAndMessagesService from 'src/services/NotesAndMessagesService';
import DocumentsService from 'src/services/DocumentsService';
import {IHttpError} from 'src/models/IHttpError';

const UPDATE_EDITED_REPLY = 'Steamatic/EditedReply/UPDATE_EDITED_REPLY';
const ADD_DOCUMENT_TO_EDITED_REPLY = 'Steamatic/EditedReply/ADD_DOCUMENT_TO_EDITED_REPLY';
const REMOVE_DOCUMENT_FROM_EDITED_REPLY = 'Steamatic/EditedReply/REMOVE_DOCUMENT_FROM_EDITED_REPLY';
const SAVE_EDITED_REPLY = 'Steamatic/EditedReply/SAVE_EDITED_REPLY';
const SAVE_EDITED_REPLY_COMPLETE = 'Steamatic/EditedReply/SAVE_EDITED_REPLY_COMPLETE';
const DELETE_EDITED_REPLY = 'Steamatic/EditedReply/DELETE_EDITED_REPLY';
const DELETE_EDITED_REPLY_COMPLETE = 'Steamatic/EditedReply/DELETE_EDITED_REPLY_COMPLETE';
const RESET_EDITED_REPLY = 'Steamatic/EditedReply/RESET_EDITED_REPLY';
const ERROR = 'Steamatic/EditedReply/ERROR';

export interface IEditedReplyState {
  savedReply: IMessage | null;
  documents?: IDocument[];
  loading: boolean;
  error: IHttpError | null;
}

const initialState = {
  savedReply: null,
  documents: [],
  loading: false,
  error: null
};

const reducer: Reducer<IEditedReplyState> = (state = initialState, action = {type: null, payload: null}) => {
  let documents;
  switch (action.type) {
    case ERROR:
      return {
        ...state,
        savedReply: null,
        loading: false,
        error: action.payload
      };
    case RESET_EDITED_REPLY:
    case DELETE_EDITED_REPLY_COMPLETE:
      return {...initialState};
    case UPDATE_EDITED_REPLY:
      return {...state, body: action.payload};
    case SAVE_EDITED_REPLY:
    case DELETE_EDITED_REPLY:
      return {...state, loading: true};
    case SAVE_EDITED_REPLY_COMPLETE:
      return {
        ...state,
        loading: false,
        error: null,
        savedReply: action.payload
      };
    case ADD_DOCUMENT_TO_EDITED_REPLY:
      const existDocuments = state.documents || [];
      documents = action.payload ? [...existDocuments, action.payload] : existDocuments;
      return {
        ...(state || {}),
        documents
      };
    case REMOVE_DOCUMENT_FROM_EDITED_REPLY:
      documents = state.documents || [];
      const docIndex = documents.findIndex((doc: any) => doc.id === action.payload);
      if (docIndex >= 0) {
        documents.splice(docIndex, 1);
      }
      return {
        ...state,
        documents
      };
    default:
      return state;
  }
};

export default reducer;

export const resetEditedReply = () => {
  return {type: RESET_EDITED_REPLY};
};

export const updateEditedReply = (note: string) => {
  return {type: UPDATE_EDITED_REPLY, payload: note};
};

export const uploadReplyDocument = (data: Blob) => {
  return async (dispatch: Dispatch) => {
    const response = await DocumentsService.postDocument(data);
    dispatch({type: ADD_DOCUMENT_TO_EDITED_REPLY, payload: response.data});
  };
};

export const replyFieldsToRequest = (fields: IReplyFormData): ICreateMessageRequest => {
  const recipients: IMessageRecipientRequest[] = Object.keys(RecipientType)
    .filter(rt => !!fields[RecipientType[rt]])
    .map(rt => ({
      type: RecipientType[rt],
      address: fields[RecipientType[rt]]
    }));
  return {
    body: fields.body,
    subject: fields.subject,
    type: fields.type.value,
    recipients
  };
};

export const saveEditedReply = (fields: any) => {
  return async (dispatch: Dispatch, getState: () => IAppState) => {
    dispatch({type: SAVE_EDITED_REPLY});
    const {
      editedReply: {savedReply, documents}
    } = getState();
    const request = replyFieldsToRequest(fields);
    try {
      const response =
        savedReply === null
          ? await NotesAndMessagesService.postMessage(request)
          : await NotesAndMessagesService.updateMessage(savedReply.id, request);
      console.log(documents, response.data);
      if (documents && response.data) {
        documents.forEach(
          async (document: IDocument) => await DocumentsService.attachDocumentToMessage(response.data.id, document.id)
        );
      }
      dispatch({type: SAVE_EDITED_REPLY_COMPLETE, payload: response.data});
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};

export const deleteEditedReply = () => {
  return async (dispatch: Dispatch, getState: () => IAppState) => {
    const {
      editedReply: {savedReply, documents}
    } = getState();
    dispatch({type: DELETE_EDITED_REPLY});
    if (savedReply === null && documents) {
      documents.forEach(async (document: IDocument) => await DocumentsService.remove(document.id));
    }
    dispatch({type: DELETE_EDITED_REPLY_COMPLETE});
  };
};

export const removeDocumentFromReply = (documentId: number) => {
  return async (dispatch: Dispatch) => {
    try {
      await DocumentsService.remove(documentId);
      dispatch({type: REMOVE_DOCUMENT_FROM_EDITED_REPLY, payload: documentId});
    } catch (err) {
      dispatch({type: ERROR, payload: err});
      throw err;
    }
  };
};
