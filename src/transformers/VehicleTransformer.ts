import {IFormValues} from 'src/components/Modal/Operations/Schedule/ModalRentalCars';
import {IVehicle} from 'src/models/IVehicle';
import {BACKEND_DATE_TIME} from 'src/constants/Date';

const convertToApi = (data: IFormValues): IVehicle => {
  return {
    ...data,
    location_id: data.location_id.id,
    rent_starts_at: data.rent_starts_at.format(BACKEND_DATE_TIME),
    rent_ends_at: data.rent_ends_at.format(BACKEND_DATE_TIME)
  } as IVehicle;
};

export default {convertToApi};
