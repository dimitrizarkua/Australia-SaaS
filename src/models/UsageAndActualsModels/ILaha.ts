import {IEntity, IEditedEntity} from 'src/models/IEntity';
import {IUser} from 'src/models/IUser';

export interface ILaha extends IEntity, IEditedEntity {
  job_id: number;
  user_id: number;
  creator_id: number;
  laha_compensation_id: number;
  date_started: string;
  rate_per_day: number;
  days: number;
  approved_at: string | null;
  approver_id: number | null;
  laha_compensation: ILahaCompensation;
  user: Partial<IUser>;
  total_amount: number;
}

export interface ILahaCompensation extends IEntity, IEditedEntity {
  rate_per_day: number;
}

export interface ILahaRequest {
  job_id: number;
  user_id: number;
  creator_id: number;
  laha_compensation_id: number;
  date_started: string;
  days: number;
}
