import * as React from 'react';
import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import {ICompany} from 'src/models/ICompany';
import {ITag} from 'src/models/ITag';
import ContactService from 'src/services/ContactService';
import TagsArea from 'src/components/Tag/TagsArea';
import ContactAvatar from '../Person/ContactAvatar';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

const Container = styled.div`
  word-break: break-word;
`;

const Name = styled.div`
  font-size: ${Typography.size.big};
`;

interface IProps {
  company: Partial<ICompany>;
  disabled?: boolean;
  tags?: ITag[];
  onUpdate?: () => void;
  loadTags: () => any;
}

class Company extends React.PureComponent<IProps> {
  private removeTag = async (tag: ITag) => {
    if (this.props.company.id) {
      await ContactService.removeTag(this.props.company.id, tag.id);
      await this.props.loadTags();
    }
  };

  public render() {
    const {company, tags, disabled} = this.props;
    return (
      <UserContext.Consumer>
        {context => (
          <Container className="d-flex align-items-center">
            <ContactAvatar url={company.logo} width={100} height={100} />
            <div>
              <Name>{company.legal_name}</Name>
              {context.has(Permission.TAGS_VIEW) && (
                <TagsArea tags={tags || []} onRemove={disabled ? undefined : this.removeTag} />
              )}
            </div>
          </Container>
        )}
      </UserContext.Consumer>
    );
  }
}

export default Company;
