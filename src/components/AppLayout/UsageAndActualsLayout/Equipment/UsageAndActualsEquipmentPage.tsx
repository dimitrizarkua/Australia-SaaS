import * as React from 'react';
import UsageAndActualsLayout from '../UsageAndActualsLayout';
import ViewJobButton from 'src/components/AppLayout/UsageAndActualsLayout/ViewJobButton';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {RouteComponentProps, withRouter} from 'react-router';
import PageContent from 'src/components/Layout/PageContent';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import styled from 'styled-components';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {JobStatuses} from 'src/models/IJob';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import UsageTableLayout from 'src/components/AppLayout/UsageAndActualsLayout/UsageTableLayout';
import {FRONTEND_DATE} from 'src/constants/Date';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import {IResource} from 'src/components/withData/withData';
import moment, {unitOfTime} from 'moment';
import JobService from 'src/services/JobService';
import {openModal} from 'src/redux/modalDucks';
import {IEquipmentInfo} from 'src/models/UsageAndActualsModels/IEquipment';
import ModalJobEquipments from 'src/components/Modal/UsageAndActuals/ModalJobEquipments/ModalJobEquipment';
import {formatPrice} from 'src/utility/Helpers';
import Tag from 'src/components/Tag/Tag';
import {ITag} from 'src/models/ITag';
import Typography from 'src/constants/Typography';
import {loadJobEquipments, loadJobCostingCounters} from 'src/redux/currentJob/currentJobUsageAndActuals';

const SiteTag = styled(Tag)`
  vertical-align: top;
`;

const ButtonsEquipment = styled.div`
  display: flex;
  flex-direction: row;
`;

const TdNoWrap = styled.td`
  padding-right: 50px !important;
`;

const SubLabel = styled.span`
  color: ${ColorPalette.gray5};
  font-size: ${Typography.size.smaller};
`;

interface IParams {
  id: number;
}

interface IConnectProps {
  job: ICurrentJob;
  currentJobEquipments: IResource<IEquipmentInfo[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  showModal: boolean;
  showEditModal: boolean;
  equipmentForEditing?: IEquipmentInfo;
}

type IProps = IConnectProps & RouteComponentProps<IParams>;

class UsageAndActualsEquipmentPage extends React.PureComponent<IProps, IState> {
  public state: IState = {
    showModal: false,
    showEditModal: false,
    equipmentForEditing: undefined
  };

  public componentDidMount() {
    this.loadEquipments();
  }

  private onOpenModal = () => {
    this.setState({showModal: true});
  };

  private onCloseModal = () => {
    this.setState({showModal: false});
  };

  private onCustomAdd = () => {
    this.setState({
      equipmentForEditing: undefined
    });
    this.onOpenModal();
  };

  private deleteEquipmentFromJob = async (equipment: IEquipmentInfo) => {
    const {
      dispatch,
      match: {
        params: {id}
      }
    } = this.props;
    const res = await dispatch(openModal('Confirm', `Delete Equipment: ${equipment.equipment.model} ?`));

    if (res) {
      await JobService.deleteJobEquipment(id, equipment.id);
      this.loadEquipments();
    }
  };

  private editEquipment = (equipment: IEquipmentInfo) => {
    this.setState({equipmentForEditing: equipment});
    this.onOpenModal();
  };

  // TODO: Add implementation of Mark as used
  // private markAsUsed = (equipment: IEquipmentInfo) => {
  //   // TODO Add Mark as used handling
  //   console.log('Marked as used: ', equipment.equipment.model);
  // };

  private loadEquipments() {
    const {
      dispatch,
      match: {
        params: {id}
      }
    } = this.props;
    dispatch(loadJobEquipments(id));
    dispatch(loadJobCostingCounters(id));
  }

  private equipmentMenuItems = (
    context: IUserContext,
    equipment: IEquipmentInfo,
    jobIsClosed: boolean
  ): IMenuItem[] => {
    const allowEdit =
      context.has(Permission.JOBS_USAGE_EQUIPMENT_UPDATE) && context.has(Permission.JOBS_USAGE_EQUIPMENT_MANAGE);
    const allowDelete =
      context.has(Permission.JOBS_USAGE_EQUIPMENT_DELETE) && context.has(Permission.JOBS_USAGE_EQUIPMENT_MANAGE);

    return [
      {
        name: 'Edit item',
        disabled: !allowEdit || jobIsClosed,
        onClick: () => this.editEquipment(equipment)
      },
      // TODO: Add implementation of Mark as used
      // {
      //   name: 'Mark as used',
      //   disabled: !allowEdit || jobIsClosed,
      //   onClick: () => this.markAsUsed(equipment)
      // },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        disabled: !allowDelete || jobIsClosed,
        onClick: () => this.deleteEquipmentFromJob(equipment)
      }
    ];
  };

  private renderOnSiteTag(equipment: IEquipmentInfo) {
    const onSiteTagLabel = equipment.ended_at ? '' : 'on-site';

    return (
      <SiteTag
        tag={
          {
            name: onSiteTagLabel,
            color: ColorPalette.orange1
          } as ITag
        }
        key={status}
      />
    );
  }

  private renderOnSiteLabel(equipment: IEquipmentInfo) {
    const dateTo = equipment.ended_at ? equipment.ended_at : new Date();

    let onSiteLabel = '';
    if (equipment.interval === 'each') {
      onSiteLabel = 'Each';
    } else {
      const diffDays = moment(dateTo).diff(moment(equipment.started_at), equipment.interval as unitOfTime.Diff);
      const interval = diffDays > 1 ? equipment.interval + 's' : equipment.interval;
      onSiteLabel = diffDays || diffDays >= 0 ? `${diffDays + 1} ${interval} onsite` : '';
    }

    const onSiteSubLabel = equipment.ended_at
      ? `${moment(equipment.started_at).format('DD MMM')} - ${moment(equipment.ended_at).format('DD MMM')}`
      : '';

    return (
      <>
        {onSiteSubLabel ? (
          <div className="d-flex flex-column">
            <span>{onSiteLabel}</span>
            <SubLabel>{onSiteSubLabel}</SubLabel>
          </div>
        ) : (
          <span>{onSiteLabel}</span>
        )}
      </>
    );
  }

  public renderAdditionalHeaderLayout() {
    const {
      match: {
        params: {id}
      }
    } = this.props;
    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);
          const allowCustomCreate = context.has(Permission.JOBS_USAGE_EQUIPMENT_CREATE);

          return allowRenderView ? (
            <div>
              <ButtonsEquipment>
                <ViewJobButton jobId={id} />
                {allowCustomCreate && (
                  <PrimaryButton className="btn" onClick={this.onCustomAdd} style={{marginLeft: '10px'}}>
                    Add Equipment
                  </PrimaryButton>
                )}
              </ButtonsEquipment>
            </div>
          ) : null;
        }}
      </UserContext.Consumer>
    );
  }

  public renderContentPage() {
    const {
      job,
      currentJobEquipments: {data, loading},
      job: {loading: ld},
      match: {
        params: {id}
      },
      dispatch
    } = this.props;
    const {showModal, equipmentForEditing} = this.state;
    const jobIsClosed = (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;

    return (
      <UserContext.Consumer>
        {context => {
          return (
            <>
              {showModal && (
                <ModalJobEquipments
                  jobId={id}
                  dispatch={dispatch}
                  onClose={this.onCloseModal}
                  isOpen={showModal}
                  equipment={equipmentForEditing}
                />
              )}
              <div className="d-flex h-100 flex-column align-items-stretch">
                {loading && !ld && <BlockLoading size={40} color={ColorPalette.white} />}
                <PageContent style={{minHeight: '100px'}}>
                  {data && data.length > 0 && (
                    <UsageTableLayout>
                      <thead>
                        <tr>
                          <th colSpan={7}>Equipment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data &&
                          data.map((equipment: IEquipmentInfo, index) => (
                            <tr key={index}>
                              <TdNoWrap style={{whiteSpace: 'nowrap'}}>
                                {moment(equipment.started_at).format(FRONTEND_DATE)}
                              </TdNoWrap>
                              <TdNoWrap style={{width: '100%'}}>{equipment.equipment.model}</TdNoWrap>
                              <td style={{whiteSpace: 'nowrap', paddingRight: '20px !important'}}>
                                {this.renderOnSiteTag(equipment)}
                              </td>
                              <TdNoWrap style={{whiteSpace: 'nowrap'}}>{this.renderOnSiteLabel(equipment)}</TdNoWrap>
                              <TdNoWrap style={{whiteSpace: 'nowrap'}}>{formatPrice(equipment.total_charge)}</TdNoWrap>
                              <TdNoWrap style={{whiteSpace: 'nowrap'}}>
                                {/* TODO: Add correct Mark as Used handling.*/}
                                {/* <ColoredIcon name={IconName.Check} color={ColorPalette.green0} /> */}
                              </TdNoWrap>
                              <td>
                                <DropdownMenuControl
                                  noMargin={true}
                                  iconName={IconName.MenuVertical}
                                  items={this.equipmentMenuItems(context, equipment, jobIsClosed)}
                                  direction="right"
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </UsageTableLayout>
                  )}
                </PageContent>
              </div>
            </>
          );
        }}
      </UserContext.Consumer>
    );
  }

  public render() {
    return (
      <UsageAndActualsLayout
        contentLayout={this.renderContentPage()}
        additionalHeaderLayout={this.renderAdditionalHeaderLayout()}
      />
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  job: state.currentJob,
  currentJobEquipments: state.currentJobUsageAndActuals.equipments
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(UsageAndActualsEquipmentPage);
