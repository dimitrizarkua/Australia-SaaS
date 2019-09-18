import * as React from 'react';
import {IStaff, IUser} from 'src/models/IUser';
import {reduxForm, InjectedFormProps} from 'redux-form';
import {IRun} from 'src/models/IRun';
import {compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import OperationsService, {IConfigForStaffSearch} from 'src/services/OperationsService';
import SearchInput from 'src/components/SearchInput/SearchInput';
import {debounce, orderBy} from 'lodash';
import styled from 'styled-components';
import Assignee from 'src/components/Modal/Jobs/ModalJobTask/Assignee';
import {getUserNames} from 'src/utility/Helpers';

const AssigneesHolder = styled.div`
  margin-top: 30px;
`;

interface IInputProps {
  run: IRun;
  onSubmit: (data: IFormValues) => any;
}

export interface IFormValues {
  selectedUsers: IUser[];
}

interface IWithDataProps {
  searchStaff: IResource<IUser[]>;
}

interface IState {
  search: string;
  selectedUsers: IUser[];
}

export const RunSettingsStaffFormName = 'RunSettingsStaffForm';

type IProps = InjectedFormProps<IFormValues, IInputProps> & IInputProps & IWithDataProps;

class RunSettingsStaffForm extends React.PureComponent<IProps, IState> {
  public state = {
    search: '',
    selectedUsers: []
  };

  public componentDidMount() {
    const {run, change} = this.props;

    this.setState({
      selectedUsers: run.assigned_users || []
    });
    change('selectedUsers', run.assigned_users || []);
  }

  private debouncedSearch = debounce(this.props.searchStaff.fetch, 500);

  private onSearchValueChange = (search: string) => {
    const {run} = this.props;

    this.setState({search});

    if (search) {
      this.debouncedSearch({
        location_id: run.location_id,
        name: search,
        date: run.date
      } as IConfigForStaffSearch);
    } else {
      this.debouncedSearch.cancel();
    }
  };

  private isUserSelected = (id: number) => {
    const {selectedUsers} = this.state;

    return selectedUsers.map((el: IUser) => el.id).includes(id);
  };

  private onUserClick = (user: IUser) => {
    if (this.isUserSelected(user.id)) {
      this.setState({selectedUsers: this.state.selectedUsers.filter((el: IUser) => el.id !== user.id)});
    } else {
      this.setState({selectedUsers: (this.state.selectedUsers as any).concat(user)});
    }

    setTimeout(() => this.props.change('selectedUsers', this.state.selectedUsers));
  };

  private renderAssignee = (el: IUser) => (
    <Assignee
      key={`${el.id}-user`}
      onClick={() => this.onUserClick(el)}
      selected={this.isUserSelected(el.id)}
      assignee={el}
    >
      {!!(el as IStaff).working_hours_per_week &&
        (el as IStaff).date_hours >= (el as IStaff).working_hours_per_week! / 5 &&
        'Booked'}
    </Assignee>
  );

  private getOrderedAssignedStaff = () => {
    const {selectedUsers} = this.state;

    return orderBy(selectedUsers, [(user: IUser) => getUserNames(user).name], ['asc']);
  };

  private getOrderedSearchStaff = () => {
    const {data} = this.props.searchStaff;

    return orderBy(data || [], [(user: IUser) => getUserNames(user).name], ['asc']);
  };

  public render() {
    const {handleSubmit, searchStaff} = this.props;
    const {search} = this.state;

    return (
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6">
            <SearchInput
              loading={searchStaff.loading}
              placeholder="Search..."
              searchIcon={true}
              mode="typeGray"
              onSearchValueChange={this.onSearchValueChange}
            />
          </div>
        </div>
        <AssigneesHolder>
          {!search && this.getOrderedAssignedStaff().map((el: IUser) => this.renderAssignee(el))}
          {search && this.getOrderedSearchStaff().map((el: IUser) => this.renderAssignee(el))}
        </AssigneesHolder>
      </form>
    );
  }
}

export default compose<React.ComponentClass<IInputProps>>(
  reduxForm<IFormValues, IInputProps>({
    form: RunSettingsStaffFormName
  }),
  withData({
    searchStaff: {
      fetch: OperationsService.searchStaff
    }
  })
)(RunSettingsStaffForm);
