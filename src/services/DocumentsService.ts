import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IDocument} from 'src/models/IDocument';

export type IDocumentSuccess = IObjectEnvelope<IDocument>;

const getDocumentInfo = async (id: string | number): Promise<IDocumentSuccess> => {
  return await HttpService.get<IDocumentSuccess>(`/v1/documents/${id}`);
};

const postDocument = async (data: Blob) => {
  const formData = new FormData();
  formData.append('file', data);
  return await HttpService.postFormData<IDocumentSuccess>('/v1/documents', formData);
};

const remove = async (id: string | number): Promise<void> => {
  return await HttpService.remove<void>(`/v1/documents/${id}`);
};

const attachDocumentToNote = async (noteId: string | number, documentId: string | number) => {
  return await HttpService.post(`/v1/notes/${noteId}/documents/${documentId}`, null);
};

const detachDocumentFromNote = async (noteId: string | number, documentId: string | number) => {
  return await HttpService.remove(`/v1/notes/${noteId}/documents/${documentId}`);
};

const attachDocumentToMessage = async (messageId: string | number, documentId: string | number) => {
  return await HttpService.post(`/v1/messages/${messageId}/documents/${documentId}`, null);
};

const detachDocumentFromMessage = async (messageId: string | number, documentId: string | number) => {
  return await HttpService.remove(`/v1/messages/${messageId}/documents/${documentId}`);
};

const downloadDocument = async (documentId: number, fileName: string) => {
  const fileData = await HttpService.downloadFile(`/v1/documents/${documentId}/download`);
  saveDocumentData(fileData, fileName);
};

export const saveDocumentData = (data: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return url;
};

export default {
  getDocumentInfo,
  postDocument,
  remove,
  attachDocumentToNote,
  detachDocumentFromNote,
  attachDocumentToMessage,
  detachDocumentFromMessage,
  downloadDocument
};
