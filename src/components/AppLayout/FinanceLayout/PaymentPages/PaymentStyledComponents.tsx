import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import PlainTable from 'src/components/Tables/PlainTable';
import CommonStyledComponents from 'src/components/Layout/Common/StyledComponents';
import NotPrintable from 'src/components/Layout/Reports/NotPrintable';

export const CellContent = styled.div`
  div {
    &:last-child {
      color: ${ColorPalette.gray5};
    }
  }
`;

export const InvoiceCellContent = styled(CellContent)`
  div {
    &:first-child {
      font-weight: ${Typography.weight.bold};
    }
  }
`;

export const PaymentsTable = styled(PlainTable)`
  th {
    font-weight: ${Typography.weight.normal};
  }
  td {
    vertical-align: top;
    padding-top: 12px;
    padding-bottom: 10px;
  }
`;

export const PaymentsForm = styled.form`
  max-width: 800px;
  padding: 0 40px;

  .form-group {
    margin-bottom: 2rem;
  }

  input {
    background: ${ColorPalette.white};
    border: 1px solid ${ColorPalette.gray2};

    &:disabled {
      background: ${ColorPalette.gray1};
    }
  }
`;

export const TabsHolder = styled.div`
  padding: 3px 30px 0;
  height: 50px;
  background: ${ColorPalette.white};
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

export const DarkRow = CommonStyledComponents.ColoredRow;

export const PurpleStripeContent = styled.div`
  display: flex;
  flex-basis: 100%;
  flex-direction: row-reverse;
  padding: 15px 0 15px 15px;
`;

export const PurpleStripeText = styled.div`
  line-height: 50px;
  color: ${ColorPalette.white};
  text-align: left;
  width: 100%;
`;

export const PrintButtonContainer = styled(NotPrintable)`
  line-height: 45px;
  padding: 0 15px;
`;

export default {
  CellContent,
  InvoiceCellContent,
  PaymentsTable,
  PaymentsForm,
  TabsHolder,
  DarkRow,
  PurpleStripeContent,
  PurpleStripeText,
  PrintButtonContainer
};
