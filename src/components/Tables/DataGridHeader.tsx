import styled from 'styled-components';

const DataGridHeader = styled.th<{width?: string; align?: string; hidden?: boolean}>`
  text-align: ${props => props.align && props.align};
  width: ${props => (props.width && props.hidden ? '0px' : props.width)};
`;

const TextHeader = styled(DataGridHeader)`
  text-align: left;
`;

const NumericHeader = styled(DataGridHeader)`
  text-align: right;
`;

export {DataGridHeader, NumericHeader, TextHeader};
