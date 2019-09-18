import * as React from 'react';
import styled from 'styled-components';
import {IInvoice} from 'src/models/FinanceModels/IInvoices';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {formatPrice} from 'src/utility/Helpers';

const WrapperBar = styled.div`
  display: flex;
  width: calc(100% + 40px);
  margin: -30px -20px 15px;
`;

const GrayBar = styled.div`
  flex-basis: 100%;
  background: ${ColorPalette.gray1};
  border-bottom: 1px solid ${ColorPalette.gray2};
  padding: 15px 20px;
`;

const AmountBar = styled.div`
  flex-basis: 210px;
  text-align: left;
  background: ${ColorPalette.gray2};
  padding: 15px 20px;
`;

const AmountValue = styled.span`
  line-height: 1.75;
  font-size: ${Typography.size.medium};
`;

const StrongText = styled.div`
  font-weight: ${Typography.weight.bold};
`;

const GrayText = styled.div`
  color: ${ColorPalette.gray4};
`;

const RateText = styled(GrayText)`
  font-size: ${Typography.size.smaller};
  line-height: 0.7;
`;

interface IProps {
  invoiceData: Partial<IInvoice>;
  showRate?: boolean;
}

const InvoicePaymentBar = ({invoiceData, showRate}: IProps) => (
  <WrapperBar>
    <GrayBar>
      <StrongText>Invoice No. #{invoiceData.id}</StrongText>
      <StrongText>{invoiceData.recipient_name}</StrongText>
      {invoiceData.job && (
        <GrayText>
          Job No. #{invoiceData.job.id}
          {invoiceData.job.assigned_location && <span>–{invoiceData.job.assigned_location.code}</span>}
        </GrayText>
      )}
    </GrayBar>
    <AmountBar>
      <div>AMOUNT TO PAY</div>
      <StrongText>
        <AmountValue>{invoiceData.amount_due && formatPrice(invoiceData.amount_due)}</AmountValue>
      </StrongText>
      {showRate && <RateText>PLUS 1.75% + 30c</RateText>}
    </AmountBar>
  </WrapperBar>
);

export default InvoicePaymentBar;
