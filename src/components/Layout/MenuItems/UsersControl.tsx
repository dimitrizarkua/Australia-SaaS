import * as React from 'react';
import Icon, {IconName} from 'src/components/Icon/Icon';
import Dropdown, {IMenuProps, ITriggerProps} from 'src/components/Dropdown/Dropdown';
import TeamService from 'src/services/TeamService';
import {ActionIcon} from '../PageMenu';
import SearchInput from 'src/components/SearchInput/SearchInput';
import styled from 'styled-components';
import {debounce} from 'lodash';
import {IUsersTeams, IUserTeamSimple} from 'src/models/ITeam';
import ColorPalette from 'src/constants/ColorPalette';
import UserOrTeam from 'src/components/Layout/MenuItems/UserOrTeam';
import {orderBy} from 'lodash';
import Notify, {NotifyType} from 'src/utility/Notify';

const UsersMenu = styled.div`
  width: 265px;
  position: relative;
`;

const Wrapper = styled.div`
  margin-top: 10px;
`;

interface IState {
  usersTeams: IUsersTeams;
  isLoading: boolean;
  isTouched: boolean;
}

interface IItemStructure {
  item: IUserTeamSimple;
  assigned: boolean;
}

const NoFound = styled.span`
  color: ${ColorPalette.gray3};
`;

interface IProps {
  onUserTeamClick: (user: IUserTeamSimple) => any;
  onSelectedUserTeamClick: (user: IUserTeamSimple) => any;
  selectedUsersTeams: IUserTeamSimple[];
  loading?: boolean;
  disabled?: boolean;
}

const initialUsersTeamsState: IUsersTeams = {
  users: [],
  teams: []
};

class UsersControl extends React.PureComponent<IProps, IState> {
  public state: IState = {
    usersTeams: initialUsersTeamsState,
    isLoading: false,
    isTouched: false
  };

  public componentWillUnmount() {
    if (this.activeRequest) {
      this.activeRequest.abort();
    }
  }

  private activeRequest: AbortController | undefined;
  private handleSearch = (searchStr: string) => {
    if (this.activeRequest) {
      this.activeRequest.abort();
    }

    if (searchStr) {
      const {promise, controller} = TeamService.searchTeamUserWC(searchStr);
      this.activeRequest = controller;
      this.setState({isLoading: true});
      promise
        .then(res => this.setState({isLoading: false, usersTeams: res, isTouched: true}))
        .catch(e => {
          if (e.name === 'AbortError') {
            return;
          }

          this.setState({isLoading: false, usersTeams: initialUsersTeamsState});
          Notify(NotifyType.Warning, 'Search failed');
        });
    } else {
      this.setState({usersTeams: initialUsersTeamsState, isTouched: false, isLoading: false});
    }
  };

  private debouncedSearch = debounce(this.handleSearch, 500);

  private renderIconTrigger = (props: ITriggerProps) => {
    const {disabled} = this.props;
    return (
      <ActionIcon
        data-tip="Assign to"
        data-for="job-menu-tooltip"
        onClick={disabled ? () => null : props.toggle}
        disabled={disabled}
      >
        <Icon name={IconName.EditPerson} />
      </ActionIcon>
    );
  };

  private selectUserOrTeam = async (item: IUserTeamSimple, menuProps: IMenuProps) => {
    await this.props.onUserTeamClick(item);
    menuProps.close();
  };

  private deselectUserOrTeam = async (item: IUserTeamSimple, menuProps: IMenuProps) => {
    await this.props.onSelectedUserTeamClick(item);
    menuProps.close();
  };

  private renderUsersMenu = (menuProps: IMenuProps) => {
    const {usersTeams: data, isLoading, isTouched} = this.state;
    const {selectedUsersTeams} = this.props;

    const usersTeams: IItemStructure[] = data
      ? data.users
          .concat(data.teams)
          .filter(el => {
            return !selectedUsersTeams.some(selected => el.id === selected.id && el.type === selected.type);
          })
          .map(el => ({
            item: el,
            assigned: false
          }))
      : [];
    const assignedItems: IItemStructure[] = selectedUsersTeams.map(el => ({
      item: el,
      assigned: true
    }));
    const sortedList = orderBy(usersTeams.concat(assignedItems), [(el: IItemStructure) => el.item.name], ['asc']);

    return (
      <UsersMenu>
        <div className="px-2">
          <SearchInput loading={isLoading} onSearchValueChange={this.debouncedSearch} placeholder="Search..." />
        </div>
        {usersTeams.length === 0 && isTouched && !isLoading && (
          <Wrapper>
            <NoFound className="px-2">No users or teams found</NoFound>
          </Wrapper>
        )}
        {sortedList.length > 0 && (
          <Wrapper>
            {sortedList.map((el: IItemStructure) => (
              <UserOrTeam
                key={`${el.item.id}-${el.item.type}`}
                name={el.item.name}
                bold={el.assigned}
                locationCode={el.item.primary_location && el.item.primary_location.code}
                onItemClick={
                  el.assigned
                    ? () => this.deselectUserOrTeam(el.item, menuProps)
                    : () => this.selectUserOrTeam(el.item, menuProps)
                }
              />
            ))}
          </Wrapper>
        )}
      </UsersMenu>
    );
  };

  public render() {
    return <Dropdown trigger={this.renderIconTrigger} menu={this.renderUsersMenu} />;
  }
}

export default UsersControl;
