import * as React from 'react';
import {ILocation} from 'src/models/IAddress';
import {Moment} from 'moment';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import SearchInput from 'src/components/SearchInput/SearchInput';
import withData, {IResource} from 'src/components/withData/withData';
import OperationsService, {IConfigForStaffSearch} from 'src/services/OperationsService';
import {IStaff, IUserRole} from 'src/models/IUser';
import {debounce, orderBy} from 'lodash';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import OperationsDragStaffMember from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/StaffTab/OperationsDragStaffMember';
import St from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuStyleConfig';
import DateTransformer from 'src/transformers/DateTransformer';
import OperationsSidebarMenuSubTitle from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuSubTitle';
import {getUserNames} from 'src/utility/Helpers';
import OperationsScheduleSubFilter from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsScheduleSubFilter';
import {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {DefaultWeekHours} from 'src/constants/Operations';
import Cover from 'src/components/Layout/Common/Cover';
import ColorPalette from 'src/constants/ColorPalette';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {loadUserRoles} from 'src/redux/userRolesDucks';
import {IAppState} from 'src/redux';
import {IReturnType} from 'src/redux/reduxWrap';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

interface IInputProps {
  locationArea: ILocation | null;
  date: Moment | null;
}

interface IWithDataProps {
  getStaffList: IResource<IStaff[]>;
  searchStaff: IResource<IStaff[]>;
}

interface IConnectionProps {
  dispatch: ThunkDispatch<any, any, Action>;
  userRoles: IReturnType<IUserRole[]>;
}

interface IState {
  search: string;
  sortType: SortTypes;
  sortTypeByUserRole: string;
  sortTypeByUserRoleName: string;
}

enum SortTypes {
  HoursRemaining,
  HoursUsed,
  ByName,
  PrimaryLocation
}

const SortTypeNames: {[key: number]: string} = {
  [SortTypes.HoursRemaining]: 'Hours remaining',
  [SortTypes.HoursUsed]: 'Hours used',
  [SortTypes.ByName]: 'By name',
  [SortTypes.PrimaryLocation]: 'Primary location'
};

class OperationsStaffTabComponent extends React.PureComponent<IInputProps & IWithDataProps & IConnectionProps, IState> {
  public state = {
    search: '',
    sortType: SortTypes.HoursRemaining,
    sortTypeByUserRole: 'all',
    sortTypeByUserRoleName: 'All'
  };

  public componentDidMount() {
    const {dispatch, userRoles} = this.props;
    const crewRole = this.getCrewRole();

    dispatch(loadUserRoles());
    this.onSearchValueChange(this.state.search);

    if (userRoles.data && crewRole) {
      this.setState({sortTypeByUserRoleName: crewRole.display_name, sortTypeByUserRole: crewRole.name});
    }
  }

  public componentDidUpdate(prevProps: IInputProps & IConnectionProps) {
    const {locationArea, date, userRoles} = this.props;

    if (
      (locationArea && locationArea.id !== (prevProps.locationArea && prevProps.locationArea.id)) ||
      (date && date.unix() !== (prevProps.date && prevProps.date.unix()))
    ) {
      this.onSearchValueChange(this.state.search);
    }

    if (
      !!userRoles.data &&
      (!prevProps.userRoles.data || (prevProps.userRoles.data && !prevProps.userRoles.data.length))
    ) {
      const crewRole = this.getCrewRole();

      if (crewRole) {
        this.setState({sortTypeByUserRoleName: crewRole.display_name, sortTypeByUserRole: crewRole.name});
      }
    }
  }

  public componentWillUnmount() {
    this.eventListeners.forEach(el => el.stopListening());
  }

  private eventListeners = [
    EventBus.listen(EventBusEventName.StaffAssignedToTask, () => this.onSearchValueChange(this.state.search)),
    EventBus.listen(EventBusEventName.TaskWasUpdated, () => this.onSearchValueChange(this.state.search))
  ];

  private debouncedSearch = debounce(this.props.searchStaff.fetch, 1000);

  private debouncedFetchList = debounce(this.props.getStaffList.fetch, 1000);

  private onSearchValueChange = (search: string) => {
    const {locationArea, date} = this.props;

    this.setState({search});

    if (locationArea && date) {
      const conf = {
        location_id: locationArea.id,
        date: DateTransformer.dehydrateDate(date)
      };

      if (search) {
        this.debouncedFetchList.cancel();
        this.debouncedSearch({
          ...conf,
          name: search || ''
        } as IConfigForStaffSearch);
      } else {
        this.debouncedSearch.cancel();
        this.debouncedFetchList({
          ...conf
        } as IConfigForStaffSearch);
      }
    }
  };

  private sortItems = (): IMenuItem[] => {
    const {sortType} = this.state;

    return [
      {
        name: SortTypeNames[SortTypes.HoursRemaining],
        classNames: sortType === SortTypes.HoursRemaining ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.HoursRemaining})
      },
      {
        name: SortTypeNames[SortTypes.HoursUsed],
        classNames: sortType === SortTypes.HoursUsed ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.HoursUsed})
      },
      {
        name: SortTypeNames[SortTypes.ByName],
        classNames: sortType === SortTypes.ByName ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.ByName})
      },
      {
        name: SortTypeNames[SortTypes.PrimaryLocation],
        classNames: sortType === SortTypes.PrimaryLocation ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.PrimaryLocation})
      }
    ];
  };

  private userRolesItems = (): IMenuItem[] => {
    const {
      userRoles: {data}
    } = this.props;
    const {sortTypeByUserRole} = this.state;
    const allItem: IMenuItem = {
      name: 'All',
      classNames: sortTypeByUserRole === 'all' ? 'active' : '',
      onClick: () => {
        this.setState({sortTypeByUserRole: 'all', sortTypeByUserRoleName: 'All'});
      }
    };
    const roleItems: IMenuItem[] = data
      ? data.map((ur: IUserRole) => ({
          name: ur.display_name,
          classNames: sortTypeByUserRole === ur.name ? 'active' : '',
          onClick: () => {
            this.setState({sortTypeByUserRole: ur.name, sortTypeByUserRoleName: ur.display_name});
          }
        }))
      : [];

    return [
      ...((!data || (data && !data.length) ? [allItem] : [allItem, {type: 'divider'}]) as IMenuItem[]),
      ...roleItems
    ];
  };

  private getCrewRole = (): IUserRole | undefined => {
    const {
      userRoles: {data}
    } = this.props;

    return data ? data.find((ur: IUserRole) => ur.name.toLowerCase() === 'crew') : undefined;
  };

  private sortStaff = () => {
    const {
      searchStaff: {data: dataSearch},
      getStaffList: {data: dataList},
      locationArea
    } = this.props;
    const {sortType, search} = this.state;
    const data = search ? dataSearch : dataList;

    let canBeBooked: IStaff[] = [];
    let booked: IStaff[] = [];

    if (data) {
      data.forEach((staff: IStaff) => {
        if (staff.working_hours_per_week && staff.date_hours >= staff.working_hours_per_week! / 5) {
          booked.push(staff);
        } else {
          canBeBooked.push(staff);
        }
      });
    }

    if (sortType === SortTypes.PrimaryLocation) {
      canBeBooked = canBeBooked.filter((staff: IStaff) => staff.primary_location.id === locationArea!.id);
      booked = booked.filter((staff: IStaff) => staff.primary_location.id === locationArea!.id);
    }

    if ([SortTypes.HoursRemaining, SortTypes.PrimaryLocation].includes(sortType)) {
      canBeBooked = orderBy(
        canBeBooked,
        [(staff: IStaff) => (staff.working_hours_per_week || DefaultWeekHours) - staff.week_hours],
        ['desc']
      );
      booked = orderBy(
        booked,
        [(staff: IStaff) => (staff.working_hours_per_week || DefaultWeekHours) - staff.week_hours],
        ['desc']
      );
    }

    if (sortType === SortTypes.HoursUsed) {
      canBeBooked = orderBy(canBeBooked, ['week_hours'], ['desc']);
      booked = orderBy(booked, ['week_hours'], ['desc']);
    }

    if (sortType === SortTypes.ByName) {
      canBeBooked = orderBy(canBeBooked, [(staff: IStaff) => getUserNames(staff).name], ['asc']);
      booked = orderBy(booked, [(staff: IStaff) => getUserNames(staff).name], ['asc']);
    }

    return {
      canBeBooked: this.sortByUserRole(canBeBooked),
      booked: this.sortByUserRole(booked)
    };
  };

  private sortByUserRole = (staff: IStaff[]): IStaff[] => {
    const {sortTypeByUserRole} = this.state;

    return staff.filter((s: IStaff) =>
      sortTypeByUserRole === 'all'
        ? true
        : ((s.roles && s.roles.map((r: IUserRole) => r.name)) || []).includes(sortTypeByUserRole)
    );
  };

  public render() {
    const {
      searchStaff: {loading},
      getStaffList: {loading: loadingList},
      userRoles: {loading: urLoading}
    } = this.props;
    const {sortType, sortTypeByUserRoleName} = this.state;
    const sortedStaff = this.sortStaff();

    return (
      <>
        <ColoredDiv
          padding={`${St.paddingTop} ${St.paddingRight} ${St.menuPaddingBottom} ${St.paddingLeft}`}
          className="flex-shrink-0"
          overflow="visible"
        >
          <SearchInput
            loading={loading || loadingList}
            onSearchValueChange={this.onSearchValueChange}
            placeholder={'Search...'}
            disabled={!location}
          />
          <div className="d-flex justify-content-end">
            <div className="position-relative" style={{marginRight: '10px'}}>
              {urLoading && <BlockLoading size={14} color={ColorPalette.gray1} zIndex={2} />}
              <OperationsScheduleSubFilter items={this.userRolesItems()} selectedName={sortTypeByUserRoleName} />
            </div>
            <OperationsScheduleSubFilter items={this.sortItems()} selectedName={SortTypeNames[sortType]} />
          </div>
        </ColoredDiv>
        <ScrollableContainer className="d-flex flex-column flex-grow-1 position-relative">
          {loading && <Cover color={ColorPalette.gray1} zIndex={3} />}
          <ColoredDiv padding={`0 ${St.paddingRight} ${St.paddingBottom} ${St.paddingLeft}`} overflow="visible">
            {sortedStaff.canBeBooked.map((el: IStaff) => (
              <OperationsDragStaffMember key={el.id} staffMember={el} />
            ))}
            {sortedStaff.booked.length > 0 && <OperationsSidebarMenuSubTitle>Booked</OperationsSidebarMenuSubTitle>}
            {sortedStaff.booked.map((el: IStaff) => (
              <OperationsDragStaffMember key={el.id} staffMember={el} booked={true} />
            ))}
          </ColoredDiv>
        </ScrollableContainer>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userRoles: state.userRoles
});

export default compose<React.ComponentClass<IInputProps>>(
  connect(mapStateToProps),
  withData<IInputProps>({
    getStaffList: {
      fetch: OperationsService.getStaffList
    },
    searchStaff: {
      fetch: OperationsService.searchStaff
    }
  })
)(OperationsStaffTabComponent);
