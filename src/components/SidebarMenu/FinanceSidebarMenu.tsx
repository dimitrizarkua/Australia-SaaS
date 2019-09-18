import * as React from 'react';
import FullSidebarMenu from './FullSidebarMenu';
import SearchInput from '../SearchInput/SearchInput';
import MenuActionsBar from 'src/components/Layout/LeftMenu/MenuActionsBar';
import BottomIconButton from 'src/components/Layout/LeftMenu/BottomIconButton';
import {IconName} from 'src/components/Icon/Icon';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import ReactTooltip from 'react-tooltip';
import {SidebarContext} from 'src/components/AppLayout/SidebarContextWrap';

interface IProps {
  disableActions?: boolean;
  onAddAction: () => void;
  onSearch: (data: any) => void;
  searchLoading?: boolean;
  searchPlaceholder?: string;
  hint?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

function FinanceSidebarMenu({
  loading,
  searchPlaceholder,
  disableActions,
  children,
  hint,
  onAddAction,
  searchLoading,
  onSearch
}: IProps) {
  return (
    <FullSidebarMenu>
      <ReactTooltip className="overlapping" effect="solid" place="right" id="finance-sidebar-tooltip" />
      <SidebarContext.Consumer>
        {sidebarContext =>
          sidebarContext.isOpen && (
            <div className="pl-4 pr-5 my-4">
              <SearchInput
                loading={!!searchLoading}
                onSearchValueChange={onSearch}
                placeholder={searchPlaceholder || 'Search...'}
              />
            </div>
          )
        }
      </SidebarContext.Consumer>
      <div className="position-relative">
        {loading && <BlockLoading size={40} color={ColorPalette.gray1} />}
        {children}
      </div>
      <MenuActionsBar className="d-flex flex-row align-items-center">
        {!disableActions && (
          <BottomIconButton
            name={IconName.Add}
            data-tip={hint}
            data-for="finance-sidebar-tooltip"
            onClick={onAddAction}
          />
        )}
      </MenuActionsBar>
    </FullSidebarMenu>
  );
}

export default FinanceSidebarMenu;
