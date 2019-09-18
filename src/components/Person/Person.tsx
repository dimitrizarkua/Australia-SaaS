import * as React from 'react';
import {compact} from 'lodash';
import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import {IPerson} from 'src/models/IPerson';
import {ITag} from 'src/models/ITag';
import ContactService from 'src/services/ContactService';
import TagsArea from 'src/components/Tag/TagsArea';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import ContactAvatar from './ContactAvatar';

const Container = styled.div`
  word-break: break-word;
`;

const Name = styled.div`
  font-size: ${Typography.size.big};
`;

const Company = styled.div`
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.light};
`;

interface IProps {
  person: Partial<IPerson>;
  disabled?: boolean;
  tags?: ITag[];
  onUpdate?: () => void;
  loadTags: () => any;
}

class Person extends React.PureComponent<IProps> {
  private getCompanyDescription() {
    const {person} = this.props;
    return compact([person.parent_company && person.parent_company.legal_name, person.job_title]).join(', ');
  }

  private removeTag = async (tag: ITag) => {
    if (this.props.person.id) {
      await ContactService.removeTag(this.props.person.id, tag.id);
      await this.props.loadTags();
    }
  };

  public render() {
    const {person, tags, disabled} = this.props;

    return (
      <UserContext.Consumer>
        {context => (
          <Container className="d-flex align-items-center">
            <ContactAvatar url={person.avatar} width={100} height={100} />
            <div>
              <Name>
                {person.first_name} {person.last_name}
              </Name>
              <Company>{this.getCompanyDescription()}</Company>
              {tags && context.has(Permission.TAGS_VIEW) && (
                <TagsArea tags={tags} onRemove={disabled ? undefined : this.removeTag} />
              )}
            </div>
          </Container>
        )}
      </UserContext.Consumer>
    );
  }
}

export default Person;
