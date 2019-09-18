import {Moment} from 'moment';
import {IEntity, INamedEntity} from '../IEntity';
import {ILocation} from 'src/models/IAddress';

export interface IEquipment extends IEntity {
  barcode: string;
  equipment_category_id: number;
  location_id: number;
  location: ILocation;
  make: string;
  model: string;
  serial_number: string;
  created_at: Moment;
  updated_at: Moment;
  deleted_at: Moment | null;
  last_test_tag_at: Moment | null;
  category: IEquipmentCategory;
  charging_interval: IEquipmentChargingInterval;
}

export interface IEquipmentInfo extends IEntity {
  job_id: number;
  equipment_id: number;
  creator_id: number;
  started_at: string;
  interval: string;
  intervals_count: number;
  intervals_count_override: number;
  buy_cost_per_interval: number;
  invoice_item_id: number;
  created_at: Moment;
  updated_at: Moment;
  deleted_at: Moment | null;
  ended_at: string;
  equipment: IEquipment;
  total_charge: number;
  charging_interval: IEquipmentChargingInterval;
}

export interface IEquipmentCategory extends INamedEntity {
  is_airmover: boolean;
  is_dehum: boolean;
  default_buy_cost_per_interval: number;
}

export interface IEquipmentChargingInterval extends IEntity {
  equipment_category_id: number;
  charging_interval: string;
  charging_rate_per_interval: number;
  max_count_to_the_next_interval: number;
  is_default: boolean;
  created_at: Moment;
  updated_at: Moment;
}

export interface IAddEquipmentToJobConfig {
  equipment_id: number;
  started_at: string;
  ended_at: string;
}
