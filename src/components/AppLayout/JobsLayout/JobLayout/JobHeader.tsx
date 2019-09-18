import * as React from 'react';
import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import Tag from 'src/components/Tag/Tag';
import ColorPalette from 'src/constants/ColorPalette';
import {IJob} from 'src/models/IJob';
import {ITag} from 'src/models/ITag';
import JobService from 'src/services/JobService';
import TagsArea from 'src/components/Tag/TagsArea';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {Dispatch} from 'redux';
import {removeJobTag} from 'src/redux/currentJob/currentJobDucks';
import {connect} from 'react-redux';

const PageHeader = styled.div`
  padding: 32px 30px 17px 30px;
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

const JobAddress = styled.div`
  font-weight: ${Typography.weight.light};
  font-size: ${Typography.size.medium};
`;

const JobName = styled.div`
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.medium};
  margin-right: ${Typography.size.smaller};
`;

const JobNumber = styled.div`
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.medium};
  text-align: right;
  white-space: nowrap;
`;

const StatusTag = styled(Tag)`
  margin-left: 10px;
  font-size: ${Typography.size.normal};
  line-height: 24px;
  height: 24px;
`;

export const TagsBox = styled.div`
  margin-left: 30px;
`;

interface IConnectProps {
  dispatch: Dispatch<any>;
}

interface IOwnProps {
  job: IJob;
  loading?: boolean;
  disabled?: boolean;
}

type IProps = IOwnProps & IConnectProps;

class JobHeader extends React.PureComponent<IProps> {
  private removeTag = async (tag: ITag) => {
    await this.props.dispatch(removeJobTag(this.props.job.id, tag));
  };

  public render() {
    const {job, loading, disabled} = this.props;

    return (
      <PageHeader className="d-flex flex-row">
        <UserContext.Consumer>
          {context => (
            <>
              <JobName>Job</JobName>
              <JobAddress>{job.site_address ? job.site_address.full_address : 'No Site Address Specified'}</JobAddress>
              {context.has(Permission.TAGS_VIEW) && (
                <TagsBox>
                  <TagsArea
                    tags={job.tags}
                    onRemove={disabled || job.edit_forbidden ? undefined : this.removeTag}
                    loading={loading}
                  />
                </TagsBox>
              )}
              <JobNumber className="flex-grow-1">{JobService.getJobName(job)}</JobNumber>
              <StatusTag tag={{name: job.latest_status.status, color: ColorPalette.gray4} as ITag} />
            </>
          )}
        </UserContext.Consumer>
      </PageHeader>
    );
  }
}

export default connect()(JobHeader);

export const InternalJobHeader = JobHeader;
