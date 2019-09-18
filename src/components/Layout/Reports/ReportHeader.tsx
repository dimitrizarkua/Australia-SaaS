import * as React from 'react';
import SubHeaderPanel from 'src/components/Layout/Common/SubHeaderPanel';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import styled from 'styled-components';
import PrintButton, {CsvSourceFormat} from './PrintButton';
import NotPrintable from './NotPrintable';

interface IProps {
  reportName: string;
  children: any;
  toCsvFn: () => CsvSourceFormat;
}

const ReportNamePanel = styled.div`
  font-weight: ${Typography.weight.medium};
  font-size: ${Typography.size.normal};
  color: ${ColorPalette.white};
  padding: 0 25px 0 25px;
  display: flex;
  align-items: center;
  height: 100%;
`;

const ButtonsPanel = styled.div`
  padding: 0px 15px;
  display: flex;
  align-items: center;
  height: 100%;
`;

const HeadBlock = styled.div`
  height: 100%;
  display: flex;
`;

class ReportHeader extends React.PureComponent<IProps> {
  public render() {
    const {reportName, toCsvFn} = this.props;

    return (
      <SubHeaderPanel>
        <HeadBlock>
          <ReportNamePanel>{reportName}</ReportNamePanel>
        </HeadBlock>

        <HeadBlock>
          <HeadBlock>{this.props.children}</HeadBlock>

          <ButtonsPanel>
            <NotPrintable>
              <PrintButton transformToTable={toCsvFn} />
            </NotPrintable>
          </ButtonsPanel>
        </HeadBlock>
      </SubHeaderPanel>
    );
  }
}

export default ReportHeader;
