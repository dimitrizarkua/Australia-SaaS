import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import PlainTable, {PseudoTable} from './PlainTable';
import {Th, Tr, LinkTr, Td} from './PseudoTableItems';

export default styled(PlainTable)`
  th {
    font-weight: ${Typography.weight.normal};
  }
  th:first-child {
    min-width: 300px;
  }
  th:nth-child(2) ~ th {
    text-align: right;
  }
  tbody tr {
    td:first-child {
      width: 110px;
    }
    td:nth-child(2) {
      font-weight: ${Typography.weight.bold};
    }
    td:nth-child(3) ~ td {
      text-align: right;
    }
  }
`;

export const FinancePseudoTable = styled(PseudoTable)`
  ${Th} {
    font-weight: ${Typography.weight.normal};
  }
  ${Tr}, ${LinkTr} {
    ${Td}:first-of-type {
      width: 110px;
    }
    ${Td}:nth-of-type(2) {
      font-weight: ${Typography.weight.bold};
    }
  }
`;
