import styled, {css} from 'styled-components';
import {Link} from 'react-router-dom';
import ColorPalette from 'src/constants/ColorPalette';

const borderStyle = `1px solid ${ColorPalette.gray2} !important`;

const cellPaddingStyle = css`
  padding: 0.75em;
`;

const Table = styled.div`
  display: table;
  border: ${borderStyle};
`;

const THead = styled.div`
  display: table-header-group;
`;

const Th = styled.div`
  display: table-cell;
  ${cellPaddingStyle};
  border-bottom: ${borderStyle};
`;

const TBody = styled.div`
  display: table-row-group;
`;

const Td = styled.div`
  display: table-cell;
  ${cellPaddingStyle};
`;

const Tr = styled.div`
  display: table-row;
  &:not(:last-of-type) ${Td} {
    border-bottom: ${borderStyle};
  }
`;

const LinkTr = styled(Link)`
  display: table-row;
  color: unset;
  &:not(:last-of-type) ${Td} {
    border-bottom: ${borderStyle};
  }
  &:hover {
    color: unset;
    text-decoration: none;
  }
`;

export {TBody, Table, Th, THead, Td, Tr, LinkTr};
