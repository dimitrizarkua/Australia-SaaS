import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
const StyledContainer = styled.div`
  padding: 20px 30px;
  position: relative;
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

export const ActionIcon = styled.div<{disabled?: boolean; color?: string}>`
  display: inline-block;
  cursor: pointer;
  margin-right: 20px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};

  :hover path,
  :hover line,
  :hover rect,
  :hover circle {
    stroke: ${props => (props.disabled ? ColorPalette.gray5 : ColorPalette.blue4)};
  }

  path,
  line,
  rect,
  circle {
    stroke: ${props => props.color && props.color};
  }
`;

interface IProps {
  className?: string;
  children: any;
}

class PageMenu extends React.PureComponent<IProps> {
  public render() {
    return <StyledContainer className={this.props.className}>{this.props.children}</StyledContainer>;
  }
}

export default PageMenu;
