import {INamedEntity} from './IEntity';
import ISelectType from 'src/constants/GeneralType';
import {Moment} from 'moment';
import {IPerson} from './IPerson';
import {ICompany} from './ICompany';
import {ILocation} from './IAddress';
import {IContact, IRawContactAddress} from './IContact';
import {IUser, IUserSimple} from './IUser';
import {IUserTeamSimple} from 'src/models/ITeam';
import {ITag} from 'src/models/ITag';

export enum JobStatuses {
  New = 'New',
  OnHold = 'On-Hold',
  InProgress = 'In-Progress',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  Created = 'Created'
}

export const JobWeightByStatus = {
  [JobStatuses.New]: 1,
  [JobStatuses.InProgress]: 2,
  [JobStatuses.OnHold]: 3,
  [JobStatuses.Closed]: 4,
  [JobStatuses.Cancelled]: 5
};

export interface IJob {
  id: number;
  service: INamedEntity;
  description?: string;
  has_new_replies: boolean;
  claim_number: string;
  reference_number: string;
  latest_status: IStatus;
  last_message: string;
  touched_at: string;
  updated_at: string;
  pinned_at: string;
  insurer?: ICompany;
  site_address?: IRawContactAddress;
  assigned_location?: ILocation;
  assigned_location_id?: number;
  owner_location: INamedEntity;
  cause_of_loss: string;
  anticipated_revenue: string;
  expected_excess_payment: string;
  statuses?: IJobStatus[];
  date_of_loss: Moment | null;
  initial_contact_at: Moment | null;
  anticipated_invoice_date: Moment | null;
  authority_received_at: Moment | null;
  created_at: Moment | string | null;
  claim_type: ISelectType | null;
  criticality: ISelectType | null;
  site_contact_name?: string;
  snoozed_until?: any;
  edit_forbidden?: boolean;
  job_service_id?: number;
  insurer_id?: number;
  site_address_id?: number | null;
  owner_location_id?: number;
  followers?: IUser[];
  site_address_lat: number;
  site_address_lng: number;
  recurring_job_id: number | null;
  site_contact?: IContact;
  tags: ITag[];
  assigned_to: IUserTeamSimple[];
  previous_jobs: IRecurringJob[];
  linked_jobs: ILinkedJob[];
}

export interface IStatus {
  status: JobStatuses;
  note: string;
  created_at: string;
}

export interface IAssignment {
  id: number | string;
  name: string;
  is_unique: boolean;
}

export type IContactAssignment = IPerson &
  ICompany & {
    contact_id: number;
    invoice_to: boolean;
    addresses: IRawContactAddress[];
    contact: Partial<IContact>;
    assignment_type: IAssignment;
  };

export interface IJobStatus {
  created_at: string | null;
  note: string;
  status: JobStatuses;
  user?: IUserSimple;
}

export interface IJobNextStatus {
  id: number;
  name: JobStatuses;
}

export interface ILinkedJob {
  id: number;
  claim_number: string;
  created_at: string;
  latest_status: IJobStatus;
  assigned_location: ILocation;
}

export interface IRecurringJobSimple {
  recurrence_rule: string;
  job_service_id: number;
  insurer_id: string | number;
  site_address_id: number;
  owner_location_id: number;
  description: string;
}

export interface IRecurringJob extends IRecurringJobSimple {
  id: number;
}
