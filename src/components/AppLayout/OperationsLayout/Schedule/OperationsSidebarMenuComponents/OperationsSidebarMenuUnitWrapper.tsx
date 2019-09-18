import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const Wrapper = styled.div`
  padding: 10px;
  background: ${ColorPalette.white};
  border-radius: 4px;
  border: 1px solid ${ColorPalette.gray2};
  position: relative;
  margin-bottom: 10px;
`;

class OperationsSidebarMenuUnitWrapper extends React.PureComponent {
  public render() {
    return <Wrapper>{this.props.children}</Wrapper>;
  }
}

export default OperationsSidebarMenuUnitWrapper;
