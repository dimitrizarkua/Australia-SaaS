import * as React from 'react';
import ReportHeader from 'src/components/Layout/Reports/ReportHeader';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import ReportPage from 'src/components/Layout/Reports/ReportPage';
import NoBorderBodyTable from 'src/components/Tables/NoBorderBodyTable';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {IReportHandler} from 'src/components/Layout/Reports/IReportHandler';
import {GstSummaryStateType, getGstSummary} from 'src/redux/gstSummaryDucks';
import {IGstSummary} from 'src/models/ReportModels/IGstSummary';
import {IColumn, ColumnType} from 'src/components/Tables/IColumn';
import {getFormatPriceOrEmpty} from 'src/utility/Helpers';
import {EMPTY_CELL} from 'src/constants/Table';
import {debounce} from 'lodash';
import DateTransformer from 'src/transformers/DateTransformer';
import GSTSummaryPageFilter from './GSTSummaryPageFilter';
import styled from 'styled-components';
import TableLastRowEmpty from 'src/components/Tables/TableLastRowEmpty';
import StrongSpan from 'src/components/Layout/StrongSpan';
import {ICsvTransferFormat} from 'src/components/Layout/Reports/PrintButton';
import {DataGridHeader, TextHeader} from 'src/components/Tables/DataGridHeader';
import {DataGridCell, NumericCell, TextCell} from 'src/components/Tables/DataGridCell';

const TableLastRowEmptyExt = styled(TableLastRowEmpty)`
  thead {
    th {
      color: ${ColorPalette.black0};
      background: ${ColorPalette.white};
    }
  }
  tbody {
    tr:nth-last-child(2) {
      background: ${ColorPalette.gray0};
    }
  }
`;

interface IConnectProps {
  gstSummary: GstSummaryStateType;
  dispatch: (params?: any) => Promise<any> | void;
}

const REPORT_NAME = 'GST Summary';

class GSTSummaryPage extends React.PureComponent<IConnectProps> implements IReportHandler {
  public getCsvData = (): ICsvTransferFormat | null => {
    const gstSummary = this.props.gstSummary.data!.data;

    if (!this.hasGstSummary) {
      return null;
    }

    let res: any[] = [];
    if (gstSummary.income && gstSummary.income.data.length > 0) {
      res = res.concat({name: 'INCOME'});
      res = res.concat(gstSummary.income.data);
      res = res.concat({name: 'Total Income', tax_rate: '', taxes: '', total_amount: gstSummary.income.total});
    }

    if (gstSummary.expenses && gstSummary.expenses.data.length > 0) {
      res = res.concat({name: 'EXPENSES'});
      res = res.concat(gstSummary.expenses.data);
      res = res.concat({name: 'Total Expenses', tax_rate: '', taxes: '', total_amount: gstSummary.expenses.total});
    }

    if (gstSummary.other && gstSummary.other.data.length > 0) {
      res = res.concat({name: 'OTHER'});
      res = res.concat(gstSummary.other.data);
      res = res.concat({name: 'Total Other', tax_rate: '', taxes: '', total_amount: gstSummary.other.total});
    }

    return {
      reportName: REPORT_NAME,
      data: res.map(tr => {
        return {
          account: tr.name,
          tax_rate: tr.tax_rate,
          taxes: tr.taxes,
          total_amount: tr.total_amount
        };
      })
    };
  };

  private getData(location: number, page?: number, dateFrom?: string | null, dateTo?: string | null) {
    this.props.dispatch(
      getGstSummary({
        date_from: dateFrom,
        date_to: dateTo,
        location_id: location,
        page
      })
    );
  }

  private getGstSummary = (data: any, page?: number) => {
    const {dateFrom, dateTo, location} = data;

    if (location) {
      const from = DateTransformer.dehydrateDate(dateFrom);
      const to = DateTransformer.dehydrateDate(dateTo);
      const locationId = location && location.id;

      return this.getData(locationId, page, from, to);
    }
  };

  private filterReport = debounce(this.getGstSummary);

  private columnsDesc: Array<IColumn<IGstSummary>> = [
    {
      id: 'name',
      header: 'Account',
      type: ColumnType.Text,
      cell: item => <span>{item.name}</span>
    },
    {
      id: 'tax_rate',
      header: 'Tax Rate',
      width: '30%',
      type: ColumnType.Numeric,
      cell: item => <span>{item.tax_rate}%</span>
    },
    {
      id: 'taxes',
      header: 'Tax',
      width: '30%',
      type: ColumnType.Numeric,
      cell: item => <span>{getFormatPriceOrEmpty(item.taxes, EMPTY_CELL)}</span>
    },
    {
      id: 'total_amount',
      header: 'Amount Inc.',
      width: '30%',
      type: ColumnType.Numeric,
      cell: item => <span>{getFormatPriceOrEmpty(item.total_amount, EMPTY_CELL)}</span>
    }
  ];

  private renderReportRows() {
    const gstSummary = this.props.gstSummary.data!.data;

    if (!gstSummary) {
      return null;
    }

    return (
      <>
        <tr>
          <td colSpan={this.columnsDesc.length} style={{padding: '0'}}>
            {this.renderGstSummary(gstSummary.income, 'Income')}
          </td>
        </tr>

        <tr>
          <td colSpan={this.columnsDesc.length} style={{padding: '0'}}>
            {this.renderGstSummary(gstSummary.expenses, 'Expenses')}
          </td>
        </tr>

        <tr>
          <td colSpan={this.columnsDesc.length} style={{padding: '0'}}>
            {this.renderGstSummary(gstSummary.other, 'Other')}
          </td>
        </tr>
      </>
    );
  }

  private renderGstSummary(summary: {data: IGstSummary[]; total: number}, groupName: string) {
    return (
      <TableLastRowEmptyExt className="table">
        <thead>
          <tr>
            <TextHeader colSpan={this.columnsDesc.length}>
              <StrongSpan>{groupName}</StrongSpan>
            </TextHeader>
          </tr>
        </thead>
        <tbody>
          {summary && summary.data.length > 0 ? this.renderSummaries(summary.data) : this.renderNodata()}
          {summary && summary.data.length > 0 && (
            <tr>
              <TextCell colSpan={this.columnsDesc.length - 1}>Total {groupName}</TextCell>
              <NumericCell width="30%">
                <StrongSpan>{getFormatPriceOrEmpty(summary.total, EMPTY_CELL)}</StrongSpan>
              </NumericCell>
            </tr>
          )}
          <tr>
            <td colSpan={this.columnsDesc.length}>&nbsp;</td>
          </tr>
        </tbody>
      </TableLastRowEmptyExt>
    );
  }

  private renderSummaries(summaries: IGstSummary[], isTotal?: boolean) {
    if (!summaries) {
      return null;
    }

    return summaries.map((summary: IGstSummary) => (
      <tr key={summary.name}>
        {this.columnsDesc.map(c => (
          <DataGridCell key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
            {!isTotal ? c.cell(summary) : <StrongSpan>{c.cell(summary)}</StrongSpan>}
          </DataGridCell>
        ))}
      </tr>
    ));
  }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={this.columnsDesc.length}>
          No items found
        </td>
      </tr>
    );
  }

  private get hasGstSummary(): boolean {
    const {
      gstSummary: {ready, data: gstSummaryData}
    } = this.props;
    const data = gstSummaryData && gstSummaryData.data;
    return !!(ready && data);
  }

  public render() {
    const {
      gstSummary: {loading}
    } = this.props;
    const hasGstSummary = this.hasGstSummary;
    return (
      <>
        <ReportHeader reportName={REPORT_NAME} toCsvFn={this.getCsvData}>
          <GSTSummaryPageFilter onSubmit={this.filterReport} />
        </ReportHeader>
        {loading ? (
          <BlockLoading size={40} color={ColorPalette.white} />
        ) : (
          <ReportPage>
            <NoBorderBodyTable className="table">
              <thead>
                <tr>
                  {this.columnsDesc.map(c => (
                    <DataGridHeader key={c.id} width={c.width} align={c.type}>
                      {c.header}
                    </DataGridHeader>
                  ))}
                </tr>
              </thead>
              <tbody>{hasGstSummary ? this.renderReportRows() : this.renderNodata()}</tbody>
            </NoBorderBodyTable>
          </ReportPage>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  gstSummary: state.gstSummary
});

export default connect(mapStateToProps)(GSTSummaryPage);
