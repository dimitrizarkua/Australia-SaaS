import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const ReferenceBarBlock = styled.div`
  width: 300px;
  border-left: 1px solid ${ColorPalette.gray2};
  background: ${ColorPalette.gray1};
  min-height: 100%;
  position: relative;
`;

class ReferenceBar extends React.PureComponent {
  public render() {
    return <ReferenceBarBlock className="flex-shrink-0">{this.props.children}</ReferenceBarBlock>;
  }
}

export default ReferenceBar;
