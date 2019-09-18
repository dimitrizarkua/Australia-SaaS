import ColorPalette from 'src/constants/ColorPalette';

export enum FinanceEntityVirtualStatus {
  draft = 'draft',
  pending_approval = 'pending_approval',
  overdue = 'overdue',
  paid = 'paid',
  unpaid = 'unpaid'
}

export enum FinanceEntityStatus {
  draft = 'draft',
  approved = 'approved'
}

export const financeEntityStatusName = {
  [FinanceEntityStatus.draft]: 'draft',
  [FinanceEntityVirtualStatus.pending_approval]: 'pending approval',
  [FinanceEntityStatus.approved]: 'approved',
  [FinanceEntityVirtualStatus.paid]: 'paid',
  [FinanceEntityVirtualStatus.unpaid]: 'unpaid'
};

export const colorStatus = {
  [FinanceEntityStatus.draft]: ColorPalette.gray6,
  [FinanceEntityVirtualStatus.pending_approval]: ColorPalette.orange1,
  [FinanceEntityStatus.approved]: ColorPalette.gray4,
  [FinanceEntityVirtualStatus.unpaid]: ColorPalette.red1,
  [FinanceEntityVirtualStatus.paid]: ColorPalette.purple1,
  DEFAULT: ColorPalette.gray0
};
