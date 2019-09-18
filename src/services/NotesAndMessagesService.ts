import HttpService from './HttpService';
import {INote, IMessage, INotesAndMessages, ICreateMessageRequest} from 'src/models/INotesAndMessages';
import {IObjectEnvelope, IListEnvelope} from 'src/models/IEnvelope';

export type INoteSuccess = IObjectEnvelope<INote>;
export type INotesSuccess = IListEnvelope<INote>;
export type IMessageSuccess = IObjectEnvelope<IMessage>;
export type IMessagesSuccess = IListEnvelope<IMessage>;
export type INotesAndMessagesSuccess = IObjectEnvelope<INotesAndMessages>;

const getJobNotes = async (jobId: string | number): Promise<INotesSuccess> => {
  return await HttpService.get<INotesSuccess>(`/v1/jobs/${jobId}/notes`);
};

const getNote = async (id: string | number): Promise<INoteSuccess> => {
  return await HttpService.get<INoteSuccess>(`/v1/notes/${id}`);
};

const postNote = async (note: string | number): Promise<INoteSuccess> => {
  return await HttpService.post<INoteSuccess>(`/v1/notes`, {note});
};

const updateNote = async (id: string | number, note: string): Promise<INoteSuccess> => {
  return await HttpService.patch<INoteSuccess>(`/v1/notes/${id}`, {note});
};

const removeNote = async (id: string | number): Promise<void> => {
  return await HttpService.remove<void>(`/v1/notes/${id}`);
};

const addNoteToJob = async (noteId: string | number, jobId: string | number) => {
  return await HttpService.post<void>(`/v1/jobs/${jobId}/notes/${noteId}`);
};

const addNoteToContact = async (noteId: string | number, contactId: string | number, config?: {meeting_id: number}) => {
  return await HttpService.post<void>(`/v1/contacts/${contactId}/notes/${noteId}`, config);
};

const detachNoteFromJob = async (noteId: string | number, jobId: string | number) => {
  return await HttpService.remove<void>(`/v1/jobs/${jobId}/notes/${noteId}`);
};

const getJobMessages = async (jobId: string | number): Promise<IMessagesSuccess> => {
  return await HttpService.get<IMessagesSuccess>(`/v1/jobs/${jobId}/messages`);
};

const getMessage = async (id: string | number): Promise<IMessageSuccess> => {
  return await HttpService.get<IMessageSuccess>(`/v1/messages/${id}`);
};

const postMessage = async (message: ICreateMessageRequest): Promise<IMessageSuccess> => {
  return await HttpService.post<IMessageSuccess>(`/v1/messages`, message);
};

const updateMessage = async (id: string | number, message: ICreateMessageRequest): Promise<IMessageSuccess> => {
  return await HttpService.patch<IMessageSuccess>(`/v1/messages/${id}`, message);
};

const removeMessage = async (id: string | number): Promise<void> => {
  return await HttpService.remove<void>(`/v1/messages/${id}`);
};

const addMessageToJob = async (messageId: string | number, jobId: string | number) => {
  return await HttpService.post<void>(`/v1/jobs/${jobId}/messages/${messageId}`);
};

const getJobNotesAndMessages = async (jobId: string | number): Promise<INotesAndMessagesSuccess> => {
  return await HttpService.get<INotesAndMessagesSuccess>(`/v1/jobs/${jobId}/notes-and-messages`);
};

const getContactNotesAndMeetings = async (contactId: number | string): Promise<INotesSuccess> => {
  return await HttpService.get<INotesSuccess>(`/v1/contacts/${contactId}/notes`);
};

export default {
  getJobNotes,
  addNoteToJob,
  detachNoteFromJob,
  getNote,
  postNote,
  updateNote,
  removeNote,
  getJobMessages,
  addMessageToJob,
  getMessage,
  postMessage,
  updateMessage,
  removeMessage,
  getJobNotesAndMessages,
  addNoteToContact,
  getContactNotesAndMeetings
};
