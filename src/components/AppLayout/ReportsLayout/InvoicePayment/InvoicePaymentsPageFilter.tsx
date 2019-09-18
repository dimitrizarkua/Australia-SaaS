import React from 'react';
import {IAppState} from 'src/redux';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {InnerHeadBlock} from 'src/components/Layout/Reports/InnerHeadBlock';
import moment, {Moment} from 'moment';
import ReportFilterDropdown from 'src/components/Layout/Reports/ReportFilterDropdown';
import ReportFilterDatePeriod, {IDatePeriodResponse} from 'src/components/Layout/Reports/ReportFilterDatePeriod';
import {ILocation} from 'src/models/IAddress';

interface IProps {
  onSubmit: (data?: any) => void | any;
}

interface IState {
  dateFromSelected: Moment;
  dateToSelected: Moment;
  locationSelected: ILocation | null;
}

interface IConnectProps {
  locations: ILocation[];
}

class InvoicePaymentsPageFilter extends React.PureComponent<IProps & IConnectProps & IState> {
  public state: IState = {
    dateFromSelected: moment(),
    dateToSelected: moment(),
    locationSelected: null
  };

  public componentDidUpdate() {
    const {dateFromSelected, dateToSelected, locationSelected} = this.state;

    const dataToSend = {
      dateFrom: dateFromSelected,
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

  private onDateChange = (date: IDatePeriodResponse) => {
    this.setState({dateFromSelected: date.startDate, dateToSelected: date.endDate});
  };

  public render() {
    const {locations} = this.props;
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    const primaryLocation = locations.find(x => x.primary);

    return (
      <>
        <InnerHeadBlock>
          <ReportFilterDatePeriod
            onChange={this.onDateChange}
            defaultStartDate={startOfMonth}
            defaultEndDate={endOfMonth}
          />
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

export default compose<React.ComponentClass<any>>(connect(mapStateToProps))(InvoicePaymentsPageFilter);
