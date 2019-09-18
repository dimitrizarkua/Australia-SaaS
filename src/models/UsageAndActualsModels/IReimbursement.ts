import {IEntity, IEditedEntity} from 'src/models/IEntity';
import {Moment} from 'moment';
import {IUser} from 'src/models/IUser';

export interface IReimbursement extends IEntity, IEditedEntity {
  job_id: number;
  user_id: number;
  creator_id: number;
  date_of_expense: string;
  document_id: number;
  description: string;
  total_amount: number;
  is_chargeable: boolean;
  invoice_item_id: number | null;
  approved_at: string | null;
  approver_id: number | null;
  user: Partial<IUser>;
}

export interface IReimbursementRequest {
  user_id: number;
  creator_id: number;
  date_of_expense: Moment;
  document_id: number;
  description: string;
  total_amount: number;
  is_chargeable: boolean;
}
