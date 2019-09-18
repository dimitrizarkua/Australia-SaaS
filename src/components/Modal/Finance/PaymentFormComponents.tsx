import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Icon, {IconName} from 'src/components/Icon/Icon';
import {IPaymentReceipt} from 'src/models/FinanceModels/IPayments';
import {FRONTEND_DATE} from 'src/constants/Date';
import {formatPrice} from 'src/utility/Helpers';

export const PaymentForm = styled.form`
  margin-top: 40px;
`;

export const PaymentNotify = styled.div`
  width: 100%;
  margin-top: 25px;
  padding: 10px 15px;
  border-style: solid;
  border-width: 1px 1px 1px 8px;
`;

export const NotifyAlert = styled(PaymentNotify)`
  background: ${ColorPalette.orange0};
  border-color: ${ColorPalette.orange1};
`;

export const NotifySuccess = styled(PaymentNotify)`
  background: ${ColorPalette.green1};
  border-color: ${ColorPalette.green2};
`;

export const AlertIcon = styled(Icon)`
  margin-top: -3px;
  margin-right: 12px;
`;

export const FieldsBlock = styled.div`
  margin-top: 20px;
  padding-top: 35px;
  border-top: 1px solid ${ColorPalette.gray2};
`;

export const PaymentFormError = ({message}: {message: string}) => {
  return (
    <NotifyAlert>
      <AlertIcon name={IconName.Alert} size={18} />
      {message}
    </NotifyAlert>
  );
};

export const PaymentFormSuccess = () => {
  return <NotifySuccess>Your payment was successful.</NotifySuccess>;
};

export const PaymentReceipt = ({receipt}: {receipt: IPaymentReceipt}) => {
  return (
    <>
      <div className="row mt-5">
        <div className="col-3">Date Paid:</div>
        <div className="col-3">{receipt.paid_at.format(FRONTEND_DATE)}</div>
      </div>
      <div className="row">
        <div className="col-3">Receipt Number:</div>
        <div className="col-3">{receipt.external_transaction_id || receipt.transaction_id}</div>
      </div>
      <div className="row mt-3">
        <div className="col-3">Amount:</div>
        <div className="col-3">{formatPrice(receipt.amount)}</div>
      </div>
    </>
  );
};
