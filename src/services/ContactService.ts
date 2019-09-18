import HttpService, {withController} from './HttpService';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {AddressType, ContactType, IContact, IContactCategory} from 'src/models/IContact';
import {IconName} from 'src/components/Icon/Icon';
import {ICompany} from 'src/models/ICompany';
import {IPerson} from 'src/models/IPerson';
import ContactTransformer from 'src/transformers/ContactTransformer';
import {IAddress} from 'src/models/IAddress';
import {ITagsSuccess} from './TagService';
import {ContactStatuses, IContactStatus} from 'src/models/IContactStatus';

export type IContactSuccess = IObjectEnvelope<IContact>;

const findById = async (id: string | number): Promise<IContactSuccess> => {
  const res = await HttpService.get<IContactSuccess>(`/v1/contacts/${id}`);
  return ContactTransformer.hydrate(res);
};

const update = (id: string | number, data: Partial<IContact>): Promise<IContactSuccess> => {
  return HttpService.patch<IContactSuccess>(`/v1/contacts/${id}`, data).catch(err =>
    Promise.reject(ContactTransformer.hydrateError(err))
  );
};

export type IContactsSuccess = IListEnvelope<IContact>;

const getContacts = async (params: {}): Promise<IContactsSuccess> => {
  return await HttpService.get<IContactsSuccess>('/v1/contacts', params);
};

const searchContacts = async (params: {}, fetchOptions?: {}): Promise<IListEnvelope<IContact>> => {
  return await HttpService.get<IListEnvelope<IContact>>('/v1/contacts/search', params, fetchOptions);
};

const getTags = async (id: string | number): Promise<ITagsSuccess> => {
  return await HttpService.get<ITagsSuccess>(`/v1/contacts/${id}/tags`);
};

const assignTag = async (id: string | number, tagId: string | number): Promise<ITagsSuccess> => {
  return await HttpService.post<ITagsSuccess>(`/v1/contacts/${id}/tags/${tagId}`);
};

const removeTag = async (id: string | number, tagId: string | number): Promise<ITagsSuccess> => {
  return await HttpService.remove<ITagsSuccess>(`/v1/contacts/${id}/tags/${tagId}`);
};

export type IContactCategoriesSuccess = IListEnvelope<IContactCategory>;

const getCategories = async (params: {}): Promise<IContactCategoriesSuccess> => {
  return await HttpService.get<IContactCategoriesSuccess>('/v1/contacts/categories', params);
};

export type IContactCategorySuccess = IObjectEnvelope<IContactCategory>;

const findCategoryById = async (id: string | number): Promise<IContactCategorySuccess> => {
  return await HttpService.get<IContactCategorySuccess>(`/v1/contacts/categories/${id}`);
};

const getCategoryIcon = (category: string) => {
  // TODO remove hardcode, move the icon name logic to backend
  const CATEGORY_ICONS = {
    customer: IconName.People,
    supplier: IconName.Truck,
    insurer: IconName.Insurance,
    broker: IconName.Broker,
    loss_adjustor: IconName.ManShield,
    company_location: IconName.LocationUser
  };
  return CATEGORY_ICONS[category] || IconName.People;
};

export type ICompanySuccess = IObjectEnvelope<ICompany>;

const createCompany = (data: Partial<ICompany>): Promise<ICompanySuccess> => {
  return HttpService.post<ICompanySuccess>(`/v1/contacts/company`, data).catch(err =>
    Promise.reject(ContactTransformer.hydrateError(err))
  );
};

export type IPersonSuccess = IObjectEnvelope<IPerson>;

const createPerson = async (data: Partial<IPerson>): Promise<IPersonSuccess> => {
  return await HttpService.post<IPersonSuccess>(`/v1/contacts/person`, data);
};

const addContactAddress = (id: number | string, data: IAddress, type: AddressType): Promise<void> => {
  return HttpService.post<void>(`/v1/contacts/${id}/addresses/${data.id}`, {type});
};

const linkPersonToCompany = (id: number | string, company: ICompany): Promise<void> => {
  return HttpService.post<void>(`/v1/contacts/${company.id}/${id}`, null);
};

const getContactStatuses = async (): Promise<IContactStatus[]> => {
  const res = await HttpService.get<IListEnvelope<IContactStatus>>(`/v1/contacts/statuses`, null);
  return res.data;
};

const deleteContact = (id: number): Promise<void> => {
  return HttpService.remove<void>(`/v1/contacts/${id}`, null);
};

const getContactName = (contact: Partial<IContact>): string => {
  const person = contact as IPerson;
  const company = contact as ICompany;

  if (contact.contact_type === ContactType.person) {
    return `${person.first_name} ${person.last_name}`;
  }

  return company.legal_name;
};

const getContactPhone = (contact: Partial<IContact>): string => {
  const person = contact as IPerson;
  const company = contact as ICompany;

  if (contact.contact_type === ContactType.person) {
    return person.mobile_phone || person.direct_phone || person.business_phone;
  }

  return company.business_phone;
};

const createManagedAccount = (id: number, userId: number): Promise<void> => {
  return HttpService.post<void>(`/v1/contacts/${id}/users/${userId}/`, null);
};

const deleteManagedAccount = (id: number, userId: number): Promise<void> => {
  return HttpService.remove<void>(`/v1/contacts/${id}/users/${userId}/`, null);
};

const changeContactStatus = (id: number, status: ContactStatuses): Promise<void> => {
  return HttpService.patch<void>(`/v1/contacts/${id}/status/`, {status});
};

const searchContactWC = withController(searchContacts, 2);

export default {
  findById,
  update,
  getContacts,
  searchContacts,
  searchContactWC,
  createCompany,
  createPerson,
  getCategories,
  findCategoryById,
  getCategoryIcon,
  addContactAddress,
  linkPersonToCompany,
  getTags,
  assignTag,
  removeTag,
  getContactStatuses,
  deleteContact,
  getContactName,
  getContactPhone,
  createManagedAccount,
  deleteManagedAccount,
  changeContactStatus
};
