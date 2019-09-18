import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const ReportSummaryWrapper = styled.div`
  background: ${ColorPalette.gray1};
  border: 1px solid ${ColorPalette.gray2};
  text-align: center;
  padding: 0 0 0 30px;
`;

class ReportSummary extends React.PureComponent {
  public render() {
    return <ReportSummaryWrapper>{this.props.children}</ReportSummaryWrapper>;
  }
}

export default ReportSummary;
