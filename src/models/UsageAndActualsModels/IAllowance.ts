import {IEntity, INamedEntity, IEditedEntity} from 'src/models/IEntity';
import {IUser} from 'src/models/IUser';

export interface IAllowance extends IEntity, IEditedEntity {
  job_id: number;
  user_id: number;
  creator_id: number;
  allowance_type_id: number;
  date_given: string;
  charge_rate_per_interval: number;
  amount: number;
  approved_at?: string;
  approver_id?: number;
  allowance_type: IAllowanceType;
  user: Partial<IUser>;
  total_amount: number;
}

export interface IAllowanceType extends INamedEntity, IEditedEntity {
  location_id: number;
  charge_rate_per_interval: number;
  charging_interval: string;
}

export interface IAllowanceRequest {
  job_id: number;
  job_allowances_id: number;
  creator_id: number;
  allowance_type_id: number;
  date_given: string;
  amount: number;
}
