import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

const SummaryValueContainer = styled.div<{showLeftBorder?: boolean}>`
  margin: 20px 60px 20px 0;
  padding-left: 30px;
  border-left: ${props => (props.showLeftBorder ? `1px solid ${ColorPalette.gray2}` : 'none')};
`;

const SummaryLabel = styled.div`
  color: ${ColorPalette.gray5};
  font-size: ${Typography.size.normal};
`;

const SummaryValue = styled.div`
  color: ${ColorPalette.black0};
  font-size: ${Typography.size.big};
  font-weight: ${Typography.weight.medium};
`;

interface IProps {
  label: string;
  value: string;
  showLeftBorder?: boolean;
}

class SummaryValueItem extends React.PureComponent<IProps> {
  public render() {
    const {label, value, showLeftBorder} = this.props;
    return (
      <SummaryValueContainer className="d-flex flex-column" showLeftBorder={showLeftBorder}>
        <SummaryLabel>{label}</SummaryLabel>
        <SummaryValue>{value}</SummaryValue>
      </SummaryValueContainer>
    );
  }
}

export default SummaryValueItem;
