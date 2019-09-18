import * as React from 'react';
import styled from 'styled-components';
import {IReportHandler} from 'src/components/Layout/Reports/IReportHandler';
import {IInvoicePayment, IInvoicePaymentRequest} from 'src/models/ReportModels/IInvoicePayment';
import NoBorderBodyTable from 'src/components/Tables/NoBorderBodyTable';
import ColorPalette from 'src/constants/ColorPalette';
import {formatPrice} from 'src/utility/Helpers';
import {IPayment} from 'src/models/IPayment';
import Moment from 'react-moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import {IAppState} from 'src/redux';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {getInvoicePayments, InvoicePaymentStateType} from 'src/redux/invoicePaymentDucks';
import ReportHeader from 'src/components/Layout/Reports/ReportHeader';
import InvoicePaymentsPageFilter from './InvoicePaymentsPageFilter';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {debounce} from 'lodash';
import DateTransformer from 'src/transformers/DateTransformer';
import Tag from 'src/components/Tag/Tag';
import Typography from 'src/constants/Typography';
import {ITag} from 'src/models/ITag';
import ReportPage from 'src/components/Layout/Reports/ReportPage';
import TableLastRowEmpty from 'src/components/Tables/TableLastRowEmpty';
import {IColumn, ColumnType} from 'src/components/Tables/IColumn';
import Pagination from 'src/components/Tables/Pagination';
import {DataGridHeader, TextHeader, NumericHeader} from 'src/components/Tables/DataGridHeader';
import {DataGridCell} from 'src/components/Tables/DataGridCell';

const BlackSpan = styled.span`
  color: ${ColorPalette.black0};
`;

const UpperCaseSpan = styled.span`
  text-transform: uppercase;
  white-space: nowrap;
`;

const PaymentTag = styled(Tag)`
  font-size: ${Typography.size.smaller};
`;

interface IConnectProps {
  invoicePayments: InvoicePaymentStateType;
  dispatch: (params?: any) => Promise<any> | void;
}

interface IState {
  reportRequest: IInvoicePaymentRequest;
}

const REPORT_NAME = 'Invoice Payments';

class InvoicePaymentsPage extends React.PureComponent<IConnectProps & IState> implements IReportHandler {
  public state: IState = {
    reportRequest: {dateFrom: null, dateTo: null, location: null}
  };

  public getCsvData = () => {
    const invoices = this.props.invoicePayments.data!.data;

    if (!this.hasIvoices) {
      return [];
    }

    const ret: any[] = [];
    invoices.forEach(invoice => {
      const obj = {
        id: invoice.id,
        location_code: invoice.location_code,
        recipient_name: invoice.recipient_name
          ? invoice.recipient_name
          : invoice.recipient_contact
          ? invoice.recipient_contact.email
          : '',
        claim_number: invoice.job ? invoice.job.claim_number : '',
        total_amount: invoice.total_amount,
        paid_status: invoice.paid_status,
        item: '',
        reference: '',
        amount: ''
      };

      if (invoice.payments && invoice.payments.length > 0) {
        const payments = invoice.payments.map((payment: IPayment) => {
          return {
            id: obj.id,
            location_code: obj.location_code,
            recipient_name: obj.recipient_name,
            claim_number: obj.claim_number,
            total_amount: obj.total_amount,
            paid_status: obj.paid_status,
            item: payment.paid_at,
            reference: payment.type,
            amount: payment.amount
          };
        });

        payments.forEach((p: any) => ret.push(p));
      } else {
        ret.push(obj);
      }
    });

    return {
      reportName: REPORT_NAME,
      data: ret
    };
  };

  private columnsPaymentDef: Array<IColumn<IPayment>> = [
    {
      id: 'item',
      header: 'Item',
      width: '15%',
      type: ColumnType.Text,
      cell: item => <Moment format={FRONTEND_DATE}>{item.paid_at ? item.paid_at.toString() : '--'}</Moment>
    },
    {
      id: 'reference',
      header: 'Reference',
      width: '65%',
      type: ColumnType.Text,
      cell: item => (
        <span>
          {item.reference} {this.renderPaymentType(item.type)}
        </span>
      )
    },
    {
      id: 'amount',
      header: 'Amount',
      width: '10%',
      type: ColumnType.Numeric,
      cell: item => <span>{formatPrice(item.amount)}</span>
    },
    {
      id: 'paid',
      header: '',
      width: '10%',
      type: ColumnType.Text,
      cell: item => <span>&nbsp;</span>
    }
  ];

  private getData(location?: number, page?: number, dateFrom?: string | null, dateTo?: string | null) {
    this.setState({
      reportRequest: {
        dateFrom,
        dateTo,
        location
      }
    });

    this.props.dispatch(
      getInvoicePayments({
        date_from: dateFrom,
        date_to: dateTo,
        location_id: location,
        page
      })
    );
  }

  private getInoicePayments = (data: any, page?: number) => {
    const {dateFrom, dateTo, location} = data;

    const from = DateTransformer.dehydrateDate(dateFrom);
    const to = DateTransformer.dehydrateDate(dateTo);
    const locationId = location && location.id;

    return this.getData(locationId, page, from, to);
  };

  private filterReport = debounce(this.getInoicePayments);

  private handlePagination = (page: number) => {
    return this.getInoicePayments(this.state.reportRequest, page);
  };

  private renderReportRows() {
    const invoices = this.props.invoicePayments.data!.data;

    if (!invoices) {
      return null;
    }

    return invoices.map((invoice: IInvoicePayment) => (
      <tr key={`invoice-tr-${invoice.id}`}>
        <td colSpan={5} style={{padding: '0'}}>
          {this.renderInvoice(invoice)}
        </td>
      </tr>
    ));
  }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={this.columnsPaymentDef.length}>
          No data...
        </td>
      </tr>
    );
  }

  private renderInvoice(invoice: IInvoicePayment) {
    const invoiceLocation = invoice.location_code ? invoice.location_code : '';
    let invoiceTitle = invoice.recipient_name ? ' | ' + invoice.recipient_name : '';
    if (invoiceTitle) {
      invoiceTitle =
        invoice.recipient_contact && invoice.recipient_contact.email ? ' | ' + invoice.recipient_contact.email : '';
    }
    const invoiceJobNumber = invoice.job ? ' | #' + invoice.job.claim_number : '';

    return (
      <TableLastRowEmpty className="table">
        <thead>
          <tr>
            <TextHeader colSpan={2} width="80%">
              <BlackSpan>Invoice {invoice.id}:</BlackSpan> {invoiceLocation} {invoiceTitle} {invoiceJobNumber}
            </TextHeader>
            <NumericHeader width="10%">
              <BlackSpan>{formatPrice(invoice.total_amount)}</BlackSpan>
            </NumericHeader>
            <th style={{width: '10%', textAlign: 'center'}}>
              <UpperCaseSpan>{invoice.paid_status}</UpperCaseSpan>
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.payments && invoice.payments.length > 0
            ? this.renderPayments(invoice.payments)
            : this.renderNoPayment()}
          <tr>
            <td colSpan={5}>&nbsp;</td>
          </tr>
        </tbody>
      </TableLastRowEmpty>
    );
  }

  private renderPayments(payments: IPayment[]) {
    if (!payments) {
      return null;
    }

    return payments.map((payment: IPayment) => (
      <tr key={payment.id}>
        {this.columnsPaymentDef.map(c => (
          <DataGridCell key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
            {c.cell(payment)}
          </DataGridCell>
        ))}
      </tr>
    ));
  }

  private renderPaymentType(type: string) {
    switch (type) {
      case 'credit_card':
        return <PaymentTag tag={{name: 'CREDIT CARD', color: ColorPalette.blue1} as ITag} />;
      case 'direct_deposit':
        return <PaymentTag tag={{name: 'DIRECT DEPOSIT', color: ColorPalette.gray4} as ITag} />;
      case 'credit_note':
        return <PaymentTag tag={{name: 'CREDIT NOTED', color: ColorPalette.orange1} as ITag} />;
      default:
        return '';
    }
  }

  private renderNoPayment() {
    return (
      <tr>
        <td className="no-items" colSpan={this.columnsPaymentDef.length} text-align="left">
          No payments made
        </td>
      </tr>
    );
  }

  private get hasIvoices(): boolean {
    const {
      invoicePayments: {ready, data: invoices}
    } = this.props;
    return !!(ready && invoices && invoices.data && invoices.data.length > 0);
  }

  public render() {
    const {
      invoicePayments: {loading}
    } = this.props;
    const invoicePaymentsData = this.props.invoicePayments.data;
    const hasInvoices = this.hasIvoices;

    return (
      <>
        <ReportHeader reportName={REPORT_NAME} toCsvFn={this.getCsvData}>
          <InvoicePaymentsPageFilter onSubmit={this.filterReport} />
        </ReportHeader>
        {loading ? (
          <BlockLoading size={40} color={ColorPalette.white} />
        ) : (
          <ReportPage>
            <NoBorderBodyTable className="table">
              <thead>
                <tr>
                  {this.columnsPaymentDef.map(c => (
                    <DataGridHeader key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
                      {c.header}
                    </DataGridHeader>
                  ))}
                </tr>
              </thead>
              <tbody>{hasInvoices ? this.renderReportRows() : this.renderNodata()}</tbody>
            </NoBorderBodyTable>
            {invoicePaymentsData && invoicePaymentsData.pagination && invoicePaymentsData.pagination.last_page > 1 && (
              <Pagination pagination={invoicePaymentsData.pagination} onChange={this.handlePagination} />
            )}
          </ReportPage>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  invoicePayments: state.invoicePayments
});

export default compose<React.ComponentClass<{}>>(connect(mapStateToProps))(InvoicePaymentsPage);

export const InternalAccountTransactionsPage = InvoicePaymentsPage;
