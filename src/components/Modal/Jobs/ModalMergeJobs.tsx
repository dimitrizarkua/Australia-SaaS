import * as React from 'react';
import {IModal} from 'src/models/IModal';
import ModalWindow from '../ModalWindow';
import SearchInput from 'src/components/SearchInput/SearchInput';
import styled from 'styled-components';
import FoundJob from './CommonComponents/FoundJob';
import withData, {IResource} from 'src/components/withData/withData';
import JobService from 'src/services/JobService';
import Typography from 'src/constants/Typography';
import Modal from '../Modal';
import {debounce} from 'lodash';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {getJobNotesAndReplies} from 'src/redux/notesAndReplies';
import {loadCurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {IJob} from 'src/models/IJob';

const SearchResultBox = styled.div`
  margin-top: 40px;
`;

const Hint = styled.div`
  margin-bottom: 25px;
  font-size: ${Typography.size.smaller};
`;

interface IWithDataProps {
  jobs: IResource<IJob[]>;
}

interface IProps {
  sourceJobId: number | string;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

class ModalMergeJobs extends React.PureComponent<IModal & IWithDataProps & IProps & IConnectProps> {
  public state = {
    loading: false
  };

  private searchJobsById = (search: string) => {
    if (search) {
      this.props.jobs.fetch(search);
    } else {
      this.debouncedSearch.cancel();
    }
  };

  private debouncedSearch = debounce(this.searchJobsById, 500);

  private mergeJobs = (cond: boolean, value: number | string) => {
    if (this.props.sourceJobId && this.props.jobs.data) {
      const {sourceJobId, dispatch} = this.props;

      this.setState({loading: true});

      JobService.mergeJobs(sourceJobId, value)
        .then(() => {
          this.props.onClose();
          this.setState({loading: false});
          dispatch(getJobNotesAndReplies(sourceJobId));
          dispatch(loadCurrentJob(sourceJobId));
        })
        .catch(() => {
          this.props.onClose();
          this.setState({loading: false});
        });
    }
  };

  private onClose = () => {
    const {
      onClose,
      jobs: {reset}
    } = this.props;

    onClose();
    reset();
  };

  private renderBody() {
    const {loading, data, error} = this.props.jobs;

    return (
      <>
        {!this.props.sourceJobId ? (
          'Loading...'
        ) : (
          <>
            <Hint>
              This option will merge all current notes, emails, attendances, etc. from this job into the selected job
              below. The Job Details of the job selected below will remain and not be overwritten. Once complete this
              job will automatically be set to cancelled status.
            </Hint>
            <SearchInput
              searchIcon={true}
              loading={loading}
              placeholder="Search..."
              onSearchValueChange={this.debouncedSearch}
              mode={'typeGray'}
            />
            {!error && data && (
              <SearchResultBox>
                {data.map(el => (
                  <FoundJob onSelectJob={this.mergeJobs} key={el.id} job={el} />
                ))}
              </SearchResultBox>
            )}
          </>
        )}
      </>
    );
  }

  public render() {
    const {isOpen} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={this.onClose}
          title="Merge with Job"
          body={this.renderBody()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

export default compose<React.ComponentClass<IModal & IProps>>(
  withData<IModal & IProps>({
    jobs: {
      fetch: JobService.searchJobs,
      initialData: null
    }
  }),
  connect()
)(ModalMergeJobs);
