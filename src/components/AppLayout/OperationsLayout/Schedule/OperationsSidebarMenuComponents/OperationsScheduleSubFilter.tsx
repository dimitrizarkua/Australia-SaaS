import React, {ReactElement} from 'react';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import ColorPalette from 'src/constants/ColorPalette';
import {IconName} from 'src/components/Icon/Icon';
import styled from 'styled-components';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import ColoredIcon from 'src/components/Icon/ColoredIcon';

const SortTrigger = styled(ColoredDiv)`
  cursor: pointer;
`;

interface IOwnProps {
  items: IMenuItem[];
  selectedName: ReactElement<unknown> | string;
}

class OperationsScheduleSubFilter extends React.PureComponent<IOwnProps> {
  private renderTrigger = () => {
    const {selectedName} = this.props;

    return (
      <SortTrigger className="d-flex align-items-center" margin="5px 0 0 0">
        <ColoredDiv color={ColorPalette.gray4} margin="0 5px 0 0">
          {selectedName}
        </ColoredDiv>
        <ColoredIcon name={IconName.ArrowDown} color={ColorPalette.gray4} size={16} />
      </SortTrigger>
    );
  };

  public render() {
    const {items} = this.props;

    return <DropdownMenuControl items={items} noMargin={true} direction="right" trigger={this.renderTrigger} />;
  }
}

export default OperationsScheduleSubFilter;
