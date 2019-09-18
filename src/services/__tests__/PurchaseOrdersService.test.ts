import PurchaseOrdersService from 'src/services/PurchaseOrdersService';

const listingFunctionNames = [
  'getInfo',
  'getDraft',
  'getPendingApproval',
  'getApproved',
  'getAll',
  'getFoundPurchaseOrders'
];

const detailsFunctionNames = ['findById', 'create', 'update', 'createItem', 'updateItem', 'removeItem'];

describe('PurchaseOrdersService', () => {
  it('should has functions for Purchase Orders listings endpoints', () => {
    listingFunctionNames.forEach(f => {
      expect(PurchaseOrdersService).toHaveProperty(f);
    });
  });

  it('should has functions for Purchase Orders details endpoints', () => {
    detailsFunctionNames.forEach(f => {
      expect(PurchaseOrdersService).toHaveProperty(f);
    });
  });
});
