import React from 'react';
import {IAppState} from 'src/redux';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {InnerHeadBlock} from 'src/components/Layout/Reports/InnerHeadBlock';
import moment, {Moment} from 'moment';
import ReportFilterDropdown from 'src/components/Layout/Reports/ReportFilterDropdown';
import {ILocation} from 'src/models/IAddress';
import ReactDatetime from 'react-datetime';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import ColorPalette from 'src/constants/ColorPalette';
import {IconName} from 'src/components/Icon/Icon';
import {FRONTEND_DATE} from 'src/constants/Date';

interface IProps {
  onSubmit: (data?: any) => void | any;
}

interface IState {
  dateSelected: Moment;
  locationSelected: ILocation | null;
}

interface IConnectProps {
  locations: ILocation[];
}

class TrialBalancePageFilter extends React.PureComponent<IProps & IConnectProps & IState> {
  public state: IState = {
    dateSelected: moment(),
    locationSelected: null
  };

  public componentDidUpdate() {
    const {dateSelected: dateToSelected, locationSelected} = this.state;

    const dataToSend = {
      dateTo: dateToSelected,
      location: locationSelected
    };
    this.props.onSubmit(dataToSend);
  }

  private locationNameRender(el: ILocation) {
    return el.name;
  }

  private onLocationChange = (el: ILocation) => {
    this.setState({locationSelected: el});
  };

  private dateTriggerRender = () => {
    const {dateSelected} = this.state;

    return (
      <div className="d-flex" style={{cursor: 'pointer'}}>
        {dateSelected.format(FRONTEND_DATE)}
        <ColoredIcon style={{marginLeft: '10px'}} color={ColorPalette.white} name={IconName.Calendar} />
      </div>
    );
  };

  private timePickerRender = () => (
    <>
      <ReactDatetime input={false} timeFormat={true} onChange={this.onDateChange} />
    </>
  );

  private onDateChange = (date: any) => {
    this.setState({dateSelected: date as Moment});
  };

  public render() {
    const {locations} = this.props;
    const primaryLocation = locations.find(x => x.primary);

    return (
      <>
        <InnerHeadBlock>
          <DropdownMenuControl trigger={() => this.dateTriggerRender()} renderInternal={this.timePickerRender} />
        </InnerHeadBlock>
        <InnerHeadBlock>
          {!locations || (locations && locations.length === 0) ? (
            <div>No Locations</div>
          ) : (
            <ReportFilterDropdown
              items={locations}
              onChange={this.onLocationChange}
              placeHolder="Select Location..."
              nameRender={this.locationNameRender}
              defaultValueById={primaryLocation && primaryLocation.id}
            />
          )}
        </InnerHeadBlock>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  locations: state.user.locations
});

export default compose<React.ComponentClass<any>>(connect(mapStateToProps))(TrialBalancePageFilter);
