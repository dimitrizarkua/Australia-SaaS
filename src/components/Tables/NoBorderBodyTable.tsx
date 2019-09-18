import styled from 'styled-components';
import PlainTable from './PlainTable';
import ColorPalette from 'src/constants/ColorPalette';

export default styled(PlainTable)`
  width: 100%;
  border: none;
  border-spacing: 0;
  border-collapse: separate;
  thead {
    tr {
      cursor: default;
      th {
        color: ${ColorPalette.gray4};
        vertical-align: middle;
        border-bottom: none;
        &:first-child {
          border-left: 1px solid ${ColorPalette.gray2};
        }
        &:last-child {
          border-right: 1px solid ${ColorPalette.gray2};
        }
      }
    }
  }
  tbody {
    tr {
      cursor: default;
      td {
        border-top: none;
      }
    }
  }
  .no-items {
    color: ${ColorPalette.gray4};
    text-align: center;
    border: 1px solid ${ColorPalette.gray2};
    background: ${ColorPalette.gray0};
  }
`;
