import React from 'react';
import styled, {css} from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import moment, {Moment} from 'moment';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import {IMenuProps} from 'src/components/Dropdown/Dropdown';
import ReactDatetime from 'react-datetime';
import {ILocation} from 'src/models/IAddress';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {IRun} from 'src/models/IRun';
import printJS from 'print-js';

export const headerHeight = 50;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${headerHeight}px;
  flex-shrink: 0;
  background: ${ColorPalette.blue6};
  color: ${ColorPalette.white};
`;

const InnerHeadBlock = styled.div`
  height: 100%;
  display: flex;
`;

const ContentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0 25px;
  border-right: 1px solid ${ColorPalette.white};
  height: 100%;
  position: relative;

  :last-child {
    border-right: 0;
  }
`;

const DateChangeArrow = styled(ColoredIcon)`
  cursor: pointer;
`;

interface IProps {
  title: string;
  onDateChange?: (date: Moment) => any;
  locations: ILocation[];
  locationsLoading: boolean;
  onLocationChange?: (location: ILocation) => any;
  onMapIconClick: () => any;
  showMap: boolean;
  runs: IRun[];
}

interface IState {
  date: Moment;
  location: ILocation | null;
}

const printCss = css`
  .schedule-print-divider {
    margin: 20px 0;
    width: 100%;
    border-top: 1px solid gainsboro;
  }

  .schedule-print-divider:last-of-type {
    display: none;
  }

  .schedule-print-table .task-note {
    color: gray;
    font-style: italic;
    margin-top: 3px;
  }
`;

class HeaderPanel extends React.PureComponent<IProps, IState> {
  public state = {
    date: moment(),
    location: null
  };

  public componentDidMount() {
    this.initLocation();

    this.onDateChange(moment());
  }

  public componentDidUpdate(prevProps: IProps) {
    const {locations} = this.props;

    if (prevProps.locations.length === 0 && locations.length) {
      this.initLocation();
    }
  }

  private initLocation = () => {
    const {locations} = this.props;

    if (locations.length) {
      this.onLocationChange(this.findPrimaryLocation() || locations[0]);
    }
  };

  private findPrimaryLocation = (): ILocation | undefined => {
    const {locations} = this.props;

    return locations.find((l: ILocation) => l.primary);
  };

  private dateTriggerRender = () => {
    const {date} = this.state;

    return (
      <div className="d-flex" style={{cursor: 'pointer'}}>
        {date.format('D MMMM YYYY')}
        <ColoredIcon style={{marginLeft: '10px'}} color={ColorPalette.white} name={IconName.Calendar} />
      </div>
    );
  };

  private timePickerRender = (menuProps: IMenuProps) => (
    <>
      <ReactDatetime input={false} timeFormat={false} onChange={this.onDateChange} />
    </>
  );

  private onDateChange = (date: any) => {
    const {onDateChange} = this.props;

    if (onDateChange) {
      onDateChange(date as Moment);
    }

    this.setState({date: date as Moment});
  };

  private locationsTriggerRender = () => {
    const {location} = this.state;

    return (
      <div style={{cursor: 'pointer'}}>
        {(location || ({} as any)).name}
        <ColoredIcon style={{marginLeft: '20px'}} color={ColorPalette.white} name={IconName.ArrowDown} />
      </div>
    );
  };

  private locationsItems = () => {
    const {locations} = this.props;
    const {location} = this.state;

    return locations.map((el: ILocation) => ({
      name: el.name,
      classNames: el.id === ((location || {}) as ILocation).id ? 'active' : '',
      onClick: () => this.onLocationChange(el)
    }));
  };

  private onLocationChange = (el: ILocation) => {
    const {onLocationChange} = this.props;

    if (onLocationChange) {
      onLocationChange(el);
    }

    this.setState({location: el});
  };

  private prevDate = () => {
    const {date} = this.state;
    const prevDate = moment(date).subtract(1, 'd');
    const {onDateChange} = this.props;

    if (onDateChange) {
      onDateChange(prevDate);
    }

    this.setState({date: prevDate});
  };

  private nextDate = () => {
    const {date} = this.state;
    const nextDate = moment(date).add(1, 'd');
    const {onDateChange} = this.props;

    if (onDateChange) {
      onDateChange(nextDate);
    }

    this.setState({date: nextDate});
  };

  private print = () => {
    const {runs} = this.props;
    const {date, location} = this.state;

    if (runs.length && date && location) {
      printJS({printable: 'print-runs', type: 'html', style: printCss.toString()});
    }
  };

  public render() {
    const {title, locationsLoading, locations, onMapIconClick, showMap, runs} = this.props;
    const {location} = this.state;

    return (
      <Head>
        <InnerHeadBlock>
          <ContentItem>{title}</ContentItem>
        </InnerHeadBlock>
        <InnerHeadBlock>
          <ContentItem>
            <DropdownMenuControl trigger={() => this.dateTriggerRender()} renderInternal={this.timePickerRender} />
            <DateChangeArrow
              onClick={this.prevDate}
              style={{marginLeft: '30px'}}
              color={ColorPalette.white}
              name={IconName.ArrowLeft}
            />
            <DateChangeArrow
              onClick={this.nextDate}
              style={{transform: 'rotateZ(180deg)', marginLeft: '10px'}}
              color={ColorPalette.white}
              name={IconName.ArrowLeft}
            />
          </ContentItem>
          <ContentItem>
            {locationsLoading && <BlockLoading size={30} color={ColorPalette.blue6} />}
            {!locations || (locations && locations.length === 0) ? (
              <div>No locations</div>
            ) : (
              <DropdownMenuControl trigger={() => this.locationsTriggerRender()} items={this.locationsItems()} />
            )}
          </ContentItem>
          <ContentItem>
            <ColoredIcon
              style={{cursor: 'pointer', opacity: !!location ? 1 : 0.5}}
              color={ColorPalette.white}
              onClick={onMapIconClick}
              name={showMap ? IconName.LayoutBullets : IconName.LocationPin}
            />
          </ContentItem>
          <ContentItem>
            <ColoredIcon
              style={{cursor: 'pointer', opacity: runs.length > 0 ? 1 : 0.5}}
              color={ColorPalette.white}
              name={IconName.Printer}
              onClick={this.print}
            />
          </ContentItem>
        </InnerHeadBlock>
      </Head>
    );
  }
}

export default HeaderPanel;
