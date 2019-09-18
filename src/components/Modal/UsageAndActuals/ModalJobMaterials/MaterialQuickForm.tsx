import * as React from 'react';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IMaterial} from 'src/models/UsageAndActualsModels/IMaterial';
import {IReturnType} from 'src/redux/reduxWrap';
import Table from 'src/components/Tables/PlainTable';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {ThunkDispatch} from 'redux-thunk';
import {loadAllMaterials} from 'src/redux/materialsDucks';
import NumericInput from 'src/components/Form/NumericInput';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

const TableMaterials = styled(Table)`
  margin-top: 30px;
  thead {
    tr {
      th {
        border-bottom: 2px solid ${ColorPalette.gray2};
      }
    }
  }

  tbody {
    tr {
      border-top: 1px solid ${ColorPalette.gray2};
    }
  }
`;

const QuantityLabel = styled.div`
  position: absolute;
  color: ${ColorPalette.gray4};
  top: -35px;
`;

const MeasureName = styled.span`
  margin-left: 10px;
  color: ${ColorPalette.gray5};
`;

interface IProps {
  dataProcessor: (data: IMaterialItem[]) => any;
}

interface IConnectProps {
  materials: IReturnType<IMaterial[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

export interface IMaterialItem {
  material: IMaterial;
  count: number;
  id: number;
}

interface IState {
  materialsState: IMaterialItem[];
}

class MaterialQuickForm extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    materialsState: []
  };

  public componentDidMount() {
    const {dispatch} = this.props;

    dispatch(loadAllMaterials());
    this.setMaterialsState();
  }

  public componentDidUpdate(prevProps: IConnectProps) {
    const {
      materials: {data}
    } = this.props;
    const {
      materials: {data: dataPrev}
    } = prevProps;

    if ((data && dataPrev && data.length !== dataPrev.length) || !dataPrev) {
      this.setMaterialsState();
    }
  }

  private setMaterialsState = () => {
    const {
      materials: {data}
    } = this.props;

    if (data) {
      const materialsState = data.map((material: IMaterial) => ({
        material,
        count: 0,
        id: material.id
      }));

      this.setState({materialsState});
    }
  };

  private onChangeQuantity = (q: number, index: number) => {
    const {dataProcessor} = this.props;
    let statePartClone: any = this.state.materialsState.slice() as IMaterialItem[];

    statePartClone[index].count = q;
    this.setState({materialsState: statePartClone});
    statePartClone = null;

    setTimeout(() => {
      dataProcessor(this.state.materialsState);
    });
  };

  public render() {
    const {materialsState} = this.state;
    const {
      materials: {loading}
    } = this.props;

    return (
      <>
        {loading && <BlockLoading size={40} color={ColorPalette.white} />}
        <TableMaterials>
          <tbody>
            {materialsState.map((material: IMaterialItem, i) => (
              <tr style={{background: material.count > 0 ? ColorPalette.blue0 : ''}}>
                <td style={{width: '100%'}}>{material.material.name}</td>
                <td style={{whiteSpace: 'nowrap'}}>
                  <div className="d-flex align-items-center position-relative">
                    {i === 0 && <QuantityLabel>Quantity</QuantityLabel>}
                    <NumericInput quantity={material.count} onChange={q => this.onChangeQuantity(q, i)} />
                    <MeasureName>{material.material.measure_unit.name}</MeasureName>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableMaterials>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({materials: state.materials});

export default compose(connect(mapStateToProps))(MaterialQuickForm);
