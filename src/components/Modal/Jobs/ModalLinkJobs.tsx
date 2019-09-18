import * as React from 'react';
import {IModal} from 'src/models/IModal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import SearchInput from 'src/components/SearchInput/SearchInput';
import styled from 'styled-components';
import FoundJob from 'src/components/Modal/Jobs/CommonComponents/FoundJob';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {Action, compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import JobService from 'src/services/JobService';
import {ICurrentJob, linkJobs} from 'src/redux/currentJob/currentJobDucks';
import {ThunkDispatch} from 'redux-thunk';
import Modal from 'src/components/Modal/Modal';
import {debounce, orderBy} from 'lodash';
import {IJob, JobStatuses, JobWeightByStatus} from 'src/models/IJob';
import moment from 'moment';

interface IWithDataProps {
  jobs: IResource<IJob[]>;
}

interface IConnectProps {
  currentJob: ICurrentJob;
  dispatch: ThunkDispatch<any, any, Action>;
}

const SearchResultBox = styled.div`
  margin-top: 40px;
`;

class ModalLinkJobs extends React.PureComponent<IModal & IConnectProps & IWithDataProps> {
  public state = {
    jobsForLinking: [] as Array<number | string>,
    loading: false
  };

  private searchJobsById = (search: string) => {
    this.props.jobs.fetch(search, {per_page: 20, include_closed: true});
  };

  private searchById = (search: string) => {
    if (search) {
      this.debouncedSearch(search);
    } else {
      this.debouncedSearch.cancel();
    }
  };

  private debouncedSearch = debounce(this.searchJobsById, 1000);

  private linkJobs = () => {
    if (this.props.currentJob.data) {
      this.setState({loading: true});

      try {
        this.props.dispatch(linkJobs(this.props.currentJob.data.id, this.state.jobsForLinking));
      } finally {
        this.props.onClose();
        this.setState({loading: false});
      }
    }
  };

  private processSelectedJob = (cond: boolean, value: number | string) => {
    if (cond) {
      if (!this.state.jobsForLinking.includes(value)) {
        this.setState({jobsForLinking: this.state.jobsForLinking.concat(value)});

        setTimeout(() => {
          this.linkJobs();
        });
      }
    } else {
      if (this.state.jobsForLinking.includes(value)) {
        this.removeJobFromSelected(value);
      }
    }
  };

  private removeJobFromSelected = (value: string | number) => {
    const clone = this.state.jobsForLinking;
    clone.splice(clone.indexOf(value), 1);
    this.setState({jobsForLinking: Array.from(clone)});
  };

  private onClose = () => {
    const {
      onClose,
      jobs: {reset}
    } = this.props;

    onClose();
    reset();
  };

  private sortJobs = () => {
    const {
      jobs: {data}
    } = this.props;

    if (data) {
      const jobs = data.filter((el: IJob) => el.latest_status.status !== JobStatuses.Cancelled);

      return orderBy(
        jobs,
        [
          (el: IJob) => JobWeightByStatus[el.latest_status.status],
          (el: IJob) => moment(el.created_at as string).unix()
        ],
        ['asc', 'asc']
      ) as IJob[];
    }

    return [];
  };

  private renderBody() {
    const {loading, error} = this.props.jobs;
    const loadingCurrentJob = this.props.currentJob.loading;

    return (
      <>
        {loadingCurrentJob ? (
          'Loading...'
        ) : (
          <>
            <SearchInput
              searchIcon={true}
              loading={loading}
              placeholder="Search..."
              onSearchValueChange={this.searchById}
              mode={'typeGray'}
            />
            {!error && (
              <SearchResultBox>
                {this.sortJobs().map(el => (
                  <FoundJob
                    checked={this.state.jobsForLinking.includes(el.id)}
                    onSelectJob={this.processSelectedJob}
                    key={el.id}
                    job={el}
                  />
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
          title="Link to Jobs"
          body={this.renderBody()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  currentJob: state.currentJob
});

export default compose<React.ComponentClass<IModal>>(
  withData<IModal>({
    jobs: {
      fetch: JobService.searchJobs,
      initialData: null
    }
  }),
  connect(mapStateToProps)
)(ModalLinkJobs);

export const InternalModalLinkJobs = ModalLinkJobs;
