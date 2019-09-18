import React from 'react';
import styled, {css} from 'styled-components';
import {DarkRow} from 'src/components/AppLayout/FinanceLayout/PaymentPages/PaymentStyledComponents';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';

export const FinReportLayout = styled(DarkRow)`
  padding-top: 20px;
  min-height: 470px;
  position: relative;
  display: flex;
  width: auto;
`;

// 100px it is sum of heights filter and tab rows
export const FinReportScrollableContainer = styled(ScrollableContainer)`
  height: calc(100% - 100px);
`;

export const FinReportNoDataRow = React.memo(({colspan}: {colspan: number}) => (
  <tr>
    <td colSpan={colspan} style={{textAlign: 'center'}}>
      No data
    </td>
  </tr>
));

const FIN_STAT_WIDTH = 440;

export const FinReportStatLayout = styled.div`
  display: flex;
  width: ${FIN_STAT_WIDTH}px;
`;

// TODO Consider resolve print chart problem
export const FinReportChartLayout = styled.div`
  width: calc(100% - ${FIN_STAT_WIDTH + 40}px);
  @media print {
    width: 100%;
  }
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

export const FinReportLayoutTable = styled.div`
  padding: 5px 15px;
`;

const commonCurrencyTableProps = css`
  text-align: right;
`;

export const CurrencyTd = styled.td`
  ${commonCurrencyTableProps}
  width: 8%;
  white-space: nowrap;
  max-width: 140px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const CurrencyTh = styled.th`
  ${commonCurrencyTableProps}
`;

export const FinReportTableWrapper = styled.div`
  margin: 10px 0px;
  padding: 10px 10px;
`;

export const FinReportTable = styled.table<{
  noStripped?: boolean;
}>`
  border: 1px solid ${ColorPalette.gray2}
  padding: 0 30px;
  
  tr {
    border: 1px solid ${ColorPalette.gray2}
  }
  
  thead th {
    height: 35px;
    font-weight: ${Typography.weight.normal}
    color: ${ColorPalette.gray3}
  }
  
  tbody tr {
    height: 45px;
    text-align: left;
  }
  
  td, th {
    padding: 15px;
  }
  
  td.fin-report__fixed-width {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  
  tbody {
    ${props =>
      props.noStripped
        ? null
        : `tr: nth-of-type(2n-1) {
        background: ${ColorPalette.gray0}
      }`}
    
    tr td:not(:last-of-type) {
      font-weight: ${Typography.weight.medium}
    }
  }
`;
