import * as React from 'react';
import styled from 'styled-components';
import {HTMLAttributes} from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import {headerHeight} from 'src/components/Layout/Common/SubHeaderPanel';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';

const Body = styled.div`
  height: calc(100% - ${headerHeight}px);
`;

const GreyContainer = styled.div`
  padding: 60px 80px 0 80px;
  background-color: ${ColorPalette.gray1};
  position: relative;
  min-height: 100%;
`;

const WhiteContainer = styled.div`
  background-color: ${ColorPalette.white};
  border: 1px solid ${ColorPalette.gray2};
  border-radius: 5px;
  @media print {
    border: none;
  }
`;

const ReportContainer = styled.div`
  margin: 40px 20px 40px 20px;
`;

interface IProps extends HTMLAttributes<unknown> {
  children: any;
}

class ReportPage extends React.PureComponent<IProps> {
  public render() {
    const {style, children} = this.props;

    return (
      <Body>
        <ScrollableContainer className="h-100">
          <GreyContainer style={style} className="d-flex flex-column">
            <WhiteContainer className="flex-grow-1">
              <ReportContainer>{children}</ReportContainer>
            </WhiteContainer>
          </GreyContainer>
        </ScrollableContainer>
      </Body>
    );
  }
}

export default ReportPage;
