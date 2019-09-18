import CreditNotesService from 'src/services/CreditNotesService';

const listingFunctionNames = ['getInfo', 'getDraft', 'getPendingApproval', 'getApproved', 'getAll', 'search'];

const detailsFunctionNames = ['findById', 'create', 'update', 'createItem', 'updateItem', 'removeItem'];

describe('CreditNotesService', () => {
  it('should has functions for Credit Notes listings endpoints', () => {
    listingFunctionNames.forEach(f => {
      expect(CreditNotesService).toHaveProperty(f);
    });
  });

  it('should has functions for Credit Notes details endpoints', () => {
    detailsFunctionNames.forEach(f => {
      expect(CreditNotesService).toHaveProperty(f);
    });
  });
});
