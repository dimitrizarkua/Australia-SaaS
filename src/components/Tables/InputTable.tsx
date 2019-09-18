import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

const InputTable = styled.table`
  border: 1px solid ${ColorPalette.gray2};

  thead th {
    font-weight: ${Typography.weight.normal};
    color: ${ColorPalette.gray4};
    padding: 5px;
    padding-left: 10px;
    height: 50px;
    line-height: 20px;
    vertical-align: middle;
  }

  td {
    vertical-align: middle;
    &:nth-child(2) {
      width: 25%;
    }
    &:last-child {
      padding-right: 10px;
      padding-bottom: 7px;
      cursor: pointer;
    }
  }

  tbody tr:nth-of-type(odd) {
    background: ${ColorPalette.gray0};
  }
  .form-control {
    background: white;
    border: 1px solid ${ColorPalette.gray2};
  }
`;

export default (props: any) => <InputTable className="table table-sm table-striped">{props.children}</InputTable>;
