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
  ICreditNoteState,
  loadCreditNote,
  removeItem,
  reset,
  submitItem,
  updateCreditNote,
  updateItem
} from 'src/redux/creditNoteDucks';
import FinanceItems, {FinanceEntity} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceItems';
import {IFormData} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceFormUnwrapped';
import FinanceItemTopMenu, {
  FinanceItemTypes
} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceItemTopMenu';
import CreditNoteDetailsForm from './CreditNoteDetailsForm';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import DetailsPageLayout from 'src/components/Layout/DetailsPageLayout';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import CreditNotesService from 'src/services/CreditNotesService';
import {submissionErrorHandler, VALIDATION_ERROR_CODE} from 'src/services/ReduxFormHelper';
import Notify, {NotifyType} from 'src/utility/Notify';
import {ITag} from 'src/models/ITag';
import PageContent from 'src/components/Layout/PageContent';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import * as qs from 'qs';
import withData, {IResource} from 'src/components/withData/withData';
import {IUserState} from 'src/redux/userDucks';
import {ITagsSuccess} from 'src/services/TagService';
import {IUser} from 'src/models/IUser';
import {IListEnvelope} from 'src/models/IEnvelope';
import {INotesSuccess} from 'src/services/NotesAndMessagesService';
import NoteBasedItemsList from 'src/components/Layout/NoteBasedItemsList';
import StatusListItem from 'src/components/Layout/StatusListItem';
import moment from 'moment';
import ModalRequestApproval, {IFormValues} from 'src/components/Modal/Finance/ModalRequestApproval';
import {openModal} from 'src/redux/modalDucks';
import FinanceReferenceItems from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceReferenceItems';
import {getFinanceItemStatusList, IStatusesEntity} from 'src/utility/Helpers';
import styled from 'styled-components';
import printJS from 'print-js';
import {INote} from 'src/models/INotesAndMessages';
import FinanceService from 'src/services/FinanceService';
import FinanceDetailsPage from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceDetailsPage';
import ReferenceApplyToInvoice from 'src/components/ReferenceBar/CreditNotes/ReferenceApplyToInvoice';
import {ICreditNote} from 'src/models/FinanceModels/ICreditNotes';
import {FinanceEntityStatus} from 'src/constants/FinanceEntityStatus';

const NotesWrapper = styled.div`
  position: relative;
  border-top: 1px solid ${ColorPalette.gray2};
`;

interface IParams {
  id: string;
}

interface IConnectProps {
  financeEntity: ICreditNoteState;
  user: IUserState;
  dispatch: ThunkDispatch<IAppState, unknown, Action>;
}

interface IWithDataProps {
  creditNoteNotes: IResource<INotesSuccess>;
  approvers: IResource<IListEnvelope<IUser>>;
  tags: IResource<ITagsSuccess>;
}

interface IState {
  showApproveModal: boolean;
  disableApproveButton: boolean;
}

type IProps = RouteComponentProps<IParams> & IConnectProps & IWithDataProps;

class CreditNoteDetailsPage extends FinanceDetailsPage<IProps, IState> {
  public state = {
    showApproveModal: false,
    disableApproveButton: false
  };

  private showApproveModal = () => {
    this.setState({showApproveModal: true});
  };

  private hideApproveModal = () => {
    this.setState({showApproveModal: false});
  };

  public componentDidMount() {
    if (!this.isNew) {
      this.fetchCreditNote();
    }

    this.scrollToHighlightedItem(this.getHighlightedItemSelector());
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.match.params.id !== prevProps.match.params.id && !this.isNew) {
      this.fetchCreditNote();
    }

    if (this.notesCounter(this.props) !== this.notesCounter(prevProps)) {
      this.scrollToHighlightedItem(this.getHighlightedItemSelector());
    }
  }

  public componentWillUnmount() {
    this.props.dispatch(reset());
  }

  private notesCounter = (props: IProps) => {
    return props.creditNoteNotes.data ? props.creditNoteNotes.data.data.length : 0;
  };

  private getHighlightedItemSelector = () => {
    let selector;
    const highlightedItem = this.getHighlightedItem();

    if (highlightedItem.note) {
      selector = `note-${highlightedItem.note}`;
    }

    return selector;
  };

  private fetchCreditNote = () => {
    const {dispatch, approvers, tags, match} = this.props;
    const creditNoteId = match.params.id;

    this.loadNotes();
    approvers.fetch(creditNoteId);
    tags.fetch(creditNoteId);

    return dispatch(loadCreditNote(this.props.match.params.id));
  };

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private create = (data: IFormData) => {
    return CreditNotesService.create(data)
      .then(financeEntity => {
        this.props.history.push(`/finance/credit-notes/details/${financeEntity.data.id}`);
      })
      .catch(err => {
        if (err.status_code === VALIDATION_ERROR_CODE) {
          return submissionErrorHandler(err);
        } else {
          return Promise.reject();
        }
      });
  };

  private update = async (data: IFormData) => {
    if (this.isNew) {
      // Do not update on form values changes.
      // There is an explicit submit button
      return Promise.resolve();
    }
    try {
      return await this.props.dispatch(updateCreditNote(+this.props.match.params.id, data));
    } catch (err) {
      if (err.status_code === VALIDATION_ERROR_CODE) {
        return submissionErrorHandler(err);
      } else {
        return Promise.reject();
      }
    }
  };

  private createOrUpdate = (data: IFormData) => {
    return this.isNew ? this.create(data) : this.update(data);
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

  // check to prevent show loader when CN is just updating
  private get alreadyLoaded() {
    return this.props.financeEntity.data.id && +this.props.match.params.id === this.props.financeEntity.data.id;
  }

  private getMenuItems(): IMenuItem[] {
    return [
      {
        path: '/finance/credit-notes/draft',
        icon: IconName.FileEdit,
        isActive: this.isActive('/finance/credit-notes/draft'),
        hint: 'Draft Credit Notes'
      },
      {
        path: '/finance/credit-notes/approved',
        icon: IconName.File,
        isActive: this.isActive('/finance/credit-notes/approved'),
        hint: 'Approved'
      }
    ];
  }

  private duplicateCN = async () => {
    const {
      financeEntity: {data},
      dispatch
    } = this.props;

    if (data) {
      const confirm = await dispatch(openModal('Confirm', `Duplicate credit note #${data.id}?`));

      if (confirm) {
        const res = await CreditNotesService.create(data as IFormData);
        this.props.history.push(`/finance/credit-notes/details/${res.data.id}`);
      }
    }
  };

  private deleteCN = async () => {
    const {
      financeEntity: {data},
      dispatch
    } = this.props;

    if (data) {
      const confirm = await dispatch(openModal('Confirm', `Delete credit note #${data.id}?`));

      if (confirm) {
        await CreditNotesService.remove(data.id!);
        this.props.history.replace('/finance/credit-notes/draft');
      }
    }
  };

  private print = async () => {
    const {
      financeEntity: {data}
    } = this.props;

    if (data) {
      const pdfData = await CreditNotesService.forPrint(data.id!);
      printJS({printable: window.URL.createObjectURL(new Blob([pdfData], {type: 'application/pdf'})), type: 'pdf'});
    }
  };

  private onTagClick = async (tag: ITag) => {
    const {tags, match} = this.props;

    await CreditNotesService.addTag(tag.id, +match.params.id);
    await tags.fetch(+match.params.id);
  };

  private onRemoveTagClick = async (tag: ITag) => {
    const {tags, match} = this.props;

    await CreditNotesService.removeTag(tag.id, +match.params.id);
    await tags.fetch(+match.params.id);
  };

  private getDropdownMenuItems = (context: IUserContext) => {
    const {data} = this.props.financeEntity;
    const items: IDropdownMenuItem[] = [
      {
        name: 'Print',
        onClick: this.print,
        disabled: !context.has(Permission.CREDIT_NOTES_VIEW)
      },
      {
        name: 'Duplicate',
        onClick: this.duplicateCN,
        disabled: !context.has(Permission.CREDIT_NOTES_MANAGE) || !data
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: this.deleteCN,
        disabled: !context.has(Permission.CREDIT_NOTES_MANAGE)
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

    history.push(`/finance/credit-notes/details/${match.params.id}?note=true`);
  };

  private saveNoteDraft = async (note: INote) => {
    const {
      financeEntity: {data},
      match,
      creditNoteNotes
    } = this.props;

    if (data && data.id) {
      await CreditNotesService.addNoteToCreditNote(note.id, data.id);
      creditNoteNotes.fetch(match.params.id);
      this.props.history.replace(`/finance/credit-notes/details/${match.params.id}`);
    }
  };

  private getSortedNotes = () => {
    const {creditNoteNotes} = this.props;

    if (creditNoteNotes.data) {
      return creditNoteNotes.data.data.sort((a: any, b: any) => moment(b.created_at || '').diff(a.created_at || ''));
    }

    return [];
  };

  private deleteNote = async (noteId: string | number) => {
    const {match, creditNoteNotes} = this.props;

    await CreditNotesService.removeNoteFromCreditNote(noteId, match.params.id);
    creditNoteNotes.fetch(match.params.id);
  };

  private sendApproveRequest = async (data: IFormValues) => {
    const {match} = this.props;

    await CreditNotesService.sendApproveRequest(match.params.id, [data.user.id]);
  };

  private allowApprove = () => {
    const {user, financeEntity} = this.props;

    return (
      (+user.me!.credit_note_approval_limit || 0) >= +(financeEntity.data.total_amount || 0) &&
      !!financeEntity.data.location &&
      user.locations.map(el => +el.id).includes(+financeEntity.data.location.id)
    );
  };

  private approveCreditNote = async () => {
    const {dispatch, match} = this.props;

    if (this.allowApprove()) {
      const res = await dispatch(openModal('Confirm', `Approve Credit Note #${match.params.id}?`));

      if (res) {
        this.setState({disableApproveButton: true});

        try {
          await CreditNotesService.approveCreditNote(match.params.id);
          Notify(NotifyType.Success, 'Credit note approved successfully');
          await this.fetchCreditNote();
        } catch (e) {
          Notify(NotifyType.Danger, "Credit note can't be approved");
        } finally {
          this.setState({disableApproveButton: false});
        }
      }
    } else {
      this.showApproveModal();
    }
  };

  private revertBackToNotes = () => {
    this.props.history.push(this.props.location.pathname);
  };

  private loadNotes = () => {
    const {match, creditNoteNotes} = this.props;

    creditNoteNotes.fetch(match.params.id);
  };

  private renderApplyToInvoice = (context: IUserContext) => {
    const {financeEntity} = this.props;
    return financeEntity.data.latest_status!.status === FinanceEntityStatus.approved &&
      !financeEntity.data.payment_id &&
      context.has(Permission.CREDIT_NOTES_MANAGE) ? (
      <ReferenceApplyToInvoice creditNote={financeEntity.data as ICreditNote} loadCreditNote={this.fetchCreditNote} />
    ) : (
      undefined
    );
  };

  public render() {
    const {financeEntity, user, creditNoteNotes, tags, approvers} = this.props;
    const {showApproveModal, disableApproveButton} = this.state;

    if ((!financeEntity.ready || financeEntity.loading) && !this.isNew && !this.alreadyLoaded) {
      return <BlockLoading size={40} color={ColorPalette.white} />;
    }

    const data = financeEntity.data;
    const statuses = data!.statuses || [];
    const status = data.latest_status && data.latest_status.status;
    const isDraft = status === 'draft';
    const isMoreThanZeroItems = !!data.items && data.items.length > 0;
    const totalIsLessThanZero = !data.total_amount || (!!data.total_amount && data.total_amount < 0);
    const disableButton = disableApproveButton || !isMoreThanZeroItems || totalIsLessThanZero;

    return (
      <UserContext.Consumer>
        {context => {
          const otherActions = this.getDropdownMenuItems(context);
          const isEditable = FinanceService.isEditable(
            Permission.CREDIT_NOTES_MANAGE,
            Permission.CREDIT_NOTES_MANAGE_LOCKED,
            data,
            context
          );

          return (
            <>
              {showApproveModal && (
                <ModalRequestApproval
                  isOpen={showApproveModal}
                  approvers={approvers.data!.data}
                  onSubmit={this.sendApproveRequest}
                  onClose={this.hideApproveModal}
                />
              )}
              <DetailsPageLayout
                sidebarMenuItems={this.getMenuItems()}
                menu={
                  this.isNew ? null : (
                    <>
                      <FinanceItemTopMenu
                        type={FinanceItemTypes.credit_note}
                        otherActions={otherActions}
                        onTagClick={this.onTagClick}
                        viewTagsPermission={context.has(Permission.TAGS_VIEW)}
                        onNoteAdd={this.redirectToNotes}
                        addNotePermission={context.has(Permission.CREDIT_NOTES_MANAGE)}
                        channelName={`online-credit-note-${data.id}`}
                      />
                    </>
                  )
                }
                header={
                  <FinanceHeader
                    id={data.id}
                    tags={tags.data!.data}
                    isNew={this.isNew}
                    statusList={getFinanceItemStatusList(data as IStatusesEntity)}
                    loadingTags={tags.loading}
                    onTagRemove={this.onRemoveTagClick}
                    entityName="credit note"
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
                    <CreditNoteDetailsForm
                      onSubmit={this.createOrUpdate}
                      onUpdate={this.update}
                      isNew={this.isNew}
                      disabled={!isEditable}
                      initialValues={this.getInitializeFormValues()}
                    />
                    {!this.isNew && (
                      <>
                        <FinanceItems
                          entityType={FinanceEntity.creditNote}
                          entity={data}
                          disabled={!isEditable}
                          onCreate={this.createItem}
                          onChange={this.updateItem}
                          onSubmit={this.submitItem}
                          onRemove={this.removeItem}
                        />
                        {context.has(Permission.CREDIT_NOTES_MANAGE) && isDraft && (
                          <div className="text-right">
                            <PrimaryButton
                              type="button"
                              className="btn"
                              disabled={disableButton}
                              onClick={this.approveCreditNote}
                            >
                              {this.allowApprove() ? 'Approve Credit Note' : 'Request Approval'}
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
                            loading={creditNoteNotes.loading}
                            highlightedItemId={this.getHighlightedItem().itemId}
                            user={user}
                            statuses={statuses as any[]}
                            afterEditSuccess={this.loadNotes}
                          />
                        </NotesWrapper>
                      )}
                      <StatusListItem
                        status={Object.assign({status: 'created'}, financeEntity.data as IJobStatus)}
                        itemTypeName="Credit note"
                      />
                    </div>
                  ) : null
                }
                references={
                  context.has(Permission.JOBS_VIEW) && !this.isNew ? (
                    <FinanceReferenceItems
                      entity={data}
                      loading={financeEntity.loading}
                      additionalItems={this.renderApplyToInvoice(context)}
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
  financeEntity: state.creditNote,
  user: state.user
});

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  withData({
    creditNoteNotes: {
      fetch: CreditNotesService.getCreditNoteNotes
    },
    approvers: {
      fetch: CreditNotesService.getApproverList,
      initialData: {data: []}
    },
    tags: {
      fetch: CreditNotesService.getCreditNoteTags,
      initialData: {data: []}
    }
  }),
  connect(mapStateToProps)
)(CreditNoteDetailsPage);
