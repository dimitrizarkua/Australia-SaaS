import styled from 'styled-components';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import ColorPalette from 'src/constants/ColorPalette';

export default styled(ColoredDiv)`
  border-bottom: 1px solid ${ColorPalette.gray2};
  position: relative;
`;
