import * as React from 'react';
import DropdownMenuControl from '../MenuItems/DropdownMenuControl';
import ColorPalette from 'src/constants/ColorPalette';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import moment, {Moment} from 'moment';
import ReactDatetime from 'react-datetime';
import {IMenuProps} from 'src/components/Dropdown/Dropdown';
import {FRONTEND_DATE} from 'src/constants/Date';

export interface IDatePeriodResponse {
  startDate: Moment;
  endDate: Moment;
}

interface IState {
  startDate: Moment;
  endDate: Moment;
}

interface IProps {
  defaultStartDate?: Moment;
  defaultEndDate?: Moment;
  onChange: (data: IDatePeriodResponse) => void | any;
}

class ReportFilterDatePeriod extends React.PureComponent<IProps, IState> {
  public state: IState = {
    startDate: this.props.defaultStartDate ? this.props.defaultStartDate : moment(),
    endDate: this.props.defaultEndDate ? this.props.defaultEndDate : moment()
  };

  public componentDidMount() {
    if (this.props.defaultEndDate || this.props.defaultStartDate) {
      const {startDate, endDate} = this.state;
      this.onChange({startDate, endDate});
    }
  }

  private onStartDateChange = (date: any, props: IMenuProps) => {
    const {endDate} = this.state;
    const startDate = date as Moment;

    this.setState({startDate});
    this.onChange({startDate, endDate});

    props.close();
  };

  private onEndDateChange = (date: any, props: IMenuProps) => {
    const {startDate} = this.state;
    const endDate = date as Moment;

    this.setState({endDate});
    this.onChange({startDate, endDate});

    props.close();
  };

  private onChange(date: IDatePeriodResponse) {
    this.props.onChange({startDate: date.startDate, endDate: date.endDate});
  }

  private startTriggerRender = () => {
    const {startDate} = this.state;

    return (
      <div className="d-flex" style={{cursor: 'pointer'}}>
        {startDate.format(FRONTEND_DATE)} - &nbsp;
      </div>
    );
  };

  private endTriggerRender = () => {
    const {endDate} = this.state;

    return (
      <div className="d-flex" style={{cursor: 'pointer'}}>
        {endDate.format(FRONTEND_DATE)}
      </div>
    );
  };

  private startPickerRender = (props: IMenuProps) => (
    <div>
      <ReactDatetime
        input={false}
        timeFormat={false}
        onChange={date => this.onStartDateChange(date, props)}
        defaultValue={this.props.defaultStartDate}
      />
    </div>
  );

  private endPickerRender = (props: IMenuProps) => (
    <div>
      <ReactDatetime
        input={false}
        timeFormat={false}
        onChange={date => this.onEndDateChange(date, props)}
        defaultValue={this.props.defaultEndDate}
      />
    </div>
  );

  public render() {
    return (
      <>
        <div className="d-flex">
          <DropdownMenuControl renderInternal={this.startPickerRender} trigger={() => this.startTriggerRender()} />
          <DropdownMenuControl renderInternal={this.endPickerRender} trigger={() => this.endTriggerRender()} />
          <ColoredIcon style={{marginLeft: '20px'}} color={ColorPalette.white} name={IconName.Calendar} />
        </div>
      </>
    );
  }
}

export default ReportFilterDatePeriod;
