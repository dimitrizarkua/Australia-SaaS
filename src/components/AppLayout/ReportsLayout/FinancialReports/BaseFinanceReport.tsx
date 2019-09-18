import React from 'react';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {
  FinReportLayout,
  FinReportLayoutTable,
  FinReportStatLayout,
  FinReportChartLayout,
  FinReportTableWrapper
} from './FinReportComponents';
import {IShareFinReportProps} from './index';
import {isEqual} from 'lodash';
import {FinancialChartDataset} from 'src/models/ReportModels/IFinancialReports';
import ValueWithLabel from 'src/components/AppLayout/FinanceLayout/FinanceComponents/ValueWithLabel';
import FinanceLineChart from './FinanceLineChart';
import {ICsvTransferFormat} from 'src/components/Layout/Reports/PrintButton';

type ElementConstructor = (...a: any[]) => React.ReactNode;

export interface IFinanceReportChart {
  name: string;
  primaryChart: FinancialChartDataset;
  secondaryChart?: FinancialChartDataset;
}

export type IFinanceReportChartData = IFinanceReportChart | null;

export interface IFinReportStatItem {
  value: string | number;
  label: string;
  delta: number;
  hasDelimiter?: boolean;
  toolTip?: string | HTMLElement;
}

export interface IFinReportStatConfig {
  data: IFinReportStatItem[];
  perRow: number;
  perCol: number;
}
type AbstractSimpleFunction = () => void;

type AllProps<T> = T & IShareFinReportProps;

export abstract class BaseFinanceReport<T> extends React.PureComponent<AllProps<T>> {
  protected abstract request(cb?: AbstractSimpleFunction): void;
  protected abstract get data(): any;
  protected abstract get statConfig(): IFinReportStatConfig | null;
  protected abstract finTables?: ElementConstructor[];
  protected abstract get chartData(): IFinanceReportChartData;
  protected abstract get isLoading(): boolean;
  protected abstract getCsv(): null | ICsvTransferFormat | ICsvTransferFormat[];

  public componentDidMount(): void {
    this.bindEvents();
    this.getData();
  }

  private bindEvents = () => {
    this.props.receiveCsvData(this.getCsv);
  };

  public componentDidUpdate(pProps: AllProps<T>) {
    if (!isEqual(pProps.currentFilterParams, this.props.currentFilterParams)) {
      this.getData();
    }
  }

  private getData(cb?: AbstractSimpleFunction) {
    if (this.allowRequest) {
      this.request(cb);
    }
  }

  private get allowRequest() {
    const fields = ['current_date_from', 'current_date_to', 'previous_date_from', 'previous_date_to', 'location_id'];
    return !fields.find(field => !this.props.currentFilterParams[field]);
  }

  private createStatColumn(statList: IFinReportStatItem[], key: string | number) {
    return (
      <div className="d-flex" key={key}>
        {statList.map(({delta, hasDelimiter, label, toolTip, value}: IFinReportStatItem, i) => (
          <ValueWithLabel
            delta={delta}
            hasDelimiter={hasDelimiter}
            label={label}
            reactTipProps={{'data-tip': toolTip}}
            value={value}
            key={`${label} - ${i}`}
          />
        ))}
      </div>
    );
  }

  private renderStatistics() {
    const stat = this.statConfig;
    const statisticData = stat && stat.data;
    if (!statisticData || !statisticData.length) {
      return null;
    }
    const {perCol, perRow} = stat!;

    return Array(perCol)
      .fill(0)
      .map((e, i) => {
        return this.createStatColumn(statisticData.slice(perRow * i, perRow * (i + 1)), i);
      });
  }

  private renderTables() {
    const finTables = this.finTables;
    if (!finTables || !finTables.length) {
      return null;
    }

    if (finTables.length === 1) {
      return <FinReportTableWrapper className="w-100">{finTables[0]()}</FinReportTableWrapper>;
    }

    return finTables.map((t, i) => (
      <FinReportTableWrapper className="col-md-6" key={i}>
        {t()}
      </FinReportTableWrapper>
    ));
  }

  private renderChart() {
    const data = this.chartData;
    if (!data) {
      return null;
    }

    const {name, primaryChart, secondaryChart} = data!;
    return <FinanceLineChart name={name} primaryChart={primaryChart} secondaryChart={secondaryChart} />;
  }
  public render() {
    const financeData = this.data;
    return (
      <React.Fragment>
        {this.isLoading && <BlockLoading size={40} color={ColorPalette.white} />}
        {financeData && (
          <React.Fragment>
            <FinReportLayout className="d-flex flex-wrap">
              <FinReportStatLayout className="d-flex flex-column">{this.renderStatistics()}</FinReportStatLayout>
              <FinReportChartLayout className="temp">{this.renderChart()}</FinReportChartLayout>
            </FinReportLayout>
            <FinReportLayoutTable className="d-flex flex-wrap">{this.renderTables()}</FinReportLayoutTable>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
