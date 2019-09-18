import * as React from 'react';
import styled from 'styled-components';
import moment, {Moment} from 'moment';
import ReactDatetime from 'react-datetime';
import ColorPalette from 'src/constants/ColorPalette';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import DropdownMenuControl from '../MenuItems/DropdownMenuControl';
import {IMenuProps} from 'src/components/Dropdown/Dropdown';
import {FRONTEND_DATE} from 'src/constants/Date';

const ControlContainer = styled.div`
  width: 400px;
  padding: 3px;
  .dash {
    padding: 0 10px;
  }
  label {
    margin-bottom: 0;
  }
`;

const TriggerContainer = styled.div`
  display: flex;
  line-height: 50px;
  width: 180px;
  cursor: pointer;
  color: ${ColorPalette.white};
`;

interface IDatesPair {
  start: Moment;
  end: Moment;
}

export interface IPeriods {
  current: IDatesPair;
  previous: IDatesPair;
}

interface IProps {
  defaultPeriods: IPeriods;
  onChange: (data: IPeriods) => any | void;
}

class ReportTwoPeriodsFilter extends React.PureComponent<IProps> {
  private periods: IPeriods = this.props.defaultPeriods;

  private onChangeDate = (
    date: string | Moment,
    currentOrPrevious: 'current' | 'previous',
    startOrEnd: 'start' | 'end'
  ) => {
    this.periods = {
      ...this.periods,
      [currentOrPrevious]: {
        ...this.periods[currentOrPrevious],
        [startOrEnd]: date
      }
    };
    if (this.isPeriodValid(this.periods.current) && this.isPeriodValid(this.periods.previous)) {
      this.props.onChange(this.periods);
    }
  };

  private isPeriodValid(period: IDatesPair) {
    return moment(period.end).diff(period.start, 'd') > 0;
  }

  private startTriggerRender = () => {
    return (
      <TriggerContainer>
        {this.periods.current.start.format(FRONTEND_DATE)} - {this.periods.current.end.format(FRONTEND_DATE)}
      </TriggerContainer>
    );
  };

  private renderControl = (props: IMenuProps) => (
    <ControlContainer>
      <div className="d-flex align-items-baseline">
        <div className="col-4 pr-0">
          <label>Current:</label>
        </div>
        <div className="col-8 pl-0  d-flex align-items-baseline">
          <ReactDatetime
            input={true}
            timeFormat={false}
            dateFormat={FRONTEND_DATE}
            closeOnSelect={true}
            onChange={date => this.onChangeDate(date, 'current', 'start')}
            defaultValue={this.props.defaultPeriods.current.start}
          />
          <span className="dash">–</span>
          <ReactDatetime
            input={true}
            timeFormat={false}
            dateFormat={FRONTEND_DATE}
            closeOnSelect={true}
            onChange={date => this.onChangeDate(date, 'current', 'end')}
            defaultValue={this.props.defaultPeriods.current.end}
          />
        </div>
      </div>
      <div className="d-flex align-items-baseline pt-3">
        <div className="col-4 pr-0">
          <label>Previous period:</label>
        </div>
        <div className="col-8 pl-0 d-flex align-items-baseline">
          <ReactDatetime
            input={true}
            timeFormat={false}
            dateFormat={FRONTEND_DATE}
            closeOnSelect={true}
            onChange={date => this.onChangeDate(date, 'previous', 'start')}
            defaultValue={this.props.defaultPeriods.previous.start}
          />
          <span className="dash">–</span>
          <ReactDatetime
            input={true}
            timeFormat={false}
            dateFormat={FRONTEND_DATE}
            closeOnSelect={true}
            onChange={date => this.onChangeDate(date, 'previous', 'end')}
            defaultValue={this.props.defaultPeriods.previous.end}
          />
        </div>
      </div>
    </ControlContainer>
  );

  public render() {
    return (
      <>
        <div className="d-flex">
          <DropdownMenuControl
            renderInternal={this.renderControl}
            trigger={this.startTriggerRender}
            direction="right"
          />
          <ColoredIcon
            style={{marginTop: '13px', marginRight: '15px'}}
            color={ColorPalette.white}
            name={IconName.Calendar}
          />
        </div>
      </>
    );
  }
}

export default ReportTwoPeriodsFilter;
