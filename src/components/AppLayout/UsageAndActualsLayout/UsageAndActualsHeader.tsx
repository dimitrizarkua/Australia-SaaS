import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

interface IProps {
  siteAddress: string;
  additionalHeaderLayout?: any;
  customHeaderTitle?: string;
}

const ButtonsPanel = styled.div`
  padding: 0px 25px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const HeaderPanel = styled.div`
  height: 55px;
  background: ${ColorPalette.white};
  border: 1px ${ColorPalette.gray2} solid;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-content: center;
`;

const InnerHeadBlock = styled.div`
  height: 100%;
  display: flex;
`;

const PageTitleBlock = styled.div`
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.medium};
  padding-left: 26px;
  display: flex;
  align-items: center;
  margin-right: ${Typography.size.big};
`;

const JobTitleBlock = styled.div`
  font-weight: ${Typography.weight.medium};
  font-size: ${Typography.size.medium};
  color: ${ColorPalette.gray4};
  display: flex;
  align-items: center;
`;

class UsageAndActualsHeader extends React.PureComponent<IProps> {
  public render() {
    const {siteAddress, additionalHeaderLayout, customHeaderTitle} = this.props;

    return (
      <HeaderPanel>
        <InnerHeadBlock>
          <PageTitleBlock>{customHeaderTitle || 'Job Usage, Actuals, Reports'}</PageTitleBlock>
          <JobTitleBlock>{siteAddress}</JobTitleBlock>
        </InnerHeadBlock>

        <ButtonsPanel className="flex-grow-1">{additionalHeaderLayout}</ButtonsPanel>
      </HeaderPanel>
    );
  }
}

export default UsageAndActualsHeader;
