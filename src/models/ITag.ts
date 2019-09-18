export enum TagTypes {
  job = 'job',
  credit_note = 'credit_note',
  purchase_order = 'purchase_order',
  invoice = 'invoice',
  contact = 'contact'
}

export interface ITag {
  id: number;
  type: TagTypes;
  name: string;
  is_alert: boolean;
  color: number | string;
}
