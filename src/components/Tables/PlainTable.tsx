import styled, {css} from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {Table, Td, Tr, Th, THead, TBody, LinkTr} from './PseudoTableItems';

const rowHeight = 50;

const TableStyles = css`
  border: 1px solid ${ColorPalette.gray2};
  width: 100%;
`;

const TrStyles = css`
  height: ${rowHeight}px;
`;

const TdStyles = css`
  padding: 5px 15px;
  vertical-align: middle;
  &:first-child {
    padding-left: 20px;
  }
`;

const TBodyTrStyles = css`
  cursor: pointer;
  &.selected-row {
    background-color: ${ColorPalette.blue0};
    &:hover {
      opacity: 0.75;
    }
  }
  &:hover {
    background-color: ${ColorPalette.semiGray};
  }
`;

const THeadThStyles = css`
  color: ${ColorPalette.gray4};
  ${TdStyles}
`;

const PlainTable = styled.table`
  ${TableStyles}
  tr {
    ${TrStyles}
  }
  td {
    ${TdStyles}
  }
  tbody tr {
    ${TBodyTrStyles}
  }
  thead {
    tr {
      th {
        ${THeadThStyles}
      }
    }
  }
  .no-items {
    color: ${ColorPalette.gray4};
    text-align: center;
  }
`;

export const PseudoTable = styled(Table)`
  ${TableStyles}
  position: relative;
  ${Tr}, ${LinkTr} {
    ${TrStyles}
  }
  ${Td} {
    ${TdStyles}
  }
  ${TBody} ${Tr}, ${LinkTr} {
    ${TBodyTrStyles}
  }
  ${THead} {
    ${Tr} {
      ${Th} {
        ${THeadThStyles}
      }
    }
  }
  .no-items {
    color: ${ColorPalette.gray4};
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: absolute;
    height: ${rowHeight}px;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
`;

export default PlainTable;
