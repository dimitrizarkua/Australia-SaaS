import * as React from 'react';
import {sanitize, replaceMentions} from 'src/utility/Helpers';
import {IJob} from 'src/models/IJob';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import JobItemMenu from './JobItemMenu';
import Moment from 'react-moment';
import {Link} from 'react-router-dom';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import moment from 'moment';
import JobService from 'src/services/JobService';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps {
  job: IJob;
  type: string;
  fetchJobs: () => Promise<any>;
}

interface IState {
  hover: boolean;
  loading: boolean;
}

const JobBox = styled(withoutProps(['loading'])(Link))<{loading: boolean}>`
  position: relative;
  padding: 15px 10px 15px 26px;
  border: 1px solid ${ColorPalette.gray2};
  margin-top: -1px;
  text-decorate: none;
  background: ${ColorPalette.white};
  max-height: 250px;

  :hover {
    background: ${props => !props.loading && ColorPalette.gray0};
    text-decoration: none;
  }

  & *:hover {
    text-decoration: none;
  }
`;

const Customer = styled.div`
  width: 25%;
  hyphens: auto;
`;

const CustomerName = styled.div`
  color: ${ColorPalette.black1};
  font-weight: ${Typography.weight.medium};
`;

const CustomerAddress = styled.div`
  color: ${ColorPalette.gray5};
`;

const JobDescriptionWrapper = styled.div`
  width: 40%;
  padding-left: 20px;
`;

const JobDescription = styled.div`
  color: ${ColorPalette.gray3};
  hyphens: auto;
  position: relative;
  max-height: 150px;
  overflow: hidden;
`;

const JobNumber = styled.div`
  color: ${ColorPalette.gray3};
  padding-left: 20px;
  flex: 1;
`;

const JobStatus = styled.div`
  padding-left: 20px;
  color: ${ColorPalette.black1};
  flex: 1;
`;

const UpdateDate = styled(withoutProps(['visibility'])('div'))<{visibility: boolean}>`
  padding-left: 20px;
  color: ${ColorPalette.black1};
  flex: 1;
  visibility: ${props => (props.visibility ? 'visible' : 'hidden')};
`;

const UpdatedLabel = styled.div`
  position: absolute;
  width: 0px;
  height: 0px;
  border-style: solid;
  border-width: 10px 10px 0 0;
  border-color: ${ColorPalette.orange2} transparent transparent transparent;
  left: 0px;
  top: 0px;
`;

const Fade = styled(withoutProps(['hover'])('div'))<{hover: boolean}>`
  width: 100%;
  height: 50px;
  position: absolute;
  top: 100px;
  background: linear-gradient(to top, ${props => (props.hover ? ColorPalette.gray0 : 'white')}, transparent);
`;

const Snoozed = styled.div`
  margin-top: 5px;
  color: ${ColorPalette.orange2};
`;

class JobsListItem extends React.PureComponent<IProps, IState> {
  public state = {
    hover: false,
    loading: false
  };

  private set itemLoading(loading: boolean) {
    this.setState({loading});
  }

  private get latestMessage() {
    const latestMessage = this.props.job.last_message;
    if (!latestMessage) {
      return null;
    }
    return replaceMentions(sanitize(latestMessage, true));
  }

  private onMouseEnter = () => {
    const {loading} = this.state;

    if (!loading) {
      this.setState({hover: true});
    }
  };

  private onMouseLeave = () => {
    this.setState({hover: false});
  };

  public render() {
    const {job, type, fetchJobs} = this.props;
    const {hover, loading} = this.state;

    return (
      <JobBox
        className="d-flex flex-row"
        to={`/job/${job.id}/details`}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        loading={loading}
      >
        {job.has_new_replies && <UpdatedLabel />}
        <Customer className="d-flex flex-column flex-grow-1">
          {job.site_contact_name ? (
            <CustomerName>{job.site_contact_name}</CustomerName>
          ) : (
            <CustomerAddress>Unknown</CustomerAddress>
          )}
          <CustomerAddress>{job.site_address ? job.site_address.full_address : '--'}</CustomerAddress>
        </Customer>
        <JobDescriptionWrapper>
          <JobDescription>
            {this.latestMessage ? (
              <div dangerouslySetInnerHTML={{__html: this.latestMessage}} />
            ) : (
              <div>{job.description}</div>
            )}
            <Fade hover={hover} />
          </JobDescription>
          {job.snoozed_until && type !== 'inbox' && (
            <Snoozed>Snoozed until {moment(job.snoozed_until).format('D MMMM YYYY')}</Snoozed>
          )}
        </JobDescriptionWrapper>
        <JobNumber>{JobService.getJobName(job)}</JobNumber>
        <JobStatus className="d-flex flex-column">
          <div>{job.latest_status.status}</div>
        </JobStatus>
        <UpdateDate visibility={!hover}>
          <Moment fromNow={true}>{job.touched_at}</Moment>
        </UpdateDate>
        <JobItemMenu
          pinned_at={job.pinned_at}
          snoozed_until={job.snoozed_until}
          job={job}
          type={type}
          fetchJobs={fetchJobs}
          onAction={() => {
            this.itemLoading = true;
          }}
          stopAction={() => {
            this.itemLoading = false;
          }}
          show={hover}
        />
        {loading && <BlockLoading size={30} color={ColorPalette.gray0} />}
      </JobBox>
    );
  }
}

export default JobsListItem;
