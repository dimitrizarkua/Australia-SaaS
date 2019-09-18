import * as React from 'react';

export interface IModalWindowBaseProps {
  onClose: (e?: any) => void;
  title?: string;
  body?: React.ReactElement<unknown> | string;
  footer?: React.ReactElement<unknown> | string;
  loading?: boolean | undefined;
  customModal?: boolean;
  closeCaption?: string;
}

export interface IModal extends IModalWindowBaseProps {
  isOpen: boolean;
}
