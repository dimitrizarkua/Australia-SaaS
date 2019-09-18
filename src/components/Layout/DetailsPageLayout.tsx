import * as React from 'react';
import styled from 'styled-components';
import SidebarMenu, {IMenuItem} from '../SidebarMenu/SidebarMenu';
import PageContent from './PageContent';
import ReferenceBar from '../ReferenceBar/ReferenceBar';
import SC from 'src/components/Layout/ScrollableContainer';
import ColorPalette from 'src/constants/ColorPalette';

const ContentContainer = styled.div`
  min-height: 100%;
`;

interface IProps {
  sidebarMenuItems: IMenuItem[];
  menu: React.ReactElement<any> | null;
  header: React.ReactElement<any>;
  content: React.ReactElement<any>;
  references: React.ReactElement<any>;
  upperToolsContainer?: React.ReactElement<any> | null;
  footer?: React.ReactElement<any> | null;
}

const ScrollableContainer = styled(SC)`
  border-left: 1px solid ${ColorPalette.gray2};
`;

class DetailsPageLayout extends React.PureComponent<IProps> {
  public render() {
    const {sidebarMenuItems, menu, header, content, references, upperToolsContainer, footer} = this.props;

    return (
      <div className="d-flex h-100 flex-row align-items-stretch">
        <SidebarMenu items={sidebarMenuItems} />
        <div className="flex-grow-1">
          <ScrollableContainer className="h-100">
            <ContentContainer className="d-flex flex-row align-items-stretch">
              <div className="flex-grow-1">
                {menu}
                {header}
                {upperToolsContainer}
                <PageContent>{content}</PageContent>
                {footer}
              </div>
              <ReferenceBar>{references}</ReferenceBar>
            </ContentContainer>
          </ScrollableContainer>
        </div>
      </div>
    );
  }
}

export default DetailsPageLayout;
