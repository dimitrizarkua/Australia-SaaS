import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {
  ICreditNoteListItem,
  ICreditNotesInfo,
  ICreditNote,
  ICreditNoteItem
} from 'src/models/FinanceModels/ICreditNotes';
import HttpService from './HttpService';
import CreditNoteTransformer from 'src/transformers/CreditNoteTransformer';
import {createFinanceListingApi} from './helpers/ApiHelpers';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import CommonFinanceTransformer from 'src/transformers/CommonFinanceTransformer';
import {INotesSuccess} from 'src/services/NotesAndMessagesService';

export type ICreditNotesInfoSuccess = IObjectEnvelope<ICreditNotesInfo>;
export type ICreditNotesSuccess = IListEnvelope<ICreditNoteListItem>;
export type ICreditNoteSuccess = IObjectEnvelope<ICreditNote>;
export type ICreditNoteItemSuccess = IObjectEnvelope<ICreditNoteItem>;

const ENDPOINT_PREFIX_CN = '/v1/finance/credit-notes';

const findById = async (id: string | number): Promise<ICreditNoteSuccess> => {
  const res = await HttpService.get<ICreditNoteSuccess>(`${ENDPOINT_PREFIX_CN}/${id}`);
  return CreditNoteTransformer.hydrate(res);
};

const create = (data: IFormData): Promise<ICreditNoteSuccess> => {
  const purchaseOrder = CreditNoteTransformer.dehydrate(data);
  return HttpService.post<ICreditNoteSuccess>(ENDPOINT_PREFIX_CN, purchaseOrder)
    .then(CreditNoteTransformer.hydrate)
    .catch(err => Promise.reject(CommonFinanceTransformer.hydrateError(err)));
};

const remove = async (cnId: number) => {
  return HttpService.remove<any>(`${ENDPOINT_PREFIX_CN}/${cnId}`);
};

const update = (id: string | number, data: IFormData): Promise<ICreditNoteSuccess> => {
  const purchaseOrder = CreditNoteTransformer.dehydrate(data);
  return HttpService.patch<ICreditNoteSuccess>(`${ENDPOINT_PREFIX_CN}/${id}`, purchaseOrder)
    .then(CreditNoteTransformer.hydrate)
    .catch(err => Promise.reject(CommonFinanceTransformer.hydrateError(err)));
};

const createItem = async (id: string | number, data: ICreditNoteItem): Promise<ICreditNoteItemSuccess> => {
  const item = CreditNoteTransformer.dehydrateItem(data);
  return await HttpService.post<ICreditNoteItemSuccess>(`${ENDPOINT_PREFIX_CN}/${id}/items`, item);
};

const updateItem = async (
  id: string | number,
  itemId: string | number,
  data: ICreditNoteItem
): Promise<ICreditNoteItemSuccess> => {
  const item = CreditNoteTransformer.dehydrateItem(data);
  return await HttpService.patch<ICreditNoteItemSuccess>(`${ENDPOINT_PREFIX_CN}/${id}/items/${itemId}`, item);
};

const removeItem = async (id: string | number, itemId: string | number): Promise<void> => {
  return await HttpService.remove<void>(`${ENDPOINT_PREFIX_CN}/${id}/items/${itemId}`);
};

const addNoteToCreditNote = async (noteId: string | number, creditNoteId: string | number) => {
  return await HttpService.post<void>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/notes/${noteId}`);
};

const removeNoteFromCreditNote = async (noteId: string | number, creditNoteId: string | number) => {
  return await HttpService.remove<void>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/notes/${noteId}`);
};

const getCreditNoteNotes = async (creditNoteId: string | number): Promise<INotesSuccess> => {
  return await HttpService.get<INotesSuccess>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/notes`);
};

const getApproverList = async (creditNoteId: string | number): Promise<any> => {
  return await HttpService.get<any>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/approver-list`);
};

const sendApproveRequest = async (creditNoteId: string | number, list: number[]): Promise<any> => {
  return await HttpService.post<any>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/approve-requests`, {approver_list: list});
};

const approveCreditNote = async (creditNoteId: string | number): Promise<any> => {
  return await HttpService.post(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/approve`);
};

const getCreditNoteTags = async (creditNoteId: number): Promise<any> => {
  return await HttpService.get<any>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/tags`);
};

const addTag = async (tagId: number, creditNoteId: number): Promise<any> => {
  return await HttpService.post<any>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/tags/${tagId}`);
};

const removeTag = async (tagId: number, creditNoteId: number): Promise<any> => {
  return await HttpService.remove<any>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/tags/${tagId}`);
};

const forPrint = (creditNoteId: number) => {
  return HttpService.downloadFile(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/document`);
};

const applyCreditNoteToInvoices = (creditNoteId: number, items: Array<{invoice_id: number; amount: number}>) => {
  return HttpService.post<any>(`${ENDPOINT_PREFIX_CN}/${creditNoteId}/payment`, {payment_items: items});
};

const listingAPI = createFinanceListingApi<ICreditNotesSuccess, ICreditNotesInfoSuccess>(
  `${ENDPOINT_PREFIX_CN}/listings`,
  {
    getDraft: 'draft',
    getPendingApproval: 'pending-approval',
    getApproved: 'approved',
    getAll: 'all',
    search: 'search'
  }
);

type ListingPromise = (params?: {}) => Promise<ICreditNotesSuccess>;
type ListingInfoPromise = () => Promise<ICreditNotesInfoSuccess>;

export default {
  ...(listingAPI as {
    getDraft: ListingPromise;
    getAll: ListingPromise;
    getPendingApproval: ListingPromise;
    getApproved: ListingPromise;
    search: ListingPromise;
    getInfo: ListingInfoPromise;
  }),
  findById,
  create,
  update,
  createItem,
  updateItem,
  removeItem,
  addNoteToCreditNote,
  removeNoteFromCreditNote,
  getCreditNoteNotes,
  getApproverList,
  sendApproveRequest,
  approveCreditNote,
  getCreditNoteTags,
  addTag,
  removeTag,
  remove,
  forPrint,
  applyCreditNoteToInvoices
};
