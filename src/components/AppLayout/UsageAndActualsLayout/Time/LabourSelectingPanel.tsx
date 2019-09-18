import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {ActionIcon} from 'src/components/Layout/PageMenu';
import Icon, {IconName} from 'src/components/Icon/Icon';
import ReactTooltip from 'react-tooltip';
import Typography from 'src/constants/Typography';

const SelectingPanel = styled.div<{hidden: boolean}>`
  border-radius: 5px;
  background: ${ColorPalette.menu};
  height: 45px;
  width: 200px;
  position: absolute;
  top: 10px;
  left: 50%;
  margin-left: -100px;
  display: ${props => (props.hidden ? 'none' : 'flex')} !important;
`;

const SelectingLabel = styled.div`
  padding-left: 20px;
  color: ${ColorPalette.white};
  font-weight: ${Typography.weight.bold};
`;

interface IProps {
  hidden: boolean;
  selected: number;
  onDeleteSelected: () => void;
  onEditSelected: () => void;
}

class LabourSelectingPanel extends React.PureComponent<IProps> {
  public render() {
    const {selected, hidden, onDeleteSelected, onEditSelected} = this.props;
    return (
      <SelectingPanel className="d-flex flex-row align-content-center" hidden={hidden}>
        <ReactTooltip className="overlapping" id="delete-all-tooltip" effect="solid" />
        <ReactTooltip className="overlapping" id="edit-all-tooltip" effect="solid" />

        <SelectingLabel className="mr-auto align-self-center">{selected} selected </SelectingLabel>

        <ActionIcon
          className="align-self-center"
          data-tip="Edit selected Labour records"
          data-for="edit-all-tooltip"
          color={ColorPalette.gray4}
          disabled={selected === 0}
        >
          <Icon name={IconName.Pencil} onClick={onEditSelected} />
        </ActionIcon>

        <ActionIcon
          className="align-self-center"
          data-tip="Delete selected Labour records"
          data-for="delete-all-tooltip"
          color={ColorPalette.gray4}
          disabled={selected === 0}
        >
          <Icon name={IconName.Trash} onClick={onDeleteSelected} />
        </ActionIcon>
      </SelectingPanel>
    );
  }
}

export default LabourSelectingPanel;
