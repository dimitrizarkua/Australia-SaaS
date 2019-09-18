import * as React from 'react';
import {IMenuItem} from 'src/components/SidebarMenu/SidebarMenu';
import {IMenuItem as IDropdownMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import {matchPath, RouteComponentProps, RouteProps, withRouter} from 'react-router';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {IJobStatus} from 'src/models/IJob';
import Permission from 'src/constants/Permission';
import FinanceHeader from '../FinanceComponents/FinanceHeader';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ThunkDispatch} from 'redux-thunk';
import {
  IPurchaseOrderState,
  loadPurchaseOrder,
  updatePurchaseOrder,
  reset,
  createItem,
  removeItem,
  submitItem,
  updateItem
} from 'src/redux/purchaseOrderDucks';
import FinanceItems, {FinanceEntity} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceItems';
import {IFormData} from '../FinanceComponents/FinanceFormUnwrapped';
import FinanceItemTopMenu, {
  FinanceItemTypes
} from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceItemTopMenu';
import PurchaseOrderDetailsForm from './PurchaseOrderDetailsForm';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import DetailsPageLayout from 'src/components/Layout/DetailsPageLayout';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import PurchaseOrdersService from 'src/services/PurchaseOrdersService';
import {submissionErrorHandler, VALIDATION_ERROR_CODE} from 'src/services/ReduxFormHelper';
import Notify, {NotifyType} from 'src/utility/Notify';
import {ITag} from 'src/models/ITag';
import PageContent from 'src/components/Layout/PageContent';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import * as qs from 'qs';
import {IUserState} from 'src/redux/userDucks';
import withData, {IResource} from 'src/components/withData/withData';
import {INotesSuccess} from 'src/services/NotesAndMessagesService';
import NoteBasedItemsList from 'src/components/Layout/NoteBasedItemsList';
import StatusListItem from 'src/components/Layout/StatusListItem';
import moment from 'moment';
import ModalRequestApproval, {IFormValues} from 'src/components/Modal/Finance/ModalRequestApproval';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IUser} from 'src/models/IUser';
import {openModal} from 'src/redux/modalDucks';
import {ITagsSuccess} from 'src/services/TagService';
import FinanceReferenceItems from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceReferenceItems';
import {getFinanceItemStatusList, IStatusesEntity} from 'src/utility/Helpers';
import styled from 'styled-components';
import printJS from 'print-js';
import {INote} from 'src/models/INotesAndMessages';
import FinanceService from 'src/services/FinanceService';
import FinanceDetailsPage from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceDetailsPage';

const NotesWrapper = styled.div`
  position: relative;
  border-top: 1px solid ${ColorPalette.gray2};
`;

interface IParams {
  id: string;
}

interface IConnectProps {
  financeEntity: IPurchaseOrderState;
  user: IUserState;
  dispatch: ThunkDispatch<IAppState, unknown, Action>;
}

interface IWithDataProps {
  poNotes: IResource<INotesSuccess>;
  approvers: IResource<IListEnvelope<IUser>>;
  tags: IResource<ITagsSuccess>;
}

interface IState {
  showApproveModal: boolean;
  disableApproveButton: boolean;
}

type IProps = RouteComponentProps<IParams> & IConnectProps & IWithDataProps;

class PurchaseOrderDetailsPage extends FinanceDetailsPage<IProps, IState> {
  public state = {
    showApproveModal: false,
    disableApproveButton: false
  };

  private set showApproveModal(showApproveModal: boolean) {
    this.setState({showApproveModal});
  }

  public componentDidMount() {
    if (!this.isNew) {
      this.fetchPurchaseOrder();
      this.fetchCurrentTags();
    }

    this.scrollToHighlightedItem(this.getHighlightedItemSelector());
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.match.params.id !== prevProps.match.params.id && !this.isNew) {
      this.fetchPurchaseOrder();
    }

    if (this.notesCounter(this.props) !== this.notesCounter(prevProps)) {
      this.scrollToHighlightedItem(this.getHighlightedItemSelector());
    }
  }

  public componentWillUnmount() {
    this.props.dispatch(reset());
  }

  private notesCounter = (props: IProps) => {
    return props.poNotes.data ? props.poNotes.data.data.length : 0;
  };

  private getHighlightedItemSelector = () => {
    let selector;
    const highlightedItem = this.getHighlightedItem();

    if (highlightedItem.note) {
      selector = `note-${highlightedItem.note}`;
    }

    return selector;
  };

  private fetchPurchaseOrder() {
    const {dispatch, approvers, match} = this.props;

    this.loadNotes();
    approvers.fetch(match.params.id);

    return dispatch(loadPurchaseOrder(match.params.id));
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private create = (data: IFormData) => {
    return PurchaseOrdersService.create(data)
      .then(financeEntity => {
        this.props.history.push(`/finance/purchase-orders/details/${financeEntity.data.id}`);
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
      return await this.props.dispatch(updatePurchaseOrder(+this.props.match.params.id, data));
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

  private approvePurchaseOrder = async () => {
    const {dispatch, match} = this.props;

    if (this.allowApprove()) {
      const res = await dispatch(openModal('Confirm', `Approve Purchase Order #${match.params.id}?`));

      if (res) {
        this.setState({disableApproveButton: true});

        try {
          await PurchaseOrdersService.approvePurchaseOrder(match.params.id);
          Notify(NotifyType.Success, 'Purchase order approved successfully');
          await this.fetchPurchaseOrder();
        } catch (e) {
          Notify(NotifyType.Danger, "Purchase order can't be approved");
        } finally {
          this.setState({disableApproveButton: false});
        }
      }
    } else {
      this.showApproveModal = true;
    }
  };

  // check to prevent show loader when PO is just updating
  private get alreadyLoaded() {
    return this.props.financeEntity.data.id && +this.props.match.params.id === this.props.financeEntity.data.id;
  }

  private getMenuItems(): IMenuItem[] {
    return [
      {
        path: '/finance/purchase-orders/draft',
        icon: IconName.FileEdit,
        isActive: this.isActive('/finance/purchase-orders/draft'),
        hint: 'Drafts Purchase Orders'
      },
      {
        path: '/finance/purchase-orders/all',
        icon: IconName.File,
        isActive: this.isActive('/finance/purchase-orders/all'),
        hint: 'All Purchase Orders'
      }
    ];
  }

  private duplicatePO = async () => {
    const {
      financeEntity: {data},
      dispatch
    } = this.props;

    if (data) {
      const confirm = await dispatch(openModal('Confirm', `Duplicate purchase order #${data.id}?`));

      if (confirm) {
        const res = await PurchaseOrdersService.create(data as IFormData);
        this.props.history.push(`/finance/purchase-orders/details/${res.data.id}`);
      }
    }
  };

  private deletePO = async () => {
    const {
      financeEntity: {data},
      dispatch
    } = this.props;

    if (data) {
      const confirm = await dispatch(openModal('Confirm', `Delete purchase order #${data.id}?`));

      if (confirm) {
        await PurchaseOrdersService.remove(data.id!);
        this.props.history.replace('/finance/invoices/draft');
      }
    }
    this.props.history.replace('/finance/purchase-orders/draft');
  };

  private print = async () => {
    const {
      financeEntity: {data}
    } = this.props;

    if (data) {
      const pdfData = await PurchaseOrdersService.forPrint(data.id!);
      printJS({printable: window.URL.createObjectURL(new Blob([pdfData], {type: 'application/pdf'})), type: 'pdf'});
    }
  };

  private onTagClick = async (tag: ITag) => {
    const {match} = this.props;

    await PurchaseOrdersService.addTag(tag.id, +match.params.id);
    await this.fetchCurrentTags();
  };

  private fetchCurrentTags = () => {
    const {tags, match} = this.props;
    return tags.fetch(+match.params.id);
  };

  private onRemoveTagClick = async (tag: ITag) => {
    const {match} = this.props;

    await PurchaseOrdersService.removeTag(tag.id, +match.params.id);
    await this.fetchCurrentTags();
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
        onClick: this.duplicatePO,
        disabled: !context.has(Permission.PURCHASE_ORDERS_MANAGE) || !data
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: this.deletePO,
        disabled: !context.has(Permission.PURCHASE_ORDERS_MANAGE)
      }
    ];
    return items;
  };

  private isNoteEditorVisible = () => {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});

    return params.note === 'true';
  };

  private saveNoteDraft = async (note: INote) => {
    const {
      financeEntity: {data},
      match,
      poNotes
    } = this.props;

    if (data && data.id) {
      await PurchaseOrdersService.addNoteToPurchaseOrder(note.id, data.id);
      poNotes.fetch(match.params.id);
      this.props.history.replace(`/finance/purchase-orders/details/${match.params.id}`);
    }
  };

  private redirectToNotes = () => {
    const {history, match} = this.props;

    history.push(`/finance/purchase-orders/details/${match.params.id}?note=true`);
  };

  private getSortedNotes = () => {
    const {poNotes} = this.props;

    if (poNotes.data) {
      return poNotes.data.data.sort((a: any, b: any) => moment(b.created_at || '').diff(a.created_at || ''));
    }

    return [];
  };

  private deleteNote = async (noteId: string | number) => {
    const {match, poNotes} = this.props;

    await PurchaseOrdersService.removeNoteFromPurchaseOrder(noteId, match.params.id);
    poNotes.fetch(match.params.id);
  };

  private allowApprove = () => {
    const {user, financeEntity} = this.props;

    return (
      +user.me!.purchase_order_approve_limit >= +(financeEntity.data.total_amount || 0) &&
      !!financeEntity.data.location &&
      user.locations.map(el => +el.id).includes(+financeEntity.data.location.id)
    );
  };

  private sendApproveRequest = async (data: IFormValues) => {
    const {match} = this.props;

    await PurchaseOrdersService.sendApproveRequest(match.params.id, [data.user.id]);
  };

  private loadNotes = () => {
    const {match, poNotes} = this.props;

    poNotes.fetch(match.params.id);
  };

  private revertBackToNotes = () => {
    this.props.history.push(this.props.location.pathname);
  };

  public render() {
    const {financeEntity, poNotes, user, approvers, tags} = this.props;
    const {showApproveModal, disableApproveButton} = this.state;

    if ((!financeEntity.ready || financeEntity.loading) && !this.isNew && !this.alreadyLoaded) {
      return <BlockLoading size={40} color={ColorPalette.white} />;
    }

    const data = financeEntity.data;
    const status = data.latest_status && data.latest_status.status;
    const isDraft = status === 'draft';
    const isMoreThanZeroItems = !!data.items && data.items.length > 0;
    const statuses = data!.statuses || [];
    const totalIsLessThanZero = !data.total_amount || (!!data.total_amount && data.total_amount < 0);
    const disableButton = disableApproveButton || !isMoreThanZeroItems || totalIsLessThanZero;

    return (
      <UserContext.Consumer>
        {context => {
          const otherActions = this.getDropdownMenuItems(context);
          const isEditable = FinanceService.isEditable(
            Permission.PURCHASE_ORDERS_MANAGE,
            Permission.PURCHASE_ORDERS_MANAGE_LOCKED,
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
                  onClose={() => (this.showApproveModal = false)}
                />
              )}
              <DetailsPageLayout
                sidebarMenuItems={this.getMenuItems()}
                menu={
                  !this.isNew ? (
                    <FinanceItemTopMenu
                      type={FinanceItemTypes.purchase_order}
                      otherActions={otherActions}
                      onTagClick={this.onTagClick}
                      viewTagsPermission={context.has(Permission.TAGS_VIEW)}
                      onNoteAdd={this.redirectToNotes}
                      addNotePermission={context.has(Permission.PURCHASE_ORDERS_MANAGE)}
                      channelName={`online-purchase-order-${data.id}`}
                    />
                  ) : null
                }
                header={
                  <FinanceHeader
                    id={data.id}
                    tags={tags.data!.data}
                    isNew={this.isNew}
                    statusList={getFinanceItemStatusList(data as IStatusesEntity)}
                    loadingTags={tags.loading}
                    onTagRemove={this.onRemoveTagClick}
                    entityName="purchase order"
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
                    <PurchaseOrderDetailsForm
                      onSubmit={this.createOrUpdate}
                      onUpdate={this.update}
                      isNew={this.isNew}
                      disabled={!isEditable}
                      initialValues={this.getInitializeFormValues()}
                    />
                    {!this.isNew && (
                      <>
                        <FinanceItems
                          entityType={FinanceEntity.purchaseOrder}
                          entity={data}
                          disabled={!isEditable}
                          onCreate={this.createItem}
                          onChange={this.updateItem}
                          onSubmit={this.submitItem}
                          onRemove={this.removeItem}
                        />
                        {context.has(Permission.PURCHASE_ORDERS_MANAGE) && isDraft && (
                          <div className="text-right">
                            <PrimaryButton
                              type="button"
                              className="btn"
                              disabled={disableButton}
                              onClick={this.approvePurchaseOrder}
                            >
                              {this.allowApprove() ? 'Approve Purchase Order' : 'Request Approval'}
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
                            loading={poNotes.loading}
                            highlightedItemId={this.getHighlightedItem().itemId}
                            user={user}
                            statuses={statuses as any[]}
                            afterEditSuccess={this.loadNotes}
                          />
                        </NotesWrapper>
                      )}
                      <StatusListItem
                        status={Object.assign({status: 'created'}, financeEntity.data as IJobStatus)}
                        itemTypeName="Purchase order"
                      />
                    </div>
                  ) : null
                }
                references={
                  context.has(Permission.JOBS_VIEW) && !this.isNew ? (
                    <FinanceReferenceItems entity={data} loading={financeEntity.loading} />
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
  financeEntity: state.purchaseOrder,
  user: state.user
});

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  withData({
    poNotes: {
      fetch: PurchaseOrdersService.getPurchaseOrderNotes
    },
    approvers: {
      fetch: PurchaseOrdersService.getApproverList,
      initialData: {data: []}
    },
    tags: {
      fetch: PurchaseOrdersService.getPurchaseOrderTags,
      initialData: {data: []}
    }
  }),
  connect(mapStateToProps)
)(PurchaseOrderDetailsPage);
