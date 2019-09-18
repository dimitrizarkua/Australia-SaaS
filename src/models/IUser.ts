import {ILocation} from './IAddress';
import Permission from 'src/constants/Permission';
import {IPerson} from './IPerson';

export interface IUser {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_photos_id?: string;
  avatar_url: string | null;
  avatar?: IAvatar;
  contact_id: number | null;
  contact: IPerson | null;
  working_hours_per_week: number | null;
  locations: ILocation[];
}

export interface IStaff extends IUser {
  week_hours: number;
  date_hours: number;
  primary_location: ILocation;
  roles: IUserRole[];
}

export interface ICurrentUser extends IUser {
  permissions: Set<Permission>;
  purchase_order_approve_limit: string; // "0.00"
  invoice_approve_limit: string; // "0.00"
  credit_note_approval_limit: string; // "0.00"
}

export interface IUpUserForm {
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  password?: string;
  primary_location_id?: number;
  working_hours_per_week?: number;
  locations?: number[];
  purchase_order_approve_limit?: number;
  invoice_approve_limit?: number;
  credit_note_approval_limit?: number;
}

export interface IMentionsUser extends IUser {
  created_at: string;
  updated_at: string;
}

export interface IUserSimple {
  id: number;
  full_name: string;
}

export interface IUserSearch {
  id: number;
  name: string;
  type: 'user';
  avatar: string;
}

export interface IUserPermission {
  name: Permission;
  displayName: string;
  description: string;
}

export interface IUserRole {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: IUserPermission[];
}

interface IAvatar {
  url: string;
}
