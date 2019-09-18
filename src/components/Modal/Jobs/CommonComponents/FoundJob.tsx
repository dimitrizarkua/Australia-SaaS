import * as React from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import Tag from 'src/components/Tag/Tag';
import Typography from 'src/constants/Typography';
import {IJob} from 'src/models/IJob';
import withData, {IResource} from 'src/components/withData/withData';
import {ITagsSuccess} from 'src/services/TagService';
import JobService from 'src/services/JobService';
import TagsArea from 'src/components/Tag/TagsArea';
import {ITag} from 'src/models/ITag';

const FoundJobItem = styled.div`
  padding: 10px 0;
  border-top: 1px solid ${ColorPalette.gray2}
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  
  :last-child {
    border-bottom: 0;
  }
`;

const ContactName = styled.div`
  margin-left: 10px;
  font-weight: ${Typography.weight.bold};
`;

const SiteAddress = styled.div`
  color: ${ColorPalette.gray5};
`;

const StatusTag = styled(Tag)`
  font-size: ${Typography.size.normal};
  line-height: 24px;
  height: 24px;
  margin-bottom: 2px;
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

interface IProps {
  job: IJob;
  checkbox?: boolean;
  onSelectJob?: (cond: boolean, value: string | number) => any;
  checked?: boolean;
}

interface IWithDataProps {
  tags: IResource<ITagsSuccess>;
}

class FoundJob extends React.PureComponent<IProps & IWithDataProps> {
  public componentDidMount() {
    this.props.tags.fetch(this.props.job.id);
  }

  private handleClick = () => {
    const {checkbox, job} = this.props;

    if (!checkbox && this.props.onSelectJob) {
      this.props.onSelectJob(true, job.id);
    }
  };

  public render() {
    const {
      job,
      tags: {data, loading}
    } = this.props;

    return (
      <FoundJobItem onClick={this.handleClick}>
        <div style={{display: 'flex'}}>
          <div>
            <div style={{display: 'flex'}}>
              <div>#{job.id}</div>
              <ContactName>{job.site_address && job.site_address.contact_name}</ContactName>
            </div>
            <SiteAddress>{job.site_address && job.site_address.full_address}</SiteAddress>
          </div>
        </div>
        <div>
          <TagsWrapper>
            <StatusTag tag={{name: job.latest_status.status, color: ColorPalette.gray4} as ITag} mode={'outlined'} />
            <TagsArea loading={loading} tags={data && data.data} direction={'left'} />
          </TagsWrapper>
        </div>
      </FoundJobItem>
    );
  }
}

export default withData<IProps>({
  tags: {
    fetch: JobService.getTags
  }
})(FoundJob);
