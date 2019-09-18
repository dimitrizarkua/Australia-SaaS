import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import {isEqual} from 'lodash';
import DropdownMenuControl from '../MenuItems/DropdownMenuControl';
import InlineSelect from 'src/components/Form/InlineSelect';
import {IMenuProps} from 'src/components/Dropdown/Dropdown';
import {IGLAccount} from 'src/models/IFinance';
import FinanceService from 'src/services/FinanceService';
import {ITagsSuccess} from 'src/services/TagService';
import {colorTransformer} from 'src/utility/Helpers';
import {ITag} from 'src/models/ITag';

const ControlContainer = styled.div`
  width: 400px;
  padding: 3px;
  label.label__no-margin {
    margin-bottom: 0;
  }
`;

const TriggerContainer = styled.div`
  display: flex;
  line-height: 50px;
  width: 60px;
  cursor: pointer;
  color: ${ColorPalette.white};
  border-right: 1px solid ${ColorPalette.white};
  border-left: 1px solid ${ColorPalette.white};
  margin: 0 10px;
  svg {
    margin: 15px 20px;
  }
`;

const tagsSelectStyles = {
  multiValue: (base: React.CSSProperties, state: any) => {
    return {
      ...base,
      backgroundColor: state.data && state.data.color ? colorTransformer(state.data.color) : ColorPalette.gray1,
      color: ColorPalette.white,
      borderRadius: '4px'
    };
  },
  multiValueLabel: (base: React.CSSProperties) => ({
    ...base,
    color: ColorPalette.white
  }),
  multiValueRemove: (base: React.CSSProperties) => ({
    ...base,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'inherit',
      color: 'inherit'
    }
  })
};

interface IProps {
  tags: ITagsSuccess | null;
  glAccounts: IGLAccount[];
  onChange: (setting: IFinFilterState) => void;
}

export interface IFinFilterState {
  selectedTags: ITag[];
  selectedGlAccount?: IGLAccount | null;
}

const initialState = {
  selectedTags: [],
  selectedGlAccount: null
};

export default React.memo(function FunnelFinanceFilter({glAccounts, tags, onChange}: IProps) {
  const [filterSetting, setFilterSetting] = useState<IFinFilterState>(initialState);

  useEffect(() => {
    onChange(filterSetting);
  }, [filterSetting]);

  function optionToValue(entity: any) {
    return entity.id.toString();
  }

  function optionToLabel(entity: any) {
    return entity.name.toString();
  }

  const handleChangeTags = (value: ITag[]) => {
    setFilterSetting({...filterSetting, selectedTags: value});
  };

  const handleChangeGlAcc = (value: IGLAccount) => {
    setFilterSetting({...filterSetting, selectedGlAccount: value});
  };

  function renderControl(props: IMenuProps) {
    const tagsData = tags ? tags.data : [];
    return (
      <ControlContainer>
        {glAccounts && (
          <div className="d-flex align-items-center">
            <div className="col-4 pr-0">
              <label className="label__no-margin">Select Account:</label>
            </div>
            <div className="col-8 pl-0">
              <InlineSelect
                options={glAccounts.sort((a1, a2) => a1.name.localeCompare(a2.name))}
                getOptionLabel={FinanceService.getGLAccountLabel}
                getOptionValue={optionToValue}
                onChange={handleChangeGlAcc}
                isClearable={true}
              />
            </div>
          </div>
        )}
        <div className="d-flex align-items-center mt-2">
          <div className="col-2">
            <label>Tags:</label>
          </div>
          <div className="col-10">
            <InlineSelect
              placeholder="Select tags..."
              options={tagsData}
              getOptionLabel={optionToLabel}
              getOptionValue={optionToValue}
              onChange={handleChangeTags}
              additionalStyles={tagsSelectStyles}
              isMulti={true}
            />
          </div>
        </div>
      </ControlContainer>
    );
  }

  function renderTrigger() {
    const wasUsed = !isEqual(filterSetting, initialState);
    return (
      <TriggerContainer>
        <ColoredIcon name={IconName.Filter} color={ColorPalette.white} fill={wasUsed} data-tip="Filter" />
      </TriggerContainer>
    );
  }

  return (
    <div className="d-flex">
      <DropdownMenuControl trigger={renderTrigger} renderInternal={renderControl} />
    </div>
  );
});
