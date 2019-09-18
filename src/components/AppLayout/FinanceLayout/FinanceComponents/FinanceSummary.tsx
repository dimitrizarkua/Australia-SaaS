import * as React from 'react';
import {formatPrice} from 'src/utility/Helpers';

import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

export const Summary = styled.div`
  display: inline-block;
  text-align: right;
`;

export const Row = styled.div`
  display: table-row;
`;

export const Label = styled.div`
  display: table-cell;
  text-align: left;
  padding: 10px 40px 10px 120px;
  color: ${ColorPalette.gray5};
`;

export const Value = styled.div`
  display: table-cell;
  text-align: right;
  padding: 10px 40px 10px 10px;
  font-weight: ${Typography.weight.bold};
`;

export const DueLabel = styled.div`
  border-top: 2px solid ${ColorPalette.gray2};
  display: table-cell;
  text-align: left;
  padding: 10px 130px 10px 10px;
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.bold};
`;

export const DueValue = styled.div`
  border-top: 2px solid ${ColorPalette.gray2};
  display: table-cell;
  padding: 10px 40px 10px 10px;
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.bold};
  text-align: right;
`;

interface IProps {
  subTotal: number | string;
  taxes: number | string;
  total: number | string;
  balanceDue: number | string;
  entityType?: 'invoice' | 'purchase_order' | 'credit_note';
}

class FinanceSummary extends React.PureComponent<IProps> {
  public render() {
    const {subTotal, taxes, total, balanceDue, entityType} = this.props;
    return (
      <Summary>
        <Row>
          <Label>Sub-total</Label>
          <Value>{formatPrice(subTotal)}</Value>
        </Row>
        <Row>
          <Label>Tax</Label>
          <Value>{formatPrice(taxes)}</Value>
        </Row>
        <Row>
          <Label>TOTAL</Label>
          <Value>{formatPrice(total)}</Value>
        </Row>
        {entityType === 'invoice' && (
          <>
            <Row>
              <DueLabel>Balance Due</DueLabel>
              <DueValue>{formatPrice(balanceDue)}</DueValue>
            </Row>
          </>
        )}
      </Summary>
    );
  }
}

export default FinanceSummary;
