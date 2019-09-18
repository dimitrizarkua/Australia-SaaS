import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {ITeamSimple} from 'src/models/ITeam';
import {IUser} from 'src/models/IUser';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';

interface IProps {
  assignee: IUser | ITeamSimple;
  selected: boolean;
  isTeam?: boolean;
  onClick?: (item: any) => void;
}

export const Wrapper = styled(withoutProps(['selected'])('div'))<{selected?: boolean}>`
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: ${ColorPalette.gray2};
  padding: 0px 10px;
  min-height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => (props.selected ? ColorPalette.blue0 : ColorPalette.white)};

  &:last-child {
    border-width: 1px 1px 1px 1px;
  }
`;

class Assignee extends React.PureComponent<IProps> {
  public render() {
    const {assignee, selected, isTeam, onClick, children} = this.props;

    return (
      <Wrapper selected={selected} onClick={onClick}>
        <div>{(assignee as IUser).full_name || (assignee as ITeamSimple).name}</div>
        <div className="d-flex align-items-center">
          <ColoredDiv color={ColorPalette.gray5}>{isTeam && 'Team'}</ColoredDiv>
          <ColoredDiv color={ColorPalette.gray4} margin="0 0 0 15px">
            {children}
          </ColoredDiv>
        </div>
      </Wrapper>
    );
  }
}

export default Assignee;
