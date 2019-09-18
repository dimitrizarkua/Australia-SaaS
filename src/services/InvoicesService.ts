import HttpService from './HttpService';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {IInvoice, IInvoiceItem, IInvoiceListItem, IInvoicesListInfo} from 'src/models/FinanceModels/IInvoices';
import InvoiceTransformer from 'src/transformers/InvoiceTransformer';
import {INotesSuccess} from './NotesAndMessagesService';
import {createFinanceListingApi} from './helpers/ApiHelpers';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';

export type IInvoicesInfoSuccess = IObjectEnvelope<IInvoicesListInfo>;
export type IInvoicesSuccess = IListEnvelope<IInvoiceListItem>;
export type IInvoiceSuccess = IObjectEnvelope<IInvoice>;
export type IInvoiceItemSuccess = IObjectEnvelope<IInvoiceItem>;

const ENDPOINT_PREFIX_INVOICES = '/v1/finance/invoices';

const findById = async (id: string | number): Promise<IInvoiceSuccess> => {
  const res = await HttpService.get<IObjectEnvelope<any>>(`${ENDPOINT_PREFIX_INVOICES}/${id}`);
  return InvoiceTransformer.hydrate(res);
};

const create = (data: IFormData): Promise<IInvoiceSuccess> => {
  const invoice = InvoiceTransformer.dehydrate(data);
  return HttpService.post<IObjectEnvelope<any>>(ENDPOINT_PREFIX_INVOICES, invoice)
    .then(InvoiceTransformer.hydrate)
    .catch(err => Promise.reject(InvoiceTransformer.hydrateError(err)));
};

const remove = async (invoiceId: number) => {
  return HttpService.remove<any>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}`);
};

const update = (id: string | number, data: IFormData): Promise<IInvoiceSuccess> => {
  const invoice = InvoiceTransformer.dehydrate(data);
  return HttpService.patch<IObjectEnvelope<any>>(`${ENDPOINT_PREFIX_INVOICES}/${id}`, invoice)
    .then(InvoiceTransformer.hydrate)
    .catch(err => Promise.reject(InvoiceTransformer.hydrateError(err)));
};

const createItem = async (id: string | number, data: IInvoiceItem): Promise<IInvoiceItemSuccess> => {
  const item = InvoiceTransformer.dehydrateItem(data);
  return await HttpService.post<IInvoiceItemSuccess>(`${ENDPOINT_PREFIX_INVOICES}/${id}/items`, item);
};

const updateItem = async (
  id: string | number,
  itemId: string | number,
  data: IInvoiceItem
): Promise<IInvoiceItemSuccess> => {
  const item = InvoiceTransformer.dehydrateItem(data);
  return await HttpService.patch<IInvoiceItemSuccess>(`${ENDPOINT_PREFIX_INVOICES}/${id}/items/${itemId}`, item);
};

const removeItem = async (id: string | number, itemId: string | number): Promise<void> => {
  return await HttpService.remove<void>(`${ENDPOINT_PREFIX_INVOICES}/${id}/items/${itemId}`);
};

const addNoteToInvoice = async (noteId: string | number, invoiceId: string | number) => {
  return await HttpService.post<void>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/notes/${noteId}`);
};

const removeNoteFromInvoice = async (noteId: string | number, invoiceId: string | number) => {
  return await HttpService.remove<void>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/notes/${noteId}`);
};

const getInvoiceNotes = async (invoiceId: string | number): Promise<INotesSuccess> => {
  return await HttpService.get<INotesSuccess>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/notes`);
};

const getApproverList = async (invoiceId: string | number): Promise<any> => {
  return await HttpService.get<any>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/approver-list`);
};

const sendApproveRequest = async (invoiceId: string | number, list: number[]): Promise<any> => {
  return await HttpService.post<any>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/approve-requests`, {
    approver_list: list
  });
};

const approveInvoice = async (invoiceId: string | number): Promise<any> => {
  return await HttpService.post(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/approve`);
};

const getInvoiceTags = async (invoiceId: number): Promise<any> => {
  return await HttpService.get<any>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/tags`);
};

const addTag = async (tagId: number, invoiceId: number): Promise<any> => {
  return await HttpService.post<any>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/tags/${tagId}`);
};

const removeTag = async (tagId: number, invoiceId: number): Promise<any> => {
  return await HttpService.remove<any>(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/tags/${tagId}`);
};

const forPrint = async (invoiceId: number) => {
  return HttpService.downloadFile(`${ENDPOINT_PREFIX_INVOICES}/${invoiceId}/document`);
};

const listingAPI = createFinanceListingApi<IInvoicesSuccess, IInvoicesInfoSuccess>(
  `${ENDPOINT_PREFIX_INVOICES}/listings`,
  {
    getDraft: 'draft',
    getAll: 'all',
    getUnpaid: 'unpaid',
    getOverdue: 'overdue',
    search: 'search'
  }
);

type ListingPromise = (params?: {}) => Promise<IInvoicesSuccess>;
type ListingInfoPromise = () => Promise<IInvoicesInfoSuccess>;

export default {
  ...(listingAPI as {
    getDraft: ListingPromise;
    getAll: ListingPromise;
    getUnpaid: ListingPromise;
    getOverdue: ListingPromise;
    search: ListingPromise;
    getInfo: ListingInfoPromise;
  }),
  findById,
  create,
  update,
  createItem,
  updateItem,
  removeItem,
  addNoteToInvoice,
  getInvoiceNotes,
  removeNoteFromInvoice,
  getApproverList,
  sendApproveRequest,
  approveInvoice,
  getInvoiceTags,
  addTag,
  removeTag,
  remove,
  forPrint
};
