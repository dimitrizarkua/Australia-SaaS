import * as React from 'react';
import FullSidebarMenu from 'src/components/SidebarMenu/FullSidebarMenu';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import TabNav, {ITab} from 'src/components/TabNav/TabNav';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import OperationsJobsTabComponent from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/JobsTab/OperationsJobsTabComponent';
import {ILocation} from 'src/models/IAddress';
import {Moment} from 'moment';
import {compose} from 'redux';
import OperationsStaffTabComponent from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/StaffTab/OperationsStaffTabComponent';
import OperationsVehiclesTabComponent from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/VehiclesTab/OperationsVehiclesTabComponent';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import Cover from 'src/components/Layout/Common/Cover';
import {ITask} from 'src/models/ITask';

const TabsHolder = styled.div`
  padding: 0 26px;
  height: 45px;
  background: ${ColorPalette.white};
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

const Container = styled.div`
  width: 100%;
  position: relative;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
`;

interface IInputProps {
  locationArea: ILocation | null;
  date: Moment | null;
  ready: boolean;
  scheduledTasks: ITask[];
}

interface IParams {
  section: Tabs;
}

export enum Tabs {
  Jobs = 'jobs',
  Staff = 'staff',
  Vehicles = 'vehicles'
}

interface IState {
  activeTabId: Tabs;
  [Tabs.Jobs]: boolean;
  [Tabs.Staff]: boolean;
  [Tabs.Vehicles]: boolean;
}

class OperationsSidebarMenu extends React.PureComponent<RouteComponentProps<IParams> & IInputProps, IState> {
  private getTabNameFromUrl = () => {
    const {
      match: {
        params: {section}
      }
    } = this.props;

    return section.charAt(0).toUpperCase() + section.slice(1);
  };

  public state = {
    activeTabId: Tabs[this.getTabNameFromUrl()],
    [Tabs.Jobs]: false,
    [Tabs.Staff]: false,
    [Tabs.Vehicles]: false
  };

  public componentDidMount() {
    // @ts-ignore
    this.setState({[Tabs[this.getTabNameFromUrl()]]: true});
  }

  private getTabs = (context: IUserContext): ITab[] => [
    {
      name: 'Jobs',
      id: Tabs.Jobs,
      onClick: () => {
        this.props.history.push(`/operations/schedule/${Tabs.Jobs}`);
        this.setState({activeTabId: Tabs.Jobs, [Tabs.Jobs]: true});
      },
      disabled: !context.has(Permission.OPERATIONS_TASKS_VIEW)
    },
    {
      name: 'Staff',
      id: Tabs.Staff,
      onClick: () => {
        this.props.history.push(`/operations/schedule/${Tabs.Staff}`);
        this.setState({activeTabId: Tabs.Staff, [Tabs.Staff]: true});
      },
      disabled: !context.has(Permission.OPERATIONS_STAFF_VIEW)
    },
    {
      name: 'Vehicles',
      id: Tabs.Vehicles,
      onClick: () => {
        this.props.history.push(`/operations/schedule/${Tabs.Vehicles}`);
        this.setState({activeTabId: Tabs.Vehicles, [Tabs.Vehicles]: true});
      },
      disabled: !context.has(Permission.OPERATIONS_VEHICLES_VIEW)
    }
  ];

  public render() {
    const {activeTabId} = this.state;
    const {locationArea, date, ready, scheduledTasks} = this.props;

    return (
      <UserContext.Consumer>
        {context => (
          <FullSidebarMenu width={364} className="h-100" noExpand={true}>
            {!ready && <Cover color={ColorPalette.white} opacity={0.7} zIndex={100} />}
            <ReactTooltip className="overlapping" effect="solid" place="right" id="operations-sidebar-tooltip" />
            <TabsHolder>
              <TabNav selectedTabId={activeTabId} items={this.getTabs(context)} />
            </TabsHolder>
            <Container style={{display: activeTabId === Tabs.Jobs ? 'flex' : 'none'}}>
              {!context.has(Permission.OPERATIONS_TASKS_VIEW) && <Cover color={ColorPalette.gray1} />}
              {this.state[Tabs.Jobs] && (
                <OperationsJobsTabComponent locationArea={locationArea} date={date} scheduledTasks={scheduledTasks} />
              )}
            </Container>
            <Container style={{display: activeTabId === Tabs.Staff ? 'flex' : 'none'}}>
              {!context.has(Permission.OPERATIONS_STAFF_VIEW) && <Cover color={ColorPalette.gray1} />}
              {this.state[Tabs.Staff] && <OperationsStaffTabComponent locationArea={locationArea} date={date} />}
            </Container>
            <Container style={{display: activeTabId === Tabs.Vehicles ? 'flex' : 'none'}}>
              {!context.has(Permission.OPERATIONS_VEHICLES_VIEW) && <Cover color={ColorPalette.gray1} />}
              {this.state[Tabs.Vehicles] && <OperationsVehiclesTabComponent locationArea={locationArea} date={date} />}
            </Container>
          </FullSidebarMenu>
        )}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<IInputProps>>(withRouter)(OperationsSidebarMenu);
