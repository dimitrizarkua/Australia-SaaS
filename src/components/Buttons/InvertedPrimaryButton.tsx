import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const InvertedPrimaryButton = styled.button`
  background: ${ColorPalette.white};
  color: ${ColorPalette.blue2};
  font-weight: lighter;
  border-color: ${ColorPalette.blue2};
  box-shadow: 0 0 0 !important;

  &:hover,
  &:active {
    background: ${ColorPalette.blue0} !important;
    border-color: ${ColorPalette.blue3} !important;
  }

  &:disabled {
    opacity: 0.3;
    background: ${ColorPalette.white};
    color: ${ColorPalette.blue2};
    border-color: ${ColorPalette.blue2};
  }
`;

export default InvertedPrimaryButton;
