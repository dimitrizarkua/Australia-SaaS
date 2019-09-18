import HttpService from 'src/services/HttpService';
import {IListEnvelope} from 'src/models/IEnvelope';
import {IVehicle} from 'src/models/IVehicle';

const searchVehicles = async (locationId: number, date: string): Promise<IVehicle[]> => {
  const res = await HttpService.get<IListEnvelope<IVehicle>>('/v1/operations/vehicles', {
    location_id: locationId,
    date
  });

  return res.data;
};

const createVehicle = (config: {}) => {
  return HttpService.post('/v1/operations/vehicles', config);
};

export default {
  searchVehicles,
  createVehicle
};
