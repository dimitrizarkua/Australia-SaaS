import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

export const InnerHeadBlock = styled.div`
  padding: 0 25px;
  border-right: 1px solid ${ColorPalette.white};
  color: ${ColorPalette.white};
  display: flex;
  align-items: center;
  height: 100%;
`;
