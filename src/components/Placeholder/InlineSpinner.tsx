import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import withoutProps from 'src/components/withoutProps/withoutProps';

const InlineSpinner = styled(withoutProps(['size'])('div'))<{size: number}>`
  animation: spin 0.8s infinite linear;
  height: ${props => props.size}px;
  width: ${props => props.size}px;
  vertical-align: top;
  box-sizing: border-box;
  border-radius: 50%;
  border: 2px solid ${ColorPalette.gray2};
  border-right-color: ${ColorPalette.gray5};
  display: inline-block;

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
`;

export default InlineSpinner;
