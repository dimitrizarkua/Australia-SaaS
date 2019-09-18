import FinanceService from '../FinanceService';
import Permission from 'src/constants/Permission';
import {FinanceEntityStatus} from 'src/constants/FinanceEntityStatus';
import moment from 'moment';

describe('FinanceService', () => {
  describe('isEditable', () => {
    const newInvoice = {};
    const draftInvoice = {
      latest_status: {status: FinanceEntityStatus.draft}
    };
    const approvedInvoice = {
      latest_status: {status: FinanceEntityStatus.approved}
    };
    const lockedInvoice = {
      latest_status: {status: FinanceEntityStatus.draft},
      locked_at: moment()
    };

    it('should return false if has no manage permission', () => {
      const context = {has: () => false};
      const isEditable = FinanceService.isEditable(
        Permission.INVOICES_MANAGE,
        Permission.INVOICES_MANAGE_LOCKED,
        draftInvoice as any,
        context
      );
      expect(isEditable).toEqual(false);
    });

    it('should return false if locked and has no manage_locked permission', () => {
      const context = {has: (p: Permission) => p === Permission.INVOICES_MANAGE};
      const isEditable = FinanceService.isEditable(
        Permission.INVOICES_MANAGE,
        Permission.INVOICES_MANAGE_LOCKED,
        lockedInvoice as any,
        context
      );
      expect(isEditable).toEqual(false);
    });

    it('should return false if approved invoice', () => {
      const context = {has: () => true};
      const isEditable = FinanceService.isEditable(
        Permission.INVOICES_MANAGE,
        Permission.INVOICES_MANAGE_LOCKED,
        approvedInvoice as any,
        context
      );
      expect(isEditable).toEqual(false);
    });

    it('should return true if new invoice', () => {
      const context = {has: () => true};
      const isEditable = FinanceService.isEditable(
        Permission.INVOICES_MANAGE,
        Permission.INVOICES_MANAGE_LOCKED,
        newInvoice as any,
        context
      );
      expect(isEditable).toEqual(true);
    });

    it('should return true if locked invoice and has manage_locked permission', () => {
      const context = {has: () => true};
      const isEditable = FinanceService.isEditable(
        Permission.INVOICES_MANAGE,
        Permission.INVOICES_MANAGE_LOCKED,
        lockedInvoice as any,
        context
      );
      expect(isEditable).toEqual(true);
    });
  });
});
