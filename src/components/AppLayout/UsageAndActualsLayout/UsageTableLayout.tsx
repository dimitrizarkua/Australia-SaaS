import styled from 'styled-components';
import PlainTable from 'src/components/Tables/PlainTable';
import ColorPalette from 'src/constants/ColorPalette';

const UsageTableLayout = styled(PlainTable)`
  thead {
    tr {
      th {
        border-bottom: 1px solid ${ColorPalette.gray2};
        &:first-child {
          color: ${ColorPalette.black1};
        }
      }
    }
  }

  tbody {
    tr {
      border-top: 1px solid ${ColorPalette.gray2};
    }
  }
`;

export default UsageTableLayout;
