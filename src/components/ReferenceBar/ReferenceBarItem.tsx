import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import Icon, {IconName} from 'src/components/Icon/Icon';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps {
  caption?: string;
  collapsable?: boolean;
  defaultCollapsed?: boolean;
  hasMenu?: boolean;
  loading?: boolean;
  overflow?: string;
}

interface IState {
  collapsed: boolean;
  overflow: string;
}

const ItemBlock = styled(withoutProps(['collapsed', 'overflow'])('div'))<{collapsed: boolean; overflow: string}>`
  width: 280px;
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  border-color: ${props => (props.collapsed ? 'transparent' : ColorPalette.gray2)};
  background: ${props => (props.collapsed ? 'transparent' : ColorPalette.white)};
  margin: 10px auto;
  padding: 12px;
  padding-right: 20px;
  position: relative;
  overflow: ${props => (props.overflow ? props.overflow : 'hidden')};
  position: relative;
`;

const BlockActionButton = styled.div`
  float: right;
  cursor: pointer;
  margin-top: -3px;
  margin-right: -8px;
`;

const ItemBlockCaption = styled.div`
  font-weight: ${Typography.weight.bold};
  margin-bottom: 15px;
`;

const ItemBlockContent = styled(withoutProps(['collapsed'])('div'))<{collapsed: boolean}>`
  font-size: ${Typography.size.smaller};
  display: ${props => (props.collapsed ? 'none' : 'block')};
`;

class ReferenceBarItem extends React.PureComponent<IProps, IState> {
  public state: IState;
  private static iconSize = 16;

  constructor(props: IProps) {
    super(props);
    this.state = {collapsed: props.defaultCollapsed || false, overflow: props.overflow || 'hidden'};
  }

  private toggleCollapsed = () => {
    this.setState({collapsed: !this.state.collapsed});
  };

  private get collapseIconName() {
    return this.state.collapsed ? IconName.ArrowDown : IconName.ArrowUp;
  }

  public render() {
    const {loading} = this.props;
    const {collapsed, overflow} = this.state;

    return (
      <ItemBlock collapsed={collapsed} overflow={overflow}>
        {loading && <BlockLoading size={30} color={collapsed ? ColorPalette.gray1 : ColorPalette.white} />}
        {this.props.collapsable && (
          <BlockActionButton onClick={this.toggleCollapsed}>
            <Icon name={this.collapseIconName} size={ReferenceBarItem.iconSize} />
          </BlockActionButton>
        )}
        {this.props.hasMenu && (
          <BlockActionButton>
            <Icon name={IconName.MenuVertical} size={ReferenceBarItem.iconSize} />
          </BlockActionButton>
        )}
        <ItemBlockCaption>{this.props.caption}</ItemBlockCaption>
        <ItemBlockContent collapsed={this.state.collapsed}>{this.props.children}</ItemBlockContent>
      </ItemBlock>
    );
  }
}

export default ReferenceBarItem;
