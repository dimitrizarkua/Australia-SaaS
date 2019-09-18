import styled from 'styled-components';
import React from 'react';
import ColorPalette from 'src/constants/ColorPalette';

export const headerHeight = 50;

const SubHeaderLayout = styled.div`
  height: ${headerHeight}px;
  background: ${ColorPalette.purple2};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface IProps {
  className?: string;
  children: any;
}

class SubHeaderPanel extends React.PureComponent<IProps> {
  public render() {
    return <SubHeaderLayout className={this.props.className}>{this.props.children}</SubHeaderLayout>;
  }
}

export default SubHeaderPanel;
