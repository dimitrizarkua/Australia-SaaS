import * as React from 'react';
import {ILinkedJob} from 'src/models/IJob';
import styled from 'styled-components';
import JobService from 'src/services/JobService';
import {Link} from 'react-router-dom';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {connect} from 'react-redux';
import {unlinkJob} from 'src/redux/currentJob/currentJobDucks';

interface IProps {
  jobId: number;
  linkedJob: ILinkedJob;
  disabled: boolean;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

const InlineActionLink = styled(Link)`
  display: inline;
`;

const LinkedJob = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

class LinkedJobItem extends React.PureComponent<IProps & IConnectProps> {
  public state = {
    isRemoving: false
  };

  private removeHandler = async () => {
    try {
      await this.props.dispatch(unlinkJob(this.props.jobId, this.props.linkedJob));
    } finally {
      this.setState({isRemoving: true});
    }
  };

  public render() {
    const {
      props: {linkedJob, disabled},
      state: {isRemoving}
    } = this;

    return (
      <LinkedJob>
        <div>
          <InlineActionLink to={`/job/${linkedJob.id}/notes-and-replies`}>
            {JobService.getJobName(linkedJob)}
          </InlineActionLink>
          {`: ${linkedJob.latest_status.status}`}
        </div>
        {isRemoving && <InlineActionLink to={'#'}>removing...</InlineActionLink>}
        {!isRemoving && !disabled && (
          <InlineActionLink to={'#'} onClick={this.removeHandler}>
            remove
          </InlineActionLink>
        )}
      </LinkedJob>
    );
  }
}

export default connect()(LinkedJobItem);

export const InternalLinkedJobItem = LinkedJobItem;
