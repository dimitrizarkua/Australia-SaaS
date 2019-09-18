import {toast, ToastOptions} from 'react-toastify';
import {css} from 'glamor';
import ColorPalette from 'src/constants/ColorPalette';
import * as React from 'react';

export enum NotifyType {
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
  Info = 'info'
}

export default function(type: NotifyType, content: string | React.ReactElement<unknown>, options: ToastOptions = {}) {
  toast(
    content,
    Object.assign(
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        draggable: false,
        className: css({
          background: `${ColorPalette.bootstrap[`${type}0`]} !important`,
          color: `${ColorPalette.bootstrap[`${type}2`]} !important`,
          borderRadius: `0px !important`,
          minHeight: `40px !important`
        })
      },
      options
    )
  );
}
