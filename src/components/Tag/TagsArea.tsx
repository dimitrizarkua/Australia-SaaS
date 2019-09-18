import * as React from 'react';
import styled from 'styled-components';
import {ITag} from 'src/models/ITag';
import Tag from './Tag';
import ColorPalette from 'src/constants/ColorPalette';
import Icon, {IconName} from 'src/components/Icon/Icon';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps {
  tags: ITag[] | undefined;
  onRemove?: (tag: ITag) => any;
  onClick?: (tag: ITag) => any;
  disableAlert?: boolean;
  loading?: boolean;
  direction?: 'right' | 'left';
  loadingAreaColor?: string;
}

const ActionTag = styled(withoutProps(['direction'])(Tag))<{direction: string | undefined}>`
  margin-${props => (props.direction ? props.direction : 'right')}: 5px;
`;

const Alert = styled.div<{loading: boolean | undefined}>`
  color: ${ColorPalette.orange0};
  display: flex;
  align-items: center;
  opacity: ${props => (props.loading ? '.2' : '1')};
`;

const AlertIcon = styled(Icon)`
  vertical-align: sub;
  margin-right: 12px;

  & path,
  circle {
    stroke: ${ColorPalette.orange2};
  }
`;

const TagsBox = styled.div`
  flex-wrap: wrap;
  line-height: 23px;
`;

const ComponentWrapper = styled.div`
  position: relative;
  min-height: 23px;
  min-width: 50px;
`;

class TagsArea extends React.PureComponent<IProps> {
  private renderAlert = () => {
    const {tags, disableAlert, loading} = this.props;

    return (
      <>
        {tags &&
          !disableAlert &&
          (tags.find((tag: ITag) => tag.is_alert) && (
            <Alert loading={loading}>
              <AlertIcon name={IconName.Alert} size={18} />
            </Alert>
          ))}
      </>
    );
  };

  public render() {
    const {tags, loading, direction, onRemove, loadingAreaColor, onClick} = this.props;

    return (
      <ComponentWrapper className="d-flex flex-row">
        {this.renderAlert()}
        {tags && (
          <TagsBox>
            {tags.map((tag: ITag) => (
              <ActionTag
                tag={tag}
                key={tag.id}
                notStatic={!onRemove}
                direction={direction}
                onTagClick={onClick}
                onRemove={onRemove}
              />
            ))}
          </TagsBox>
        )}
        {loading && <BlockLoading size={20} color={loadingAreaColor || ColorPalette.white} />}
      </ComponentWrapper>
    );
  }
}

export default TagsArea;
