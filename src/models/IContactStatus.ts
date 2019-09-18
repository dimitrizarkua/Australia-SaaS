export interface IContactStatus {
  id: number;
  name: string;
  type: ContactStatuses;
}

export enum ContactStatuses {
  LEAD = 'lead',
  ACTIVE = 'active',
  QUAlIFIED = 'qualified',
  CUSTOMER = 'customer',
  INACTIVE = 'inactive'
}

export const ContactStatuseNames: {[key: string]: string} = {
  [ContactStatuses.LEAD]: 'Lead',
  [ContactStatuses.ACTIVE]: 'Active',
  [ContactStatuses.QUAlIFIED]: 'Qualified',
  [ContactStatuses.CUSTOMER]: 'Customer',
  [ContactStatuses.INACTIVE]: 'In-Active'
};
