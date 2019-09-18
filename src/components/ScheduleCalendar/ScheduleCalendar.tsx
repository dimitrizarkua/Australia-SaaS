import * as React from 'react';
import styled from 'styled-components';
import ScheduleCalendarScale from 'src/components/ScheduleCalendar/ScheduleCalendarScale';
import ColorPalette from 'src/constants/ColorPalette';
import ScheduleCalendarRun from 'src/components/ScheduleCalendar/ScheduleCalendarRun';
import ScheduleCalendarRunHeader from 'src/components/ScheduleCalendar/ScheduleCalendarRunHeader';
import {IRun} from 'src/models/IRun';
import ReactTooltip from 'react-tooltip';
import {ILocation} from 'src/models/IAddress';
import {orderBy} from 'lodash';

export const ScheduleConfig = {
  startHours: 6,
  endHours: 21,
  blockHeight: 100,
  blockWidth: 170,
  panelsOffsetTop: 120,
  panelsOffsetLeft: 100
};

const ScrollContainer = styled.div`
  overflow: auto;
`;

const RunsContainer = styled.div`
  position: absolute;
  top: ${ScheduleConfig.panelsOffsetTop}px;
  left: ${ScheduleConfig.panelsOffsetLeft}px;
  display: flex;
`;

const StickTopPanel = styled.div`
  position: sticky;
  margin-left: ${ScheduleConfig.panelsOffsetLeft}px;
  padding-right: ${ScheduleConfig.panelsOffsetLeft}px;
  height: ${ScheduleConfig.panelsOffsetTop}px;
  background: ${ColorPalette.white};
  display: flex;
  z-index: 102;
  top: 0;
  width: max-content;
`;

const StickLeftPanel = styled.div`
  position: sticky;
  width: ${ScheduleConfig.panelsOffsetLeft}px;
  padding-bottom: ${ScheduleConfig.panelsOffsetTop}px;
  background: ${ColorPalette.white};
  z-index: 102;
  left: 0;
`;

const StickCover = styled.div`
  position: absolute;
  height: ${ScheduleConfig.panelsOffsetTop}px;
  width: ${ScheduleConfig.panelsOffsetLeft}px;
  background: ${ColorPalette.white};
  z-index: 11;
  left: 0;
  top: 0;
`;

const StickCover2 = styled.div`
  position: absolute;
  height: ${ScheduleConfig.panelsOffsetTop}px;
  width: ${ScheduleConfig.panelsOffsetLeft}px;
  z-index: 103;
  left: 0;
  top: 0;

  &:before {
    content: '';
    position: absolute;
    width: 1px;
    height: 100%;
    background: ${ColorPalette.white};
    right: 0;
  }

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: calc(100% - 10px);
    background: ${ColorPalette.white};
  }
`;

interface IProps {
  createNewRun: () => any;
  loadRuns: () => any;
  runs: IRun[];
  openModal: (data: any) => any;
  location: ILocation;
}

export const TooltipHeaderId = 'header-tooltip';

class ScheduleCalendar extends React.PureComponent<IProps> {
  public render() {
    const {runs: r, createNewRun, openModal, loadRuns, location} = this.props;
    const runs = orderBy(r, ['id'], ['asc']);

    return (
      <>
        <ReactTooltip className="overlapping" id={TooltipHeaderId} place="bottom" effect="solid" html={true} />
        <StickCover />
        <StickCover2 />
        <ScrollContainer className="h-100 position-relative">
          <StickTopPanel>
            {runs.map((run: IRun) => (
              <ScheduleCalendarRunHeader
                blockWidth={ScheduleConfig.blockWidth}
                run={run}
                key={run.id}
                loadRuns={loadRuns}
              />
            ))}
            <ScheduleCalendarRunHeader
              blockWidth={ScheduleConfig.blockWidth}
              newRun={true}
              createNewRun={createNewRun}
            />
          </StickTopPanel>
          <StickLeftPanel>
            <ScheduleCalendarScale
              startHours={ScheduleConfig.startHours}
              endHours={ScheduleConfig.endHours}
              blockHeight={ScheduleConfig.blockHeight}
            />
          </StickLeftPanel>
          <RunsContainer>
            {runs.map((run: IRun) => (
              <ScheduleCalendarRun
                startHours={ScheduleConfig.startHours}
                endHours={ScheduleConfig.endHours}
                blockHeight={ScheduleConfig.blockHeight}
                blockWidth={ScheduleConfig.blockWidth}
                run={run}
                key={run.id}
                openModal={openModal}
                loadRuns={loadRuns}
                location={location}
              />
            ))}
            <ScheduleCalendarRun
              startHours={ScheduleConfig.startHours}
              endHours={ScheduleConfig.endHours}
              blockHeight={ScheduleConfig.blockHeight}
              blockWidth={ScheduleConfig.blockWidth}
              newRun={true}
              location={location}
            />
          </RunsContainer>
        </ScrollContainer>
      </>
    );
  }
}

export default ScheduleCalendar;
