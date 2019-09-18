import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

const UsageValueContainer = styled.div`
  margin: 20px 60px 20px 0;
  padding-left: 20px;
`;

const UsageLabel = styled.div`
  color: ${ColorPalette.gray4};
  font-size: ${Typography.size.smaller};
`;

const UsageValue = styled.div`
  color: ${ColorPalette.gray4};
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.bold};
`;

interface IProps {
  label: string;
  value: string;
}

class UsageValueItem extends React.PureComponent<IProps> {
  public render() {
    const {label, value} = this.props;
    return (
      <UsageValueContainer className="d-flex flex-column">
        <UsageLabel>{label}</UsageLabel>
        <UsageLabel>Used</UsageLabel>
        <UsageValue>{value}</UsageValue>
      </UsageValueContainer>
    );
  }
}

export default UsageValueItem;
