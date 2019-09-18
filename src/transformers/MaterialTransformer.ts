import moment from 'moment';
import {IMaterialInfo} from 'src/models/UsageAndActualsModels/IMaterial';
import {BACKEND_DATE_TIME} from 'src/constants/Date';
import {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalJobMaterials/MaterialCustomForm';

const hydrateMaterialInfo = (data: IMaterialInfo) => {
  const clone = Object.assign({}, data) as any;

  clone.used_at = moment(clone.used_at);

  return clone;
};

const dehydrateMaterialInfo = (data: IFormValues): Partial<IMaterialInfo> => {
  return {
    buy_cost_per_unit: +data.default_buy_cost_per_unit,
    sell_cost_per_unit: +data.default_sell_cost_per_unit,
    quantity_used_override: data.count,
    used_at: data.used_at.format(BACKEND_DATE_TIME),
    material_id: data.material.id
  };
};

const hydrateMaterialInfoForEdit = (data: IMaterialInfo): IFormValues => {
  return {
    used_at: moment(data.used_at),
    material: data.material,
    default_buy_cost_per_unit: data.buy_cost_per_unit,
    default_sell_cost_per_unit: data.sell_cost_per_unit,
    count: data.quantity_used_override
  } as IFormValues;
};

export default {
  hydrateMaterialInfo,
  dehydrateMaterialInfo,
  hydrateMaterialInfoForEdit
};
