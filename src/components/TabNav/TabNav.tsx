import * as React from 'react';
import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import withoutProps from 'src/components/withoutProps/withoutProps';

export interface ITab {
  name: string;
  id: any;
  onClick?: (tab: ITab) => any;
  disabled?: boolean;
}

interface IProps {
  selectedTabId: any;
  items: ITab[];
}

const TabsHolder = styled.div`
  height: 100%;
  display: flex;
`;

const Tab = styled(withoutProps(['active', 'disabled'])('div'))<{
  active?: boolean;
  disabled?: boolean;
}>`
  padding: 0 20px;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: ${props => (props.disabled ? '.4' : '1')};
  color: ${ColorPalette.gray5};
  font-weight: ${props => props.active && Typography.weight.bold};
  box-shadow: ${props => props.active && `0 -3px 0 ${ColorPalette.blue2} inset`};
`;

class TabNav extends React.PureComponent<IProps> {
  public render() {
    const {items, selectedTabId} = this.props;

    return (
      <TabsHolder>
        {items.map((el: ITab, index) => (
          <Tab
            active={selectedTabId === el.id}
            key={index}
            disabled={el.disabled}
            onClick={() => (!el.disabled && el.onClick && selectedTabId !== el.id ? el.onClick(el) : undefined)}
          >
            {el.name}
          </Tab>
        ))}
      </TabsHolder>
    );
  }
}

export default TabNav;
