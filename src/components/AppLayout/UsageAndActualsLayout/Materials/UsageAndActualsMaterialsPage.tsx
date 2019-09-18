import * as React from 'react';
import PageContent from 'src/components/Layout/PageContent';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import {IResource} from 'src/components/withData/withData';
import {IMaterialInfo} from 'src/models/UsageAndActualsModels/IMaterial';
import {withRouter} from 'react-router';
import {RouteComponentProps} from 'react-router-dom';
import {ThunkDispatch} from 'redux-thunk';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import moment from 'moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {formatPrice} from 'src/utility/Helpers';
import NumericInput from 'src/components/Form/NumericInput';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {debounce} from 'lodash';
import JobService from 'src/services/JobService';
import ModalJobMaterials, {ModalTypes} from 'src/components/Modal/UsageAndActuals/ModalJobMaterials/ModalJobMaterials';
import {IUser} from 'src/models/IUser';
import {openModal} from 'src/redux/modalDucks';
import {JobStatuses} from 'src/models/IJob';
import ViewJobButton from '../ViewJobButton';
import UsageAndActualsLayout from '../UsageAndActualsLayout';
import UsageTableLayout from '../UsageTableLayout';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {loadJobMaterials, loadJobCostingCounters} from 'src/redux/currentJob/currentJobUsageAndActuals';

const Td = styled.td`
  padding-right: 50px !important;
`;

const ButtonsMaterial = styled.div`
  display: flex;
  flex-direction: row;
`;

interface IParams {
  id: number;
}

interface IConnectProps {
  job: ICurrentJob;
  currentJobMaterials: IResource<IMaterialInfo[]>;
  user: IUser;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  showModal: boolean;
  showEditModal: boolean;
  type: ModalTypes;
  materialForEditing?: IMaterialInfo;
}

type IProps = IConnectProps & RouteComponentProps<IParams>;

class UsageAndActualsMaterialsPage extends React.PureComponent<IProps, IState> {
  public state = {
    showModal: false,
    showEditModal: false,
    type: ModalTypes.Quick,
    materialForEditing: undefined
  };

  public componentDidMount() {
    this.loadMaterials();
  }

  private onOpenModal = () => {
    this.setState({showModal: true});
  };

  private onCloseModal = () => {
    this.setState({showModal: false});
  };

  private onCustomAdd = () => {
    this.setState({
      type: ModalTypes.Custom,
      materialForEditing: undefined
    });
    this.onOpenModal();
  };

  private deleteMaterialFromJob = async (material: IMaterialInfo) => {
    const {
      dispatch,
      match: {
        params: {id}
      }
    } = this.props;
    const res = await dispatch(
      openModal(
        'Confirm',
        `Delete (${material.material.name} - ${material.quantity_used_override} ${
          material.material.measure_unit.name
        }) ?`
      )
    );

    if (res) {
      await JobService.deleteJobMaterial(id, material.id);
      this.loadMaterials();
    }
  };

  private loadMaterials() {
    const {
      dispatch,
      match: {
        params: {id}
      }
    } = this.props;
    dispatch(loadJobMaterials(id));
    dispatch(loadJobCostingCounters(id));
  }

  private editMaterial = (material: IMaterialInfo) => {
    this.setState({materialForEditing: material});
    this.onOpenModal();
  };

  private materialMenuItems = (context: IUserContext, material: IMaterialInfo, jobIsClosed: boolean): IMenuItem[] => {
    const isAuthor = material.creator_id === this.props.user.id;
    const allowEdit = isAuthor
      ? context.has(Permission.JOBS_USAGE_MATERIALS_UPDATE)
      : context.has(Permission.JOBS_USAGE_MATERIALS_UPDATE) && context.has(Permission.JOBS_USAGE_MATERIALS_MANAGE);
    const allowDelete = isAuthor
      ? context.has(Permission.JOBS_USAGE_MATERIALS_DELETE)
      : context.has(Permission.JOBS_USAGE_MATERIALS_DELETE) && context.has(Permission.JOBS_USAGE_MATERIALS_MANAGE);

    return [
      {
        name: 'Edit item',
        disabled: !allowEdit || jobIsClosed,
        onClick: () => this.editMaterial(material)
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        disabled: !allowDelete || jobIsClosed,
        onClick: () => this.deleteMaterialFromJob(material)
      }
    ];
  };

  private onChangeQuantity = async (q: number, materialId: number) => {
    await this.debouncedQuantityUpdate(q, materialId);
  };

  private updateQuantity = async (q: number, materialId: number) => {
    const {
      match: {
        params: {id}
      },
      dispatch
    } = this.props;

    await JobService.updateJobMaterial(id, materialId, {
      quantity_used_override: q
    });
    dispatch(loadJobMaterials(id));
  };

  private debouncedQuantityUpdate = debounce(this.updateQuantity, 1000);

  public renderAdditionalHeaderLayout() {
    const {
      job,
      match: {
        params: {id}
      }
    } = this.props;
    const jobIsClosed = (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;

    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);
          const allowQuickCreate = context.has(Permission.JOBS_USAGE_MATERIALS_CREATE);
          const allowCustomCreate = allowQuickCreate && context.has(Permission.MANAGEMENT_MATERIALS);

          return allowRenderView ? (
            <div>
              <ButtonsMaterial>
                <ViewJobButton jobId={id} />
                {allowCustomCreate && (
                  <PrimaryButton
                    className="btn"
                    disabled={jobIsClosed}
                    onClick={this.onCustomAdd}
                    style={{marginLeft: '10px'}}
                  >
                    Add Material
                  </PrimaryButton>
                )}
              </ButtonsMaterial>
            </div>
          ) : null;
        }}
      </UserContext.Consumer>
    );
  }

  public renderContentPage() {
    const {
      job,
      currentJobMaterials: {data, loading},
      job: {loading: ld},
      user,
      dispatch,
      match: {
        params: {id}
      }
    } = this.props;
    const {showModal, type, materialForEditing} = this.state;
    const jobIsClosed = (job.data && job.data.latest_status.status === JobStatuses.Closed) || !job.data;

    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);
          const allowChangeQuantity =
            context.has(Permission.JOBS_USAGE_MATERIALS_UPDATE) &&
            !jobIsClosed &&
            context.has(Permission.JOBS_USAGE_MATERIALS_MANAGE);

          return allowRenderView ? (
            <>
              {showModal && (
                <ModalJobMaterials
                  type={type}
                  jobId={id}
                  userId={user.id}
                  loadJobMaterialsList={() => dispatch(loadJobMaterials(id))}
                  onClose={this.onCloseModal}
                  isOpen={showModal}
                  material={materialForEditing}
                  dispatch={dispatch}
                />
              )}
              <div className="d-flex h-100 flex-column align-items-stretch">
                {loading && !ld && <BlockLoading size={40} color={ColorPalette.white} />}
                <PageContent style={{minHeight: '100px'}}>
                  {data && data.length > 0 && (
                    <UsageTableLayout>
                      <thead>
                        <tr>
                          <th colSpan={5}>Materials</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data &&
                          data.map((material: IMaterialInfo, index) => (
                            <tr key={index}>
                              <Td style={{whiteSpace: 'nowrap'}}>{moment(material.used_at).format(FRONTEND_DATE)}</Td>
                              <Td style={{width: '100%'}}>{material.material.name}</Td>
                              <Td style={{whiteSpace: 'nowrap'}}>
                                <div className="d-flex align-items-center">
                                  {allowChangeQuantity ? (
                                    <NumericInput
                                      quantity={material.quantity_used_override}
                                      onChange={q => this.onChangeQuantity(q, material.id)}
                                    />
                                  ) : (
                                    material.quantity_used_override
                                  )}
                                  <span style={{marginLeft: '10px'}}>{material.material.measure_unit.name}</span>
                                </div>
                              </Td>
                              <Td style={{whiteSpace: 'nowrap'}}>{formatPrice(material.amount_override)}</Td>
                              <td>
                                <DropdownMenuControl
                                  noMargin={true}
                                  iconName={IconName.MenuVertical}
                                  items={this.materialMenuItems(context, material, jobIsClosed)}
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
          ) : null;
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
  currentJobMaterials: state.currentJobUsageAndActuals.materials,
  user: state.user.me
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(UsageAndActualsMaterialsPage);
