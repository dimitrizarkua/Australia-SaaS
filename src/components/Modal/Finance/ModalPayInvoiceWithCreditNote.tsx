import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import {compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import InvoicesService from 'src/services/InvoicesService';
import {debounce} from 'lodash';
import {IInvoice, IInvoiceListItem} from 'src/models/FinanceModels/IInvoices';
import SearchInput from 'src/components/SearchInput/SearchInput';
import {IListEnvelope} from 'src/models/IEnvelope';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import {formatPrice} from 'src/utility/Helpers';
import {priceToValue} from 'src/transformers/PaymentTransformer';
import {ICreditNote, ICreditNoteListItem} from 'src/models/FinanceModels/ICreditNotes';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import CreditNotesService from 'src/services/CreditNotesService';
import {FinanceEntityStatus} from 'src/constants/FinanceEntityStatus';
import {FinancePseudoTable} from 'src/components/Tables/FinanceListTable';
import {TBody, Td, Th, THead, Tr} from 'src/components/Tables/PseudoTableItems';
import JobInfo from 'src/components/AppLayout/FinanceLayout/FinanceComponents/JobInfo';

interface IWithDataProps {
  searchInvoices: IResource<IListEnvelope<IInvoiceListItem>>;
  searchCreditNotes: IResource<IListEnvelope<ICreditNoteListItem>>;
}

export interface IInvoicePayment {
  id: number;
  invoice: IInvoiceListItem;
  amount: number;
}

interface IOwnProps {
  financeEntity?: ICreditNote | IInvoice;
  onPay: (data: any) => Promise<any>;
  mode: ModalModes;
}

interface IState {
  invoices: IInvoicePayment[];
  loading: boolean;
}

export enum ModalModes {
  FromCreditNote,
  FromInvoice
}

type IProps = IOwnProps & IModal;

class ModalPayInvoiceWithCreditNote extends React.PureComponent<IProps & IWithDataProps, IState> {
  public state = {
    invoices: [],
    loading: false
  };

  public componentDidMount() {
    const {financeEntity, mode} = this.props;

    if (financeEntity && financeEntity.job_id && mode === ModalModes.FromCreditNote) {
      this.loadInvoices({job_id: financeEntity.job_id});
    }
  }

  private loadInvoices = async (config: {}) => {
    const list = await this.props.searchInvoices.fetch(config);

    this.setState({invoices: this.invoicesConverter(list.data)});
  };

  private loadCreditNotes = (config: {}) => {
    this.props.searchCreditNotes.fetch(config);
  };

  private debouncedSearch = (() => {
    const {mode} = this.props;

    switch (mode) {
      case ModalModes.FromCreditNote:
        return debounce(this.loadInvoices, 1000);
      case ModalModes.FromInvoice:
        return debounce(this.loadCreditNotes, 1000);
      default:
        return debounce((config: {}) => null, 1000);
    }
  })();

  private onChange = (search: string) => {
    const {mode, financeEntity} = this.props;

    if (+search) {
      switch (mode) {
        case ModalModes.FromCreditNote:
          this.debouncedSearch({job_id: +search});
          break;
        case ModalModes.FromInvoice:
          this.debouncedSearch({
            id: +search,
            virtual_status: FinanceEntityStatus.approved,
            locations: [financeEntity!.location_id]
          });
          break;
      }
    } else {
      this.debouncedSearch.cancel();
    }
  };

  private invoicesConverter = (invoices: IInvoiceListItem[]): IInvoicePayment[] => {
    return invoices.map((invoice: IInvoiceListItem) => ({
      id: invoice.id as number,
      amount: 0,
      invoice
    }));
  };

  private onInvoiceAmountChange = (el: IInvoicePayment) => (e: any) => {
    const {invoices} = this.state;

    const clone = Object.assign([], invoices);

    clone.forEach((p: IInvoicePayment) => {
      if (p.id === el.id) {
        p.amount = priceToValue(e.target.value);
      }
    });

    this.setState({invoices: clone});
  };

  private getAmount = () => {
    const {invoices} = this.state;
    const reducer = (accumulator: number, currentValue: IInvoicePayment) => accumulator + currentValue.amount;

    return invoices.reduce(reducer, 0);
  };

  private isPaymentValid = () => {
    const {financeEntity} = this.props;

    return !!financeEntity && financeEntity.sub_total === this.getAmount();
  };

  private renderInvoiceAmountInput = (element: IInvoicePayment) => (
    <input
      type="number"
      value={element.amount}
      onChange={this.onInvoiceAmountChange(element)}
      onBlur={() => null}
      className="form-control"
    />
  );

  private get initialSearchInputValue() {
    const {financeEntity, mode} = this.props;

    switch (mode) {
      case ModalModes.FromCreditNote:
        return ((!!financeEntity && financeEntity.job_id) || '').toString();
      case ModalModes.FromInvoice:
      default:
        return '';
    }
  }

  private get disableInput() {
    const {financeEntity, mode} = this.props;

    switch (mode) {
      case ModalModes.FromCreditNote:
        return !!financeEntity && !!financeEntity.job_id;
      case ModalModes.FromInvoice:
      default:
        return false;
    }
  }

  private get inputPlaceholder() {
    const {mode} = this.props;

    switch (mode) {
      case ModalModes.FromCreditNote:
        return 'Type job number...';
      case ModalModes.FromInvoice:
        return 'Type credit note number...';
      default:
        return '';
    }
  }

  private chooseCN = (cn: ICreditNoteListItem) => async () => {
    const {onPay, onClose} = this.props;

    this.setState({loading: true});

    try {
      await onPay(cn);
      setTimeout(onClose);
    } finally {
      this.setState({loading: false});
    }
  };

  private renderBody = () => {
    const {searchInvoices, financeEntity, mode, searchCreditNotes} = this.props;
    const {invoices} = this.state;
    const filteredCreditNotes = searchCreditNotes.data
      ? searchCreditNotes.data.data.filter((el: ICreditNoteListItem) =>
          financeEntity!.job_id ? !el.job || el.job.id === financeEntity!.job_id : true
        )
      : [];

    return (
      <>
        <div className="row">
          <div className="col-5">
            <SearchInput
              loading={searchInvoices.loading || searchCreditNotes.loading}
              onSearchValueChange={this.onChange}
              placeholder={this.inputPlaceholder}
              mode="typeGray"
              searchIcon={true}
              value={this.initialSearchInputValue}
              disabled={this.disableInput}
            />
          </div>
        </div>
        <div className="row">
          <>
            {mode === ModalModes.FromCreditNote && !!invoices.length && (
              <div className="col-12">
                {financeEntity && (
                  <ColoredDiv margin="20px 0 0 0" className="d-flex justify-content-end">
                    {formatPrice(this.getAmount())} / {formatPrice(financeEntity.sub_total)}
                  </ColoredDiv>
                )}
                <ColoredDiv margin="20px 0 0 0">
                  <FinancePseudoTable className="table">
                    <THead>
                      <Tr>
                        <Th>Invoice</Th>
                        <Th />
                        <Th>Job No.</Th>
                        <Th>Total Amount</Th>
                        <Th>Balance Due</Th>
                        <Th />
                      </Tr>
                    </THead>
                    <TBody>
                      {this.state.invoices.map((el: IInvoicePayment, index) => (
                        <Tr key={index}>
                          <Td>#{el.id}</Td>
                          <Td />
                          <Td>
                            <JobInfo job={el.invoice.job} locationOnly={true} />
                          </Td>
                          <Td>{formatPrice(el.invoice.total_amount)}</Td>
                          <Td>{formatPrice(el.invoice.balance_due)}</Td>
                          <Td>
                            <div style={{width: '150px'}}>{this.renderInvoiceAmountInput(el)}</div>
                          </Td>
                        </Tr>
                      ))}
                    </TBody>
                  </FinancePseudoTable>
                </ColoredDiv>
              </div>
            )}
            {mode === ModalModes.FromInvoice && !!filteredCreditNotes.length && (
              <div className="col-12">
                <ColoredDiv margin="20px 0 0 0">
                  <FinancePseudoTable className="table">
                    <THead>
                      <Tr>
                        <Th>Credit Note</Th>
                        <Th />
                        <Th>Job No.</Th>
                        <Th>Total Amount</Th>
                      </Tr>
                    </THead>
                    <TBody>
                      {filteredCreditNotes.map((el: ICreditNoteListItem, index) => (
                        <Tr key={index} onClick={this.chooseCN(el)}>
                          <Td>CN #{el.id}</Td>
                          <Td />
                          <Td>
                            <JobInfo job={el.job} locationOnly={true} />
                          </Td>
                          <Td>{formatPrice(el.total_amount)}</Td>
                        </Tr>
                      ))}
                    </TBody>
                  </FinancePseudoTable>
                </ColoredDiv>
              </div>
            )}
          </>
        </div>
      </>
    );
  };

  private onInternalPay = async () => {
    const {onPay, onClose} = this.props;
    const {invoices} = this.state;

    this.setState({loading: true});

    try {
      await onPay(invoices);
      setTimeout(onClose);
    } finally {
      this.setState({loading: false});
    }
  };

  private renderFooter = () => {
    const {mode} = this.props;

    return mode === ModalModes.FromCreditNote ? (
      <PrimaryButton disabled={!this.isPaymentValid()} className="btn" onClick={this.onInternalPay}>
        Apply
      </PrimaryButton>
    ) : (
      undefined
    );
  };

  public render() {
    const {isOpen, onClose} = this.props;
    const {loading} = this.state;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          footer={this.renderFooter()}
          body={this.renderBody()}
          loading={loading}
          title="Apply Credit Note to Invoice"
        />
      </Modal>
    );
  }
}

export default compose<React.ComponentClass<IProps>>(
  withData({
    searchInvoices: {
      fetch: InvoicesService.getUnpaid
    },
    searchCreditNotes: {
      fetch: CreditNotesService.search
    }
  })
)(ModalPayInvoiceWithCreditNote);
