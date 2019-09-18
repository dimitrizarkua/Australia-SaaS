import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

export default styled.div`
  background: ${ColorPalette.gray2};
  padding: 0px 26px;
  margin-top: 2rem;
  overflow: hidden;
  min-height: 50px;
  path,
  circle {
    stroke: ${ColorPalette.black0};
  }
`;
