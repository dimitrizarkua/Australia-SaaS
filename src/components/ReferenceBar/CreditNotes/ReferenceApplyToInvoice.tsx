import * as React from 'react';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';
import {ICreditNote} from 'src/models/FinanceModels/ICreditNotes';
import {Link} from 'src/components/Layout/Common/StyledComponents';
import ModalPayInvoiceWithCreditNote, {
  IInvoicePayment,
  ModalModes
} from 'src/components/Modal/Finance/ModalPayInvoiceWithCreditNote';
import CreditNotesService from 'src/services/CreditNotesService';

interface IOwnProps {
  creditNote: ICreditNote;
  loadCreditNote: () => any;
}

interface IState {
  showModal: boolean;
}

class ReferenceApplyToInvoice extends React.PureComponent<IOwnProps, IState> {
  public state = {
    showModal: false
  };

  private showModal = () => {
    this.setState({showModal: true});
  };

  private closeModal = () => {
    this.setState({showModal: false});
  };

  private onPay = async (list: IInvoicePayment[]) => {
    const {creditNote, loadCreditNote} = this.props;

    await CreditNotesService.applyCreditNoteToInvoices(
      creditNote.id,
      list.filter(p => p.amount > 0).map(p => ({invoice_id: p.id, amount: p.amount}))
    );
    loadCreditNote();
  };

  public render() {
    const {creditNote} = this.props;
    const {showModal} = this.state;

    return (
      <>
        {creditNote.total_amount > 0 && showModal && (
          <ModalPayInvoiceWithCreditNote
            isOpen={showModal}
            onClose={this.closeModal}
            financeEntity={creditNote}
            onPay={this.onPay}
            mode={ModalModes.FromCreditNote}
          />
        )}
        <ReferenceBarItem caption="Credit Note" collapsable={false}>
          <Link noDecoration={true} onClick={this.showModal}>
            Apply to Invoice
          </Link>
        </ReferenceBarItem>
      </>
    );
  }
}

export default ReferenceApplyToInvoice;
