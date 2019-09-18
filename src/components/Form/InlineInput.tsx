import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const InlineInput = styled.input`
  background: ${ColorPalette.white};
  border-radius: 4px;
  border: 1px solid ${ColorPalette.gray2};
  max-height: 33.5;
  padding: 5px 10px;

  &:focus {
    box-shadow: 0 0 1px ${ColorPalette.gray4};
    border-color: ${ColorPalette.blue2};
    outline: none;
  }

  &:disabled {
    background: ${ColorPalette.gray1};
  }

  &::placeholder {
    font-weight: lighter;
    color: ${ColorPalette.gray4};
  }
`;

export default InlineInput;
