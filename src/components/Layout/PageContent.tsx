import * as React from 'react';
import styled from 'styled-components';
import {HTMLAttributes} from 'react';

const StyledContainer = styled.div`
  padding: 30px;
  position: relative;
`;

interface IProps extends HTMLAttributes<unknown> {
  className?: string;
  children: any;
}

class PageContent extends React.PureComponent<IProps> {
  public render() {
    const {style, className, children} = this.props;

    return (
      <StyledContainer style={style} className={className}>
        {children}
      </StyledContainer>
    );
  }
}

export default PageContent;
