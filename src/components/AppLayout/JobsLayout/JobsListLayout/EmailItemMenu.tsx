import * as React from 'react';
import styled from 'styled-components';
import Icon, {IconName} from 'src/components/Icon/Icon';
import ColorPalette from 'src/constants/ColorPalette';
import withoutProps from 'src/components/withoutProps/withoutProps';

const IconsArea = styled.div`
  width: 2%;
  position: relative;
  cursor: pointer;
  path,
  circle {
    stroke: ${ColorPalette.black0};
    fill: ${ColorPalette.white};
  }

  background: inherit;
  margin-left: auto;
`;

// -2px because of outer block border.
const FullIconsArea = styled.div`
  position: absolute;
  right: 0px;
  top: -2px;
  width: 800%;
  height: 3rem;
  background: ${ColorPalette.white};
  cursor: pointer;
  padding-left: 300%;
  path,
  circle {
    stroke: ${ColorPalette.black0};
    fill: ${ColorPalette.white};
  }

  background: inherit;
`;

export const PinIcon = styled(withoutProps(['pinned_at'])(Icon))<{pinned_at: boolean}>`
  path,
  circle {
    stroke: ${props => (props.pinned_at ? ColorPalette.blue4 : ColorPalette.black0)};
    fill: ${props => (props.pinned_at ? ColorPalette.blue4 : ColorPalette.white)};
  }
`;

interface IProps {
  pinned_at?: boolean;
  expanded?: boolean;
}

class EmailItemMenu extends React.PureComponent<IProps> {
  public state = {showFull: false};

  private showMenu = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.nativeEvent.preventDefault();
    this.setState({showFull: true});
  };
  private closeMenu = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.nativeEvent.preventDefault();
    this.setState({showFull: false});
  };

  public render() {
    const {pinned_at} = this.props;
    if (this.state.showFull || this.props.expanded) {
      return (
        <IconsArea>
          <FullIconsArea className="d-flex flex-row justify-content-between">
            <PinIcon name={IconName.Pin} pinned_at={!!pinned_at} />
            <Icon name={IconName.Add} />
            <div onClick={this.closeMenu}>
              <Icon name={IconName.MenuVertical} />
            </div>
          </FullIconsArea>
        </IconsArea>
      );
    } else {
      return (
        <IconsArea onClick={this.showMenu} className="d-flex flex-row justify-content-end">
          {!pinned_at && <Icon name={IconName.MenuVertical} />}
          {pinned_at && <PinIcon name={IconName.Pin} pinned_at={!!pinned_at} />}
        </IconsArea>
      );
    }
  }
}

export default EmailItemMenu;
