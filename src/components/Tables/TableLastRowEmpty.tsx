import styled from 'styled-components';
import PlainTable from './PlainTable';
import ColorPalette from 'src/constants/ColorPalette';

export default styled(PlainTable)`
  width: 100%;
  border: none;
  margin-bottom: 0;
  thead {
    th {
      color: ${ColorPalette.black0};
      background: ${ColorPalette.gray0};
    }
  }
  tbody {
    tr {
      td:first-child {
        border-left: 1px solid ${ColorPalette.gray2};
      }
      td:last-child {
        border-right: 1px solid ${ColorPalette.gray2};
      }
      td {
        border-top: 1px solid ${ColorPalette.gray2};
      }
    }
    tr:last-child {
      &:hover {
        background-color: ${ColorPalette.white};
      }
      td {
        border-left: none;
        border-right: none;
      }
    }
  }
  .no-items {
    background: ${ColorPalette.white};
    text-align: left;
  }
`;
