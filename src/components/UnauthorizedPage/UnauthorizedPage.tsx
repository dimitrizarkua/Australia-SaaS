import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const Header = styled.h1`
  background: ${ColorPalette.red1};
  padding: 20px;
  color: ${ColorPalette.white};
`;

class UnauthorizedPage extends React.PureComponent {
  public render() {
    return (
      <div className="container h-100">
        <div className="row align-items-center justify-content-center h-100">
          <div className="col-lg-12">
            <Header>Unauthorized Access</Header>
            You don't have permission to access this page
          </div>
        </div>
      </div>
    );
  }
}

export default UnauthorizedPage;
