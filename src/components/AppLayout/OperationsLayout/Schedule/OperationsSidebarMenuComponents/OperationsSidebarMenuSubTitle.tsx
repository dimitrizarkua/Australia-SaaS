import * as React from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import styled from 'styled-components';

const Wrap = styled(ColoredDiv)`
  :first-child {
    margin-top: 0 !important;
  }
`;

class OperationsSidebarMenuSubTitle extends React.PureComponent {
  public render() {
    return (
      <Wrap color={ColorPalette.gray4} style={{textTransform: 'uppercase'}} margin="40px 0 10px 0">
        {this.props.children}
      </Wrap>
    );
  }
}

export default OperationsSidebarMenuSubTitle;
