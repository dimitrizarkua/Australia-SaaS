import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const PrimaryButton = styled.button`
  background: ${ColorPalette.blue2};
  color: ${ColorPalette.white};
  font-weight: lighter;
  border-color: ${ColorPalette.blue2};
  box-shadow: 0 0 0 !important;

  &:hover,
  &:active {
    background: ${ColorPalette.blue3} !important;
    border-color: ${ColorPalette.blue3} !important;
  }

  &:disabled {
    opacity: 0.3;
    background: ${ColorPalette.blue2};
    color: ${ColorPalette.white};
    border-color: ${ColorPalette.blue2};
  }
`;

export default PrimaryButton;
