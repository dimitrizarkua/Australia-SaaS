import * as React from 'react';
import {RouteComponentProps, withRouter, Link} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const Header = styled.h1`
  background: ${ColorPalette.red1};
  padding: 20px;
  color: ${ColorPalette.white};
`;

class NotFoundPage extends React.PureComponent<RouteComponentProps<{}>> {
  public render() {
    return (
      <div className="container h-100">
        <div className="row align-items-center justify-content-center h-100">
          <div className="col-lg-12">
            <Header>Page not found</Header>
            Please try following links:
            <div>
              <Link to={'/login'}>Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(NotFoundPage);
