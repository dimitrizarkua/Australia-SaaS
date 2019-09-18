import * as React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import {FinancialChartDataset, IFinancialChartPoint} from 'src/models/ReportModels/IFinancialReports';
import ColorPalette from 'src/constants/ColorPalette';
import {Line} from 'react-chartjs-2';
import {formatPrice} from 'src/utility/Helpers';
import {FRONTEND_DATE} from 'src/constants/Date';

const CHART_LINE_WIDTH = 2;
const LEGEND_POINTS_DIAMETER = 8;
const CHART_FONT_COLOR = ColorPalette.black0;
const CHART_FONT_SIZE = 12;
const PRIMARY_CHART_COLOR = ColorPalette.orange1;
const PRIMARY_CHART_FILL_COLOR = ColorPalette.orange0;
const SECONDARY_CHART_COLOR = ColorPalette.gray4;
const MAX_Y_TICKS = 8;
const MAX_X_TICKS = 10;
const X_LABELS_SHIFT = 8;

const ChartContainer = styled.div`
  height: 460px;
  width: 100%;
  margin: 12px 30px 0 5px;
  padding: 0 30px 30px;
  position: relative;
  background: ${ColorPalette.white};
  border: 1px solid ${ColorPalette.gray4};
`;

const ChartName = styled.div`
  display: inline-block;
  position: absolute;
  margin-top: 20px;
  color: ${ColorPalette.gray5};
`;

interface IProps {
  name: string;
  primaryChart: FinancialChartDataset;
  secondaryChart?: FinancialChartDataset;
}

class FinanceLineChart extends React.PureComponent<IProps> {
  private static chartOptions = {
    maintainAspectRatio: false,
    animation: null,
    hover: {
      animationDuration: 1
    },
    responsiveAnimationDuration: 0,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false
          },
          ticks: {
            fontColor: CHART_FONT_COLOR,
            maxTicksLimit: MAX_X_TICKS,
            maxRotation: 0,
            labelOffset: X_LABELS_SHIFT
          }
        }
      ],
      yAxes: [
        {
          gridLines: {
            drawTicks: false
          },
          ticks: {
            fontColor: CHART_FONT_COLOR,
            maxTicksLimit: MAX_Y_TICKS,
            padding: 10,
            callback: (label: string | number) => (+label === 0 ? label : formatPrice(label))
          }
        }
      ]
    }
  };

  private static chartLegendParams = {
    position: 'top',
    labels: {
      fontColor: CHART_FONT_COLOR,
      boxWidth: LEGEND_POINTS_DIAMETER,
      fontSize: CHART_FONT_SIZE,
      padding: 45,
      usePointStyle: true
    }
  };

  private static adjustLegendPositionPlugin = {
    beforeInit(chart: any, options: any) {
      chart.legend.afterFit = function() {
        this.height = this.height + 30;
      };
    }
  };

  private static chartProps = {
    options: FinanceLineChart.chartOptions,
    legend: FinanceLineChart.chartLegendParams,
    plugins: [FinanceLineChart.adjustLegendPositionPlugin]
  };

  private getDataSet(data: FinancialChartDataset) {
    return data.map((item: IFinancialChartPoint) => item.value);
  }

  private getLabels(data: FinancialChartDataset) {
    const labels = data.map((item: IFinancialChartPoint) => moment(item.date).format('MMM DD'));
    return labels;
  }

  private getPlotLabel(data: FinancialChartDataset) {
    if (!data.length) {
      return '';
    }
    const dateFrom = data[0].date;
    const dateTo = data[data.length - 1].date;
    return `${moment(dateFrom).format(FRONTEND_DATE)} - ${moment(dateTo).format(FRONTEND_DATE)}`;
  }

  private composeDataset(chart: FinancialChartDataset, colorParams: any) {
    return {
      ...colorParams,
      borderWidth: CHART_LINE_WIDTH,
      lineTension: 0,
      pointRadius: 0,
      data: this.getDataSet(chart),
      label: this.getPlotLabel(chart)
    };
  }

  private get datasets() {
    const {primaryChart, secondaryChart} = this.props;
    const dataset = [
      this.composeDataset(primaryChart, {
        fill: true,
        borderColor: PRIMARY_CHART_COLOR,
        backgroundColor: PRIMARY_CHART_FILL_COLOR
      })
    ];

    if (secondaryChart) {
      dataset.push(
        this.composeDataset(secondaryChart, {
          fill: false,
          borderColor: SECONDARY_CHART_COLOR
        })
      );
    }

    return dataset;
  }

  public render() {
    return (
      <ChartContainer>
        <ChartName>{this.props.name}</ChartName>
        <Line
          {...FinanceLineChart.chartProps}
          data={{
            labels: this.getLabels(this.props.primaryChart),
            datasets: this.datasets
          }}
        />
      </ChartContainer>
    );
  }
}

export default FinanceLineChart;
