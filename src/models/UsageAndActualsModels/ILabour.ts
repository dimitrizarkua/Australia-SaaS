import {IEntity, INamedEntity, IEditedEntity, ICreatedEntity} from 'src/models/IEntity';
import {IUser} from 'src/models/IUser';

export interface ILabour extends IEntity, IEditedEntity {
  job_id: number;
  labour_type_id: number;
  worker_id: number;
  creator_id: number;
  started_at: string;
  ended_at: string | null;
  break: number;
  started_at_override: string;
  ended_at_override: string;
  first_tier_hourly_rate: number;
  second_tier_hourly_rate: number;
  third_tier_hourly_rate: number;
  fourth_tier_hourly_rate: number;
  calculated_total_amount: number;
  first_tier_time_amount: number;
  second_tier_time_amount: number;
  third_tier_time_amount: number;
  fourth_tier_time_amount: number;
  invoice_item_id: number;
  labour_type: ILabourType;
  worker: Partial<IUser>;
}

export interface ILabourType extends INamedEntity, ICreatedEntity {
  first_tier_hourly_rate: number;
  second_tier_hourly_rate: number;
  third_tier_hourly_rate: number;
  fourth_tier_hourly_rate: number;
}

export interface IAddLabourRequest {
  job_id: number;
  labour_type_id: number;
  worker_id: number;
  creator_id: number;
  started_at?: string;
  ended_at?: string | null;
  break: number;
}

export interface IEditLabourRequest {
  started_at_override: string;
  ended_at_override?: string | null;
  break: number;
}
