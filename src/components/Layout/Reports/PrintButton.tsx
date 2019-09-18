import React, {PureComponent} from 'react';
import {IconName} from 'src/components/Icon/Icon';
import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import {isArray} from 'lodash';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import CSVService from 'src/services/CSVService';

export type CsvSourceFormat = ICsvTransferFormat | ICsvTransferFormat[] | null;

interface IProps {
  transformToTable: () => CsvSourceFormat;
}

const IconWrapper = styled.div`
  cursor: pointer;
  path,
  line,
  polyline {
    stroke: ${ColorPalette.white};
    fill: none;
  }
  :hover path,
  :hover line,
  :hover polyline {
    stroke: ${ColorPalette.white};
  }
`;

export interface ICsvTransferFormat<T = {}> {
  reportName?: string;
  data: T[];
  columns?: string[];
}

class PrintButton extends PureComponent<IProps> {
  private exportToCsv = ({reportName, data, columns}: ICsvTransferFormat) => {
    const fileName = reportName || 'report';
    const csv = CSVService.exportToCsv(data, columns);
    this.download(csv, `${fileName}.csv`, 'text/plain');
  };

  private dataToCsv = () => {
    const reportData = this.props.transformToTable();
    if (!reportData) {
      return;
    }
    if (isArray(reportData)) {
      reportData.forEach(el => setTimeout(() => this.exportToCsv(el)));
    } else {
      this.exportToCsv(reportData);
    }
  };

  private download(content: any, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  private printToPdf = () => {
    window.print();
  };

  private getDropdownMenuItems = (): IMenuItem[] => {
    return [
      {
        name: 'Export to CSV',
        onClick: this.dataToCsv
      },
      {
        type: 'divider'
      },
      {
        name: 'Print',
        onClick: this.printToPdf
      }
    ] as IMenuItem[];
  };

  public render() {
    const otherActions = this.getDropdownMenuItems();

    return (
      <IconWrapper>
        <DropdownMenuControl items={otherActions} noMargin={true} iconName={IconName.Download} direction="right" />
      </IconWrapper>
    );
  }
}

export default PrintButton;
