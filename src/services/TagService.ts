import HttpService from './HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {ITag} from 'src/models/ITag';

export type ITagsSuccess = IListEnvelope<ITag>;

const searchTags = (params: {}): Promise<ITagsSuccess> => {
  return HttpService.get<ITagsSuccess>('/v1/tags/search', params);
};

export default {
  searchTags
};
