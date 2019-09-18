import * as React from 'react';
import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';
import moment from 'moment';
import ColorPalette from 'src/constants/ColorPalette';

const Block = styled(withoutProps(['height'])('div'))<{
  height: number;
}>`
  height: ${props => props.height}px;
  border-right: 1px solid ${ColorPalette.gray2};
  position: relative;
`;

const BlockHours = styled.div`
  position: absolute;
  right: 0px;
  top: 0px;
  padding-right: 15px;
  display: flex;
  align-items: center;
  color: ${ColorPalette.gray5};
  height: 0px;
`;

interface IProps {
  startHours: number;
  endHours: number;
  blockHeight: number;
}

interface IState {
  hours: number[];
}

class ScheduleCalendarScale extends React.PureComponent<IProps, IState> {
  public state = {
    hours: []
  };

  public componentDidMount() {
    const {startHours, endHours} = this.props;
    const hours = [];

    for (let i = startHours; i < endHours; i++) {
      hours.push(i);
    }

    this.setState({hours});
  }

  private blockRenderer = (hour: number) => {
    const {blockHeight, endHours} = this.props;

    return (
      <Block height={blockHeight} key={hour}>
        <BlockHours>
          {moment()
            .hours(hour)
            .format('ha')}
        </BlockHours>
        {hour + 1 === endHours && (
          <BlockHours style={{bottom: '0', top: 'unset'}}>
            {moment()
              .hours(endHours)
              .format('ha')}
          </BlockHours>
        )}
      </Block>
    );
  };

  public render() {
    return <div className="w-100">{this.state.hours.map((hour: number) => this.blockRenderer(hour))}</div>;
  }
}

export default ScheduleCalendarScale;
