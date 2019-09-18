import {IUser} from './IUser';

export interface IPhoto {
  id: number;
  url: string;
  thumbnails?: IPhoto[];
  created_at: string;
  updated_at: string;
  description: string;
  width: number;
  height: number;
  mime_type: string;
  creator: IUser;
  modified_by?: IUser;
}
