import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import PlainTable from './PlainTable';

const StripedTable = styled(PlainTable)`
  thead tr {
    height: 50px;
  }
  tbody tr:nth-of-type(odd) {
    background: ${ColorPalette.gray0};
  }
  input {
    background: white;
    border: 1px solid ${ColorPalette.gray2};
  }
  .form-group {
    margin-bottom: 0;
  }
`;

export default StripedTable;
