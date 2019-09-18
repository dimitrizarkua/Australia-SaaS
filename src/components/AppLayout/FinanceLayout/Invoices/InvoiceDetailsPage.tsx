import * as React from 'react';
import {IMenuItem} from 'src/components/SidebarMenu/SidebarMenu';
import {IMenuItem as IDropdownMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import {matchPath, RouteComponentProps, RouteProps, withRouter} from 'react-router';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {IJobStatus} from 'src/models/IJob';
import Permission from 'src/constants/Permission';
import FinanceHeader from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceHeader';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ThunkDispatch} from 'redux-thunk';
import {
  createItem,
  IInvoiceState,
  loadInvoice,
  removeItem,
  reset,
  submitItem,
  updateInvoice,
  updateItem
} from 'src/redux/invoiceDucks';
import FinanceItems, {FinanceEntity} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceItems';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import FinanceItemTopMenu, {
  FinanceItemTypes
} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceItemTopMenu';
import InvoiceDetailsForm from './InvoiceDetailsForm';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import DetailsPageLayout from 'src/components/Layout/DetailsPageLayout';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import InvoicesService from 'src/services/InvoicesService';
import {submissionErrorHandler, VALIDATION_ERROR_CODE} from 'src/services/ReduxFormHelper';
import Notify, {NotifyType} from 'src/utility/Notify';
import {ITag} from 'src/models/ITag';
import PageContent from 'src/components/Layout/PageContent';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import * as qs from 'qs';
import withData, {IResource} from 'src/components/withData/withData';
import {INotesSuccess} from 'src/services/NotesAndMessagesService';
import NoteBasedItemsList from 'src/components/Layout/NoteBasedItemsList';
import {IUserState} from 'src/redux/userDucks';
import moment from 'moment';
import StatusListItem from 'src/components/Layout/StatusListItem';
import ModalRequestApproval, {IFormValues} from 'src/components/Modal/Finance/ModalRequestApproval';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IUser} from 'src/models/IUser';
import {IGLAccount} from 'src/models/IFinance';
import {openModal} from 'src/redux/modalDucks';
import {ITagsSuccess} from 'src/services/TagService';
import FinanceReferenceItems from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceReferenceItems';
import {getFinanceItemStatusList, IStatusesEntity} from 'src/utility/Helpers';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import styled from 'styled-components';
import printJS from 'print-js';
import {INote} from 'src/models/INotesAndMessages';
import FinanceService from 'src/services/FinanceService';
import AddPaymentModal from 'src/components/AppLayout/FinanceLayout/Invoices/AddPaymentModal';
import {IInvoice} from 'src/models/FinanceModels/IInvoices';
import FinanceDetailsPage from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceDetailsPage';
import ModalPayInvoiceWithCreditNote, {ModalModes} from 'src/components/Modal/Finance/ModalPayInvoiceWithCreditNote';
import {ICreditNoteListItem} from 'src/models/FinanceModels/ICreditNotes';
import CreditNotesService from 'src/services/CreditNotesService';

const NotesWrapper = styled.div`
  position: relative;
  border-top: 1px solid ${ColorPalette.gray2};
`;

interface IParams {
  id: string;
}

interface IConnectProps {
  financeEntity: IInvoiceState;
  user: IUserState;
  glAccounts: IGLAccount[];
  dispatch: ThunkDispatch<IAppState, unknown, Action>;
}

interface IWithDataProps {
  invoiceNotes: IResource<INotesSuccess>;
  approvers: IResource<IListEnvelope<IUser>>;
  tags: IResource<ITagsSuccess>;
}

interface IState {
  showApproveModal: boolean;
  disableApproveButton: boolean;
  showAddPaymentModal: boolean;
  showAddCreditNoteModal: boolean;
}

type IProps = RouteComponentProps<IParams> & IConnectProps & IWithDataProps;

class InvoiceDetailsPage extends FinanceDetailsPage<IProps, IState> {
  public state = {
    showApproveModal: false,
    disableApproveButton: false,
    showAddPaymentModal: false,
    showAddCreditNoteModal: false
  };

  public componentDidMount() {
    if (!this.isNew) {
      this.fetchInvoice();
    }

    this.scrollToHighlightedItem(this.getHighlightedItemSelector());
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.match.params.id !== prevProps.match.params.id && !this.isNew) {
      this.fetchInvoice();
    }

    if (this.notesCounter(this.props) !== this.notesCounter(prevProps)) {
      this.scrollToHighlightedItem(this.getHighlightedItemSelector());
    }
  }

  public componentWillUnmount() {
    this.props.dispatch(reset());
  }

  private notesCounter = (props: IProps) => {
    return props.invoiceNotes.data ? props.invoiceNotes.data.data.length : 0;
  };

  private getHighlightedItemSelector = () => {
    let selector;
    const highlightedItem = this.getHighlightedItem();

    if (highlightedItem.note) {
      selector = `note-${highlightedItem.note}`;
    }

    return selector;
  };

  private fetchInvoice() {
    const {dispatch, match, approvers, tags} = this.props;
    const invoiceId = match.params.id;

    this.loadNotes();
    approvers.fetch(invoiceId);
    tags.fetch(invoiceId);

    dispatch(loadInvoice(invoiceId));
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private createInvoice = (data: IFormData) => {
    return InvoicesService.create(data)
      .then(financeEntity => {
        this.props.history.push(`/finance/invoices/details/${financeEntity.data.id}`);
      })
      .catch(err => {
        if (err.status_code === VALIDATION_ERROR_CODE) {
          return submissionErrorHandler(err);
        } else {
          return Promise.reject();
        }
      });
  };

  private updateInvoice = async (data: IFormData) => {
    if (this.isNew) {
      // Do not update Invoice on form values changes.
      // There is an explicit submit button
      return Promise.resolve();
    }
    try {
      return await this.props.dispatch(updateInvoice(+this.props.match.params.id, data));
    } catch (err) {
      if (err.status_code === VALIDATION_ERROR_CODE) {
        return submissionErrorHandler(err);
      } else {
        return Promise.reject();
      }
    }
  };

  private createOrUpdateInvoice = (data: IFormData) => {
    return this.isNew ? this.createInvoice(data) : this.updateInvoice(data);
  };

  private createItem = () => {
    return this.props.dispatch(createItem());
  };

  private updateItem = (id: number | string, data: any) => {
    return this.props.dispatch(updateItem(id, data, true));
  };

  private submitItem = (id: number | string) => {
    return this.props.dispatch(submitItem(id));
  };

  private removeItem = (id: number | string) => {
    return this.props.dispatch(removeItem(id));
  };

  private approveInvoice = async () => {
    const {dispatch, match} = this.props;

    if (this.allowApprove()) {
      const res = await dispatch(openModal('Confirm', `Approve Invoice #${match.params.id}?`));

      if (res) {
        this.setState({disableApproveButton: true});

        try {
          await InvoicesService.approveInvoice(match.params.id);
          Notify(NotifyType.Success, 'Invoice approved successfully');
          await this.fetchInvoice();
        } catch (e) {
          Notify(NotifyType.Danger, "Invoice can't be approved");
        } finally {
          this.setState({disableApproveButton: false});
        }
      }
    } else {
      this.showApproveModal();
    }
  };

  // check to prevent show loader when financeEntity is just updating
  private get alreadyLoaded() {
    return this.props.financeEntity.data.id && +this.props.match.params.id === this.props.financeEntity.data.id;
  }

  private getMenuItems(): IMenuItem[] {
    return [
      {
        path: '/finance/invoices/draft',
        icon: IconName.FileEdit,
        isActive: this.isActive('/finance/invoices/draft'),
        hint: 'Drafts'
      },
      {
        path: '/finance/invoices/unpaid',
        icon: IconName.FileCheck,
        isActive: this.isActive('/finance/invoices/unpaid'),
        hint: 'Unpaid'
      },
      {
        path: '/finance/invoices/overdue',
        icon: IconName.FileCash,
        isActive: this.isActive('/finance/invoices/overdue'),
        hint: 'Overdue'
      },
      {
        path: '/finance/invoices/all',
        icon: IconName.File,
        isActive: this.isActive('/finance/invoices/all'),
        hint: 'All invoices'
      }
    ];
  }

  private duplicateInvoice = async () => {
    const {
      financeEntity: {data},
      dispatch
    } = this.props;

    if (data) {
      const confirm = await dispatch(openModal('Confirm', `Duplicate financeEntity #${data.id}?`));

      if (confirm) {
        const res = await InvoicesService.create(data as IFormData);
        this.props.history.push(`/finance/invoices/details/${res.data.id}`);
      }
    }
  };

  private deleteInvoice = async () => {
    const {
      financeEntity: {data},
      dispatch
    } = this.props;

    if (data) {
      const confirm = await dispatch(openModal('Confirm', `Delete financeEntity #${data.id}?`));

      if (confirm) {
        await InvoicesService.remove(data.id!);
        this.props.history.replace('/finance/invoices/draft');
      }
    }
  };

  private print = async () => {
    const {
      financeEntity: {data}
    } = this.props;

    if (data) {
      const pdfData = await InvoicesService.forPrint(data.id!);
      printJS({printable: window.URL.createObjectURL(new Blob([pdfData], {type: 'application/pdf'})), type: 'pdf'});
    }
  };

  private onTagClick = async (tag: ITag) => {
    const {tags, match} = this.props;

    await InvoicesService.addTag(tag.id, +match.params.id);
    await tags.fetch(+match.params.id);
  };

  private onRemoveTagClick = async (tag: ITag) => {
    const {tags, match} = this.props;

    await InvoicesService.removeTag(tag.id, +match.params.id);
    await tags.fetch(+match.params.id);
  };

  private getDropdownMenuItems = (context: IUserContext) => {
    const {data} = this.props.financeEntity;
    const items: IDropdownMenuItem[] = [
      {
        name: 'Print',
        onClick: this.print
      },
      {
        name: 'Duplicate',
        onClick: this.duplicateInvoice,
        disabled: !context.has(Permission.INVOICES_MANAGE) || !data
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: this.deleteInvoice,
        disabled: !context.has(Permission.INVOICES_MANAGE)
      }
    ];
    return items;
  };

  private isNoteEditorVisible = () => {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});

    return params.note === 'true';
  };

  private redirectToNotes = () => {
    const {history, match} = this.props;
    history.push(`/finance/invoices/details/${match.params.id}?note=true`);
  };

  private saveNoteDraft = async (note: INote) => {
    const {
      financeEntity: {data},
      match
    } = this.props;

    if (data && data.id) {
      await InvoicesService.addNoteToInvoice(note.id, data.id);
      this.loadNotes();
      this.props.history.replace(`/finance/invoices/details/${match.params.id}`);
    }
  };

  private loadNotes = () => {
    const {match, invoiceNotes} = this.props;
    const invoiceId = match.params.id;

    invoiceNotes.fetch(invoiceId);
  };

  private getSortedNotes = () => {
    const {invoiceNotes} = this.props;

    if (invoiceNotes.data) {
      return invoiceNotes.data.data.sort((a: any, b: any) => moment(b.created_at || '').diff(a.created_at || ''));
    }

    return [];
  };

  private deleteNote = async (noteId: string | number) => {
    const {match, invoiceNotes} = this.props;

    await InvoicesService.removeNoteFromInvoice(noteId, match.params.id);
    invoiceNotes.fetch(match.params.id);
  };

  private allowApprove = () => {
    const {user, financeEntity} = this.props;

    return (
      +user.me!.invoice_approve_limit >= +(financeEntity.data.total_amount || 0) &&
      !!financeEntity.data.location &&
      user.locations.map(el => +el.id).includes(+financeEntity.data.location.id)
    );
  };

  private sendApproveRequest = async (data: IFormValues) => {
    const {match} = this.props;
    await InvoicesService.sendApproveRequest(match.params.id, [data.user.id]);
  };

  private showApproveModal = () => {
    this.setState({showApproveModal: true});
  };

  private hideApproveModal = () => {
    this.setState({showApproveModal: false});
  };

  private showAddPaymentModal = () => {
    this.setState({showAddPaymentModal: true});
  };

  private hideAddPaymentModal = () => {
    this.setState({showAddPaymentModal: false});
  };

  private showAddCreditModal = () => {
    this.setState({showAddCreditNoteModal: true});
  };

  private hideAddCreditModal = () => {
    this.setState({showAddCreditNoteModal: false});
  };

  private onPaymentReceive = () => {
    this.fetchInvoice();
  };

  private revertBackToNotes = () => {
    this.props.history.push(this.props.location.pathname);
  };

  private renderInvoicePayment = (context: IUserContext) => {
    const allowPayment = context.has(Permission.PAYMENTS_RECEIVE);
    const allowAddCreditNote = context.has(Permission.CREDIT_NOTES_MANAGE);

    return this.isPayable() && (allowAddCreditNote || allowPayment) ? (
      <ReferenceBarItem caption="Invoice Payment">
        {allowPayment && <StyledComponents.Link onClick={this.showAddPaymentModal}>Add Payment</StyledComponents.Link>}
        {allowAddCreditNote && (
          <StyledComponents.Link onClick={this.showAddCreditModal}>Add Credit Note</StyledComponents.Link>
        )}
      </ReferenceBarItem>
    ) : (
      undefined
    );
  };

  private isDraft = () => {
    const {financeEntity} = this.props;
    const data = financeEntity.data;
    const status = data.latest_status && data.latest_status.status;
    return status === 'draft';
  };

  private isPayable = () => {
    const {financeEntity} = this.props;
    const data = financeEntity.data;
    return !this.isNew && !this.isDraft() && data.virtual_status !== 'paid';
  };

  private payInvoiceWithCN = async (cn: ICreditNoteListItem) => {
    const {match, dispatch} = this.props;
    const invoiceId = match.params.id;
    const confirm = await dispatch(openModal('Confirm', `Apply Credit Note #${cn.id} to Invoice #${invoiceId}?`));

    if (confirm) {
      const wholeCN = await CreditNotesService.findById(cn.id);
      await CreditNotesService.applyCreditNoteToInvoices(cn.id, [
        {
          invoice_id: +invoiceId,
          amount: wholeCN.data.sub_total
        }
      ]);
    } else {
      throw confirm;
    }
  };

  public render() {
    const {financeEntity, user, invoiceNotes, approvers, tags} = this.props;
    const {showApproveModal, disableApproveButton, showAddPaymentModal, showAddCreditNoteModal} = this.state;

    if ((!financeEntity.ready || financeEntity.loading) && !this.isNew && !this.alreadyLoaded) {
      return <BlockLoading size={40} color={ColorPalette.white} />;
    }

    const data = financeEntity.data;
    const statuses = data!.statuses || [];
    const isMoreThanZeroItems = !!data.items && data.items.length > 0;
    const totalIsLessThanZero = !data.amount_due || (!!data.amount_due && data.amount_due < 0);

    const disableButton = disableApproveButton || !isMoreThanZeroItems || totalIsLessThanZero;

    return (
      <UserContext.Consumer>
        {context => {
          const isEditable = FinanceService.isEditable(
            Permission.INVOICES_MANAGE,
            Permission.INVOICES_MANAGE_LOCKED,
            data,
            context
          );
          const otherActions = this.getDropdownMenuItems(context);
          return (
            <>
              {showAddCreditNoteModal && (
                <ModalPayInvoiceWithCreditNote
                  isOpen={showAddCreditNoteModal}
                  onClose={this.hideAddCreditModal}
                  mode={ModalModes.FromInvoice}
                  onPay={this.payInvoiceWithCN}
                  financeEntity={data as IInvoice}
                />
              )}
              {showApproveModal && (
                <ModalRequestApproval
                  isOpen={showApproveModal}
                  approvers={approvers.data!.data}
                  onSubmit={this.sendApproveRequest}
                  onClose={this.hideApproveModal}
                />
              )}
              {showAddPaymentModal && (
                <AddPaymentModal
                  invoice={data as IInvoice}
                  onPaymentReceive={this.onPaymentReceive}
                  onClose={this.hideAddPaymentModal}
                />
              )}
              <DetailsPageLayout
                sidebarMenuItems={this.getMenuItems()}
                menu={
                  !this.isNew ? (
                    <FinanceItemTopMenu
                      type={FinanceItemTypes.invoice}
                      otherActions={otherActions}
                      onTagClick={this.onTagClick}
                      viewTagsPermission={context.has(Permission.TAGS_VIEW)}
                      onNoteAdd={this.redirectToNotes}
                      addNotePermission={context.has(Permission.INVOICES_MANAGE)}
                      channelName={`online-financeEntity-${data.id}`}
                    />
                  ) : null
                }
                header={
                  <FinanceHeader
                    id={data.id}
                    tags={tags.data!.data || []}
                    isNew={this.isNew}
                    statusList={getFinanceItemStatusList(data as IStatusesEntity)}
                    loadingTags={tags.loading}
                    onTagRemove={this.onRemoveTagClick}
                    entityName="invoice"
                  />
                }
                upperToolsContainer={
                  this.isNoteEditorVisible() ? (
                    <PageContent style={{borderBottom: `1px solid ${ColorPalette.gray2}`}}>
                      <NoteComponent
                        afterSave={this.saveNoteDraft}
                        disableTemplatesControl={true}
                        color={ColorPalette.orange0}
                        onCancel={this.revertBackToNotes}
                      />
                    </PageContent>
                  ) : null
                }
                content={
                  <>
                    <InvoiceDetailsForm
                      onSubmit={this.createOrUpdateInvoice}
                      onUpdate={this.updateInvoice}
                      isInvoice={true}
                      isNew={this.isNew}
                      disabled={!isEditable}
                      initialValues={this.getInitializeFormValues()}
                    />
                    {!this.isNew && (
                      <>
                        <FinanceItems
                          entityType={FinanceEntity.invoice}
                          entity={data}
                          disabled={!isEditable}
                          onCreate={this.createItem}
                          onChange={this.updateItem}
                          onSubmit={this.submitItem}
                          onRemove={this.removeItem}
                        />
                        {context.has(Permission.INVOICES_MANAGE) && this.isDraft() && (
                          <div className="text-right">
                            <PrimaryButton
                              type="button"
                              className="btn"
                              disabled={disableButton}
                              onClick={this.approveInvoice}
                            >
                              {this.allowApprove() ? 'Approve Invoice' : 'Request Approval'}
                            </PrimaryButton>
                          </div>
                        )}
                      </>
                    )}
                  </>
                }
                footer={
                  !this.isNew ? (
                    <div style={{marginTop: '60px'}}>
                      {(this.getSortedNotes().length > 0 || statuses.length > 0) && (
                        <NotesWrapper>
                          <NoteBasedItemsList
                            notes={this.getSortedNotes()}
                            onNoteDelete={this.deleteNote}
                            loading={invoiceNotes.loading}
                            highlightedItemId={this.getHighlightedItem().itemId}
                            user={user}
                            statuses={statuses as any[]}
                            afterEditSuccess={this.loadNotes}
                          />
                        </NotesWrapper>
                      )}
                      <StatusListItem
                        status={Object.assign({status: 'created'}, financeEntity.data as IJobStatus)}
                        itemTypeName="Invoice"
                      />
                    </div>
                  ) : null
                }
                references={
                  context.has(Permission.JOBS_VIEW) && !this.isNew ? (
                    <FinanceReferenceItems
                      entity={data}
                      loading={financeEntity.loading}
                      additionalItems={this.renderInvoicePayment(context)}
                    />
                  ) : (
                    <></>
                  )
                }
              />
            </>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  financeEntity: state.invoice,
  user: state.user
});

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  withData({
    invoiceNotes: {
      fetch: InvoicesService.getInvoiceNotes
    },
    approvers: {
      fetch: InvoicesService.getApproverList,
      initialData: {data: []}
    },
    tags: {
      fetch: InvoicesService.getInvoiceTags,
      initialData: {data: []}
    }
  }),
  connect(mapStateToProps)
)(InvoiceDetailsPage);
