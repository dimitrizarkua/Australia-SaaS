import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

export const BoldText = styled.div<{disabled?: boolean}>`
  font-weight: ${props => (props.disabled ? 'inherit' : Typography.weight.bold)};
  color: ${props => (props.disabled ? ColorPalette.gray4 : 'inherit')};
`;

export const GrayText = styled.div`
  color: ${ColorPalette.gray5};
  margin-left: 40px;
`;

export const OptionContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
