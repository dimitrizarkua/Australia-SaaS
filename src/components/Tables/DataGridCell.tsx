import styled from 'styled-components';

const DataGridCell = styled.td<{width?: string; align?: string; hidden?: boolean}>`
  text-align: ${props => props.align && props.align};
  width: ${props => (props.width && props.hidden ? '0px' : props.width)};
`;

const TextCell = styled(DataGridCell)`
  text-align: left;
`;

const NumericCell = styled(DataGridCell)`
  text-align: right;
`;

export {DataGridCell, NumericCell, TextCell};
