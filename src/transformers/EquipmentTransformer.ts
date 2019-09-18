import moment from 'moment';
import {IEquipmentInfo} from 'src/models/UsageAndActualsModels/IEquipment';
import {IFormValues} from 'src/components/Modal/UsageAndActuals/ModalJobEquipments/EquipmentCustomForm';
import {BACKEND_DATE_TIME} from 'src/constants/Date';

const hydrateEquipmentInfo = (data: IEquipmentInfo) => {
  const clone = Object.assign({}, data) as any;

  clone.used_at = moment(clone.used_at);

  return clone;
};

const dehydrateEquipmentInfo = (data: IFormValues): Partial<IEquipmentInfo> => {
  return {
    total_charge: data.total_amount,
    ended_at: data.ended_at.format(BACKEND_DATE_TIME),
    started_at: data.started_at.format(BACKEND_DATE_TIME),
    equipment_id: data.equipment.id,
    buy_cost_per_interval: data.unit_cost_to_me,
    intervals_count_override: data.unit_price_to_charge
  };
};

const hydrateEquipmentInfoForEdit = (data: IEquipmentInfo): IFormValues => {
  return {
    name: data.equipment.model,
    equipment: data.equipment,
    total_amount: data.total_charge,
    unit_cost_to_me: data.buy_cost_per_interval,
    unit_price_to_charge: data.charging_interval.charging_rate_per_interval,
    started_at: moment(data.started_at),
    ended_at: moment(data.ended_at),
    intervals_count_override: data.intervals_count_override
  } as IFormValues;
};

export default {
  hydrateEquipmentInfo,
  dehydrateEquipmentInfo,
  hydrateEquipmentInfoForEdit
};
