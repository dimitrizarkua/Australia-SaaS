import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';

const CopyAddressLink = styled.a`
  margin-left: 30px;
  display: inline-block;
  cursor: pointer;
  color: ${ColorPalette.blue4}!important;
  font-weight: ${Typography.weight.normal};
`;

export default CopyAddressLink;
