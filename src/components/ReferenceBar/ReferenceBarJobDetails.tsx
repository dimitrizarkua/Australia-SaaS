import * as React from 'react';
import ReferenceBarItem from './ReferenceBarItem';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import styled from 'styled-components';
import {IContactAssignment, IJob, ILinkedJob} from 'src/models/IJob';
import LinkedJobItem from './LinkedJobItem';
import {withRouter} from 'react-router';
import {RouteComponentProps, Link} from 'react-router-dom';
import ModalLinkJobs from '../Modal/Jobs/ModalLinkJobs';
import ModalMergeJobs from '../Modal/Jobs/ModalMergeJobs';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {openModal} from 'src/redux/modalDucks';
import JobService from 'src/services/JobService';
import Notify, {NotifyType} from 'src/utility/Notify';

interface IProps {
  job: IJob;
  showJobLink?: boolean;
  withoutActions?: boolean;
  contacts: IContactAssignment[];
  loading?: boolean;
}

interface IParams {
  id?: string;
  type?: string;
  category?: string;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

const ListBlock = styled.div`
  ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }
`;

const JobDetailSubheader = styled.div`
  margin-top: 15px;
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.smaller};
`;

const ActionLinks = styled.div`
  margin-top: 20px;
`;

const NoLinkedJobs = styled.div`
  color: ${ColorPalette.gray5};
`;

const {Link: CustomLink} = StyledComponents;

interface IState {
  stateLinkJobsModal: boolean;
  stateMergeJobsModal: boolean;
  isDuplicating: boolean;
}

class ReferenceBarJobDetails extends React.PureComponent<
  RouteComponentProps<IParams> & IProps & IConnectProps,
  IState
> {
  public state = {
    stateLinkJobsModal: false,
    stateMergeJobsModal: false,
    isDuplicating: false
  };

  private openModal = (type: keyof IState) => {
    this.setState({[type]: true} as Pick<IState, keyof IState>);
  };

  private closeModal = (type: keyof IState) => {
    this.setState({[type]: false} as Pick<IState, keyof IState>);
  };

  private duplicateJob = async () => {
    const {
      dispatch,
      job,
      match: {
        params: {id}
      },
      location,
      history
    } = this.props;
    const savedPath = location.pathname;

    if (job && +job.id === +id!) {
      const res = await dispatch(openModal('Confirm', `Duplicate job #${job.id}?`));

      if (res) {
        this.setState({isDuplicating: true});

        try {
          const {data: newJob} = await JobService.duplicateJob(job.id);

          if (this.props.history.location.pathname === savedPath) {
            history.push(`/job/${newJob.id}/details`);
          } else {
            Notify(NotifyType.Success, `New job #${newJob.id} has been created (duplicate of #${job.id})`);
          }
        } catch (e) {
          Notify(NotifyType.Danger, "This job can't be duplicated");
        } finally {
          this.setState({isDuplicating: false});
        }
      }
    }
  };

  public render() {
    const {job, contacts, withoutActions, showJobLink} = this.props;
    const invoiceTo = contacts.find(c => c.invoice_to);
    const {stateLinkJobsModal, stateMergeJobsModal, isDuplicating} = this.state;

    return (
      <UserContext.Consumer>
        {context => (
          <>
            <ReferenceBarItem caption="Job Details" collapsable={true}>
              {showJobLink && job.id && <Link to={`/job/${job.id}/details`}>{JobService.getJobName(job)}</Link>}
              {invoiceTo && <div>Invoice to: {invoiceTo.assignment_type.name}</div>}
              {job.insurer && <div>Insurer: {job.insurer.legal_name}</div>}
              {job.claim_number && <div>Claim No. {job.claim_number}</div>}
              <div>{job.claim_type && <span>({job.claim_type.value})</span>}</div>
              {job.assigned_to.length > 0 && (
                <ListBlock>
                  <JobDetailSubheader>Assigned To</JobDetailSubheader>
                  <ul>
                    {job.assigned_to.map(user => (
                      <li key={`${user.id}_${user.type}`}>{user.name}</li>
                    ))}
                  </ul>
                </ListBlock>
              )}
              <ListBlock>
                <JobDetailSubheader>Linked Jobs</JobDetailSubheader>
                {job.linked_jobs.length ? (
                  job.linked_jobs.map((j: ILinkedJob) => (
                    <LinkedJobItem
                      key={j.id}
                      linkedJob={j}
                      jobId={job.id}
                      disabled={!context.has(Permission.JOBS_MANAGE_JOBS) || !!withoutActions}
                    />
                  ))
                ) : (
                  <NoLinkedJobs>No linked jobs</NoLinkedJobs>
                )}
              </ListBlock>
              {!withoutActions && (
                <ActionLinks>
                  {context.has(Permission.JOBS_MANAGE_JOBS) && (
                    <CustomLink onClick={() => this.openModal('stateLinkJobsModal')}>Link to other job</CustomLink>
                  )}
                  {context.has(Permission.JOBS_CREATE) && (
                    <CustomLink disabled={isDuplicating} onClick={isDuplicating ? undefined : this.duplicateJob}>
                      Duplicate this job
                    </CustomLink>
                  )}
                  {context.has(Permission.JOBS_MANAGE_JOBS) && (
                    <CustomLink onClick={() => this.openModal('stateMergeJobsModal')}>Merge with job</CustomLink>
                  )}
                </ActionLinks>
              )}
            </ReferenceBarItem>
            {stateLinkJobsModal && (
              <ModalLinkJobs isOpen={stateLinkJobsModal} onClose={() => this.closeModal('stateLinkJobsModal')} />
            )}
            {stateMergeJobsModal && (
              <ModalMergeJobs
                isOpen={stateMergeJobsModal}
                onClose={() => this.closeModal('stateMergeJobsModal')}
                sourceJobId={job.id}
              />
            )}
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<IProps>>(
  withRouter,
  connect()
)(ReferenceBarJobDetails);

export const InternalReferenceBarJobDetails = ReferenceBarJobDetails;
