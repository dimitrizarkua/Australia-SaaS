import * as React from 'react';
import SearchInput from 'src/components/SearchInput/SearchInput';
import {ITask} from 'src/models/ITask';
import styled from 'styled-components';
import Assignee from 'src/components/Modal/Jobs/ModalJobTask/Assignee';
import {IStaff, IUser} from 'src/models/IUser';
import withData, {IResource} from 'src/components/withData/withData';
import TeamService from 'src/services/TeamService';
import {ITeamSimple, IUsersTeams, IUserTeamSimple} from 'src/models/ITeam';
import {debounce, orderBy} from 'lodash';
import {compose} from 'redux';
import {InjectedFormProps, reduxForm} from 'redux-form';
import OperationsService, {IConfigForStaffSearch} from 'src/services/OperationsService';

interface IProps {
  locationId?: number;
  date?: string;
  item?: ITask;
  onSubmit: (data: IFormValues) => any;
}

interface IWithDataProps {
  searchStaff: IResource<IUser[]>;
  usersTeams: IResource<IUsersTeams>;
}

export interface IFormValues {
  selectedUsers: IUser[];
  selectedTeams: ITeamSimple[];
}

interface IState {
  search: string;
  selectedUsers: IUser[];
  selectedTeams: ITeamSimple[];
}

export const JobTaskAssignedToFormName = 'JobTaskAssignToForm';

const AssigneesHolder = styled.div`
  margin-top: 30px;
`;

class JobTaskAssignedToForm extends React.PureComponent<
  InjectedFormProps<IFormValues, IProps> & IProps & IWithDataProps,
  IState
> {
  public state = {
    search: '',
    selectedUsers: [],
    selectedTeams: []
  };

  public componentDidMount() {
    const {item, change} = this.props;

    if (item) {
      this.setState({
        selectedUsers: item.assigned_users,
        selectedTeams: item.assigned_teams || []
      });
      change('selectedUsers', item.assigned_users);
      change('selectedTeams', item.assigned_teams || []);
    }
  }

  private onSearchValueChange = (search: string) => {
    this.setState({search});

    if (search) {
      this.debouncedSearch(search);
    } else {
      this.debouncedSearch.cancel();
    }
  };

  private isUserSelected = (id: number) => {
    const {selectedUsers} = this.state;

    return selectedUsers.map((el: IUser) => el.id).includes(id);
  };

  private isTeamSelected = (id: number) => {
    const {selectedTeams} = this.state;

    return selectedTeams.map((el: ITeamSimple) => el.id).includes(id);
  };

  private loadUsersAndTeams = async (search: string) => {
    const {searchStaff, usersTeams, locationId, date} = this.props;

    try {
      await Promise.all([
        searchStaff.fetch({
          name: search,
          location_id: locationId,
          date
        } as IConfigForStaffSearch),
        usersTeams.fetch(search)
      ]);
    } catch (e) {
      //
    }
  };

  private debouncedSearch = debounce(this.loadUsersAndTeams, 500);

  private onUserClick = (user: IUser | IUserTeamSimple) => {
    if (this.isUserSelected(user.id)) {
      this.setState({selectedUsers: this.state.selectedUsers.filter((el: IUser) => el.id !== user.id)});
    } else {
      this.setState({selectedUsers: (this.state.selectedUsers as any).concat(user)});
    }

    setTimeout(() => this.props.change('selectedUsers', this.state.selectedUsers));
  };

  private onTeamClick = (team: ITeamSimple | IUserTeamSimple) => {
    if (this.isTeamSelected(team.id)) {
      this.setState({selectedTeams: this.state.selectedTeams.filter((el: IUser) => el.id !== team.id)});
    } else {
      this.setState({selectedTeams: (this.state.selectedTeams as any).concat(team)});
    }

    setTimeout(() => this.props.change('selectedTeams', this.state.selectedTeams));
  };

  private getAssignedUsersAndTeams = () => {
    const {selectedUsers, selectedTeams} = this.state;

    return (orderBy(selectedTeams, ['name'], ['asc']).map(el => Object.assign({isTeam: true}, el)) as any[]).concat(
      orderBy(selectedUsers, [(el: IUser & IUserTeamSimple) => el.name || el.full_name], ['asc']) as any[]
    );
  };

  private getSearchUsersAndTeams = () => {
    const {
      usersTeams: {data},
      searchStaff: {data: staffData}
    } = this.props;

    if (data) {
      return orderBy(data.teams, [(el: IUser & IUserTeamSimple) => el.name || el.full_name], ['asc'])
        .map(el => Object.assign({isTeam: true}, el))
        .concat(orderBy(staffData, [(el: IUser & IUserTeamSimple) => el.name || el.full_name], ['asc']) as any[]);
    }

    return [];
  };

  private renderAssignee = (el: any) => (
    <Assignee
      key={`${el.id}-${el.isTeam ? 'team' : 'user'}`}
      onClick={() => (el.isTeam ? this.onTeamClick(el) : this.onUserClick(el))}
      selected={el.isTeam ? this.isTeamSelected(el.id) : this.isUserSelected(el.id)}
      isTeam={el.isTeam}
      assignee={el}
    >
      {!el.isTeam &&
        (!!(el as IStaff).working_hours_per_week &&
          (el as IStaff).date_hours >= (el as IStaff).working_hours_per_week! / 5) &&
        'Booked'}
    </Assignee>
  );

  public render() {
    const {
      usersTeams: {loading},
      searchStaff: {loading: staffLoading},
      handleSubmit,
      locationId
    } = this.props;
    const {search} = this.state;

    return (
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6">
            <SearchInput
              loading={loading || staffLoading}
              placeholder="Search..."
              searchIcon={true}
              mode="typeGray"
              disabled={!locationId}
              onSearchValueChange={this.onSearchValueChange}
            />
          </div>
        </div>
        <AssigneesHolder>
          {!search && this.getAssignedUsersAndTeams().map(el => this.renderAssignee(el))}
          {search && this.getSearchUsersAndTeams().map(el => this.renderAssignee(el))}
        </AssigneesHolder>
      </form>
    );
  }
}

export default compose<React.ComponentClass<IProps>>(
  reduxForm<IFormValues, IProps>({
    form: JobTaskAssignedToFormName
  }),
  withData<IProps>({
    searchStaff: {
      fetch: OperationsService.searchStaff
    },
    usersTeams: {
      fetch: TeamService.searchTeamUser
    }
  })
)(JobTaskAssignedToForm);
