import InvoicesService from 'src/services/InvoicesService';

const listingFunctionNames = ['getAll', 'getDraft', 'getUnpaid', 'getOverdue', 'getInfo', 'search'];

const detailsFunctionNames = ['findById', 'create', 'update', 'createItem', 'updateItem', 'removeItem'];

describe('InvoiceService', () => {
  it('should has functions for Invoices listings endpoints', () => {
    listingFunctionNames.forEach(f => {
      expect(InvoicesService).toHaveProperty(f);
    });
  });

  it('should has functions for Invoices details endpoints', () => {
    detailsFunctionNames.forEach(f => {
      expect(InvoicesService).toHaveProperty(f);
    });
  });
});
