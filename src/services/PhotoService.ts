import HttpService from './HttpService';
import {saveDocumentData} from './DocumentsService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IPhoto} from 'src/models/IPhoto';

type IPhotoSuccess = IObjectEnvelope<IPhoto>;

const uploadPhoto = async (data: any): Promise<any> => {
  return await HttpService.postFormData<any>('/v1/photos', data);
};

const updatePhoto = async (id: number, data: any): Promise<any> => {
  return await HttpService.postFormData<any>(`/v1/photos/${id}`, data);
};

const downloadPhoto = async (id: number, fileName: string) => {
  const fileData = await getPhotoData(id);
  saveDocumentData(fileData, fileName);
};

const getPhotoData = async (id: number) => {
  return await HttpService.downloadFile(`/v1/photos/${id}/download`);
};

const deletePhoto = async (id: number): Promise<any> => {
  return await HttpService.remove<any>(`/v1/photos/${id}`);
};

const getPhotoInfo = async (id: number): Promise<IPhotoSuccess> => {
  return await HttpService.get<IPhotoSuccess>(`/v1/photos/${id}`);
};

export default {
  uploadPhoto,
  downloadPhoto,
  getPhotoData,
  deletePhoto,
  updatePhoto,
  getPhotoInfo
};
