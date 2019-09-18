import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import Tag from 'src/components/Tag/Tag';
import {ITag} from 'src/models/ITag';
import TagsArea from 'src/components/Tag/TagsArea';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import {FinanceEntityStatus} from 'src/constants/FinanceEntityStatus';
import {getFinanceItemStatusesColor} from 'src/utility/Helpers';

const PageHeader = styled.div`
  padding: 32px 30px 17px 30px;
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

const Entity = styled.div`
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.medium};
  margin-right: ${Typography.size.smaller};
  text-transform: capitalize;
`;

const EntityId = styled.div`
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

interface IProps {
  id?: number | string;
  statusList: string[];
  entityName: 'invoice' | 'credit note' | 'purchase order';
  tags?: ITag[];
  onUpdate?: () => void;
  onTagRemove?: (tag: ITag) => Promise<any>;
  loadingTags?: boolean;
  disabled?: boolean;
  isNew?: boolean;
}

interface IState {
  loading: boolean;
}

class FinanceHeader extends React.PureComponent<IProps, IState> {
  public state = {
    loading: false
  };
  public static defaultProps = {
    statusList: []
  };

  private removeTag = async (tag: ITag) => {
    const {onTagRemove} = this.props;

    if (onTagRemove) {
      this.setState({loading: true});

      try {
        await onTagRemove(tag);
      } finally {
        this.setState({loading: false});
      }
    }
  };

  public render() {
    const {id, statusList, entityName, tags, loadingTags, disabled, isNew} = this.props;
    const {loading} = this.state;
    const isDraft = statusList.includes('draft');

    return (
      <PageHeader className="d-flex flex-row">
        <UserContext.Consumer>
          {context => (
            <>
              <Entity>{id ? `${isDraft ? 'Draft' : ''} ${entityName}` : `Create ${entityName}`}</Entity>
              {!isNew && tags && context.has(Permission.TAGS_VIEW) && (
                <TagsBox>
                  <TagsArea
                    tags={tags}
                    onRemove={disabled ? undefined : this.removeTag}
                    loading={loadingTags || loading}
                  />
                </TagsBox>
              )}
              <EntityId className="flex-grow-1">{id && `#${id}`}</EntityId>
              {statusList.map(status => (
                <StatusTag
                  key={status}
                  tag={
                    {
                      color: getFinanceItemStatusesColor(status as FinanceEntityStatus),
                      name: FinanceEntityStatus[status]
                    } as ITag
                  }
                />
              ))}
            </>
          )}
        </UserContext.Consumer>
      </PageHeader>
    );
  }
}

export default FinanceHeader;
