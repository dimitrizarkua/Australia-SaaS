import {IUser} from 'src/models/IUser';

export interface IPushUser {
  id: number;
  avatar?: string;
  full_name: string;
}

export interface IWebSocketNotification<T = string> {
  context: INotificationContext;
  notification: {
    id: string | number;
    type: UserChannelNotificationTypes;
    body: T;
    sender?: IUser;
  };
  target: INotificationTarget;
}

interface INotificationContext {
  id: number;
  type: NotificationContextTypes;
}

export enum NotificationContextTypes {
  Note = 'note',
  Message = 'message'
}

interface INotificationTarget {
  id: number;
  type: NotificationTargetTypes;
}

export enum NotificationTargetTypes {
  Job = 'job',
  Contact = 'contact',
  Invoice = 'invoice',
  PurchaseOrder = 'purchase_order',
  CreditNote = 'credit_note'
}

export enum UserChannelNotificationTypes {
  JOB_CREATED = 'job.created',
  JOB_USER_ASSIGNED = 'job.user_assigned',
  JOB_TEAM_ASSIGNED = 'job.team_assigned',
  JOB_UPDATED = 'job.updated',
  JOB_MESSAGE_ATTACHED = 'job.message_attached',
  JOB_NOTE_ATTACHED = 'job.note_attached',
  USER_MENTIONED = 'user_mentioned',
  CONTACT_NOTE_ATTACHED = 'contact.note_attached',
  INVOICE_NOTE_ATTACHED = 'invoice.note_attached',
  PURCHASE_ORDER_NOTE_ATTACHED = 'purchase_order.note_attached',
  CREDIT_NOTE_NOTE_ATTACHED = 'credit_note.note_attached',
  INVOICE_APPROVE_REQUEST = 'invoice.approve_requests_send',
  PURCHASE_ORDER_APPROVE_REQUEST = 'purchase_order.approve_requests_send',
  CREDIT_NOTE_APPROVE_REQUEST = 'credit_note.approve_requests_send'
}

export interface IUserNotification<T = string> {
  id: number;
  user_id: number;
  body: T;
  created_at: string;
  deleted_at: string | null;
  type: UserChannelNotificationTypes;
}

export interface INotificationBody {
  text: string;
  target: INotificationTarget;
  sender: IUser;
  context: INotificationContext;
}
