import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {
  IPurchaseOrderListItem,
  IPurchaseOrdersInfo,
  IPurchaseOrder,
  IPurchaseOrderItem
} from 'src/models/FinanceModels/IPurchaseOrders';
import HttpService from './HttpService';
import PurchaseOrderTransformer from 'src/transformers/PurchaseOrderTransformer';
import {createFinanceListingApi} from './helpers/ApiHelpers';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import {INotesSuccess} from 'src/services/NotesAndMessagesService';
import CommonFinanceTransformer from 'src/transformers/CommonFinanceTransformer';

export type IPurchaseOrdersInfoSuccess = IObjectEnvelope<IPurchaseOrdersInfo>;
export type IPurchaseOrdersSuccess = IListEnvelope<IPurchaseOrderListItem>;
export type IPurchaseOrderSuccess = IObjectEnvelope<IPurchaseOrder>;
export type IPurchaseOrderItemSuccess = IObjectEnvelope<IPurchaseOrderItem>;

const ENDPOINT_PREFIX_PO = '/v1/finance/purchase-orders';

const findById = async (id: string | number): Promise<IPurchaseOrderSuccess> => {
  const res = await HttpService.get<IPurchaseOrderSuccess>(`${ENDPOINT_PREFIX_PO}/${id}`);
  return PurchaseOrderTransformer.hydrate(res);
};

const create = (data: IFormData): Promise<IPurchaseOrderSuccess> => {
  const purchaseOrder = PurchaseOrderTransformer.dehydrate(data);
  return HttpService.post<IPurchaseOrderSuccess>(ENDPOINT_PREFIX_PO, purchaseOrder)
    .then(PurchaseOrderTransformer.hydrate)
    .catch(err => Promise.reject(CommonFinanceTransformer.hydrateError(err)));
};

const remove = async (poId: number) => {
  return HttpService.remove<any>(`${ENDPOINT_PREFIX_PO}/${poId}`);
};

const update = (id: string | number, data: IFormData): Promise<IPurchaseOrderSuccess> => {
  const purchaseOrder = PurchaseOrderTransformer.dehydrate(data);
  return HttpService.patch<IPurchaseOrderSuccess>(`${ENDPOINT_PREFIX_PO}/${id}`, purchaseOrder)
    .then(PurchaseOrderTransformer.hydrate)
    .catch(err => Promise.reject(CommonFinanceTransformer.hydrateError(err)));
};

const createItem = async (id: string | number, data: IPurchaseOrderItem): Promise<IPurchaseOrderItemSuccess> => {
  const item = PurchaseOrderTransformer.dehydrateItem(data);
  return await HttpService.post<IPurchaseOrderItemSuccess>(`${ENDPOINT_PREFIX_PO}/${id}/items`, item);
};

const updateItem = async (
  id: string | number,
  itemId: string | number,
  data: IPurchaseOrderItem
): Promise<IPurchaseOrderItemSuccess> => {
  const item = PurchaseOrderTransformer.dehydrateItem(data);
  return await HttpService.patch<IPurchaseOrderItemSuccess>(`${ENDPOINT_PREFIX_PO}/${id}/items/${itemId}`, item);
};

const removeItem = async (id: string | number, itemId: string | number): Promise<void> => {
  return await HttpService.remove<void>(`${ENDPOINT_PREFIX_PO}/${id}/items/${itemId}`);
};

const getPurchaseOrderNotes = async (poId: string | number): Promise<INotesSuccess> => {
  return await HttpService.get<INotesSuccess>(`${ENDPOINT_PREFIX_PO}/${poId}/notes`);
};

const addNoteToPurchaseOrder = async (noteId: string | number, poId: string | number) => {
  return await HttpService.post<void>(`${ENDPOINT_PREFIX_PO}/${poId}/notes/${noteId}`);
};

const removeNoteFromPurchaseOrder = async (noteId: string | number, poId: string | number) => {
  return await HttpService.remove<void>(`${ENDPOINT_PREFIX_PO}s/${poId}/notes/${noteId}`);
};

const getApproverList = async (poId: string | number): Promise<any> => {
  return await HttpService.get<any>(`${ENDPOINT_PREFIX_PO}/${poId}/approver-list`);
};

const sendApproveRequest = async (poId: string | number, list: number[]): Promise<any> => {
  return await HttpService.post<any>(`${ENDPOINT_PREFIX_PO}/${poId}/approve-requests`, {approver_ids: list});
};

const approvePurchaseOrder = async (poId: string | number): Promise<any> => {
  return await HttpService.post(`${ENDPOINT_PREFIX_PO}/${poId}/approve`);
};

const getPurchaseOrderTags = async (poId: number): Promise<any> => {
  return await HttpService.get<any>(`${ENDPOINT_PREFIX_PO}/${poId}/tags`);
};

const addTag = async (tagId: number, poId: number): Promise<any> => {
  return await HttpService.post<any>(`${ENDPOINT_PREFIX_PO}/${poId}/tags/${tagId}`);
};

const removeTag = async (tagId: number, poId: number): Promise<any> => {
  return await HttpService.remove<any>(`${ENDPOINT_PREFIX_PO}/${poId}/tags/${tagId}`);
};

const forPrint = async (poId: number) => {
  return HttpService.downloadFile(`${ENDPOINT_PREFIX_PO}/${poId}/document`);
};

const listingAPI = createFinanceListingApi<IPurchaseOrdersSuccess, IPurchaseOrdersInfoSuccess>(
  `${ENDPOINT_PREFIX_PO}/listings`,
  {
    getDraft: 'draft',
    getPendingApproval: 'pending-approval',
    getApproved: 'approved',
    getAll: 'all',
    getFoundPurchaseOrders: 'search'
  }
);

type ListingPromise = (params?: {}) => Promise<IPurchaseOrdersSuccess>;
type ListingInfoPromise = () => Promise<IPurchaseOrdersInfoSuccess>;

export default {
  ...(listingAPI as {
    getDraft: ListingPromise;
    getPendingApproval: ListingPromise;
    getApproved: ListingPromise;
    getAll: ListingPromise;
    getFoundPurchaseOrders: ListingPromise;
    getInfo: ListingInfoPromise;
  }),
  findById,
  create,
  update,
  createItem,
  updateItem,
  removeItem,
  getPurchaseOrderNotes,
  addNoteToPurchaseOrder,
  removeNoteFromPurchaseOrder,
  getApproverList,
  sendApproveRequest,
  approvePurchaseOrder,
  getPurchaseOrderTags,
  addTag,
  removeTag,
  remove,
  forPrint
};
