import {IDocument} from './IDocument';
import {IUser} from './IUser';
import {IMeeting} from './IMeeting';

export enum MessageType {
  EMAIL = 'email',
  SMS = 'sms'
}

export enum RecipientType {
  TO = 'to',
  CC = 'cc',
  BCC = 'bcc'
}

export enum MessageStatuses {
  DRAFT = 'draft',
  READY = 'ready_for_delivery',
  FORWARDED = 'forwarded_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'delivery_failed'
}

export interface IMessageRecipientRequest {
  type: RecipientType;
  address: string;
  name?: string;
}

export interface IMessageRecipient extends IMessageRecipientRequest {
  id: number;
  message_id: number;
  created_at: string;
}

export interface IMessageStatus {
  id: number;
  message_id: number;
  status: MessageStatuses;
  reason: string;
  created_at: string;
}

export interface ICreateMessageRequest {
  type: MessageType;
  recipients: IMessageRecipientRequest[];
  subject: string;
  body: string;
}

export interface IMessage {
  id: number;
  sender_user_id: number;
  message_type: string;
  from_address: string;
  from_name: string;
  subject: string;
  message_body: string;
  message_body_resolved: string;
  is_incoming: boolean;
  created_at: string;
  updated_at: string;
  sender: IUser;
  recipients: IMessageRecipient[];
  documents: IDocument[];
  latestStatus: IMessageStatus;
}

export interface INote {
  id: number;
  note: string;
  note_resolved: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  user: IUser;
  mentioned_users: IUser[];
  documents: IDocument[];
  meeting?: IMeeting | null;
  contact?: {name: string};
}

export interface INotesAndMessages {
  notes: INote[];
  messages: IMessage[];
}
