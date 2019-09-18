import HttpService from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IMeeting} from 'src/models/IMeeting';

interface IMeetingConfig {
  title: string;
  scheduled_at: string;
}

type IMeetingSuccess = IObjectEnvelope<IMeeting>;

const createMeeting = async (config: IMeetingConfig): Promise<IMeetingSuccess> => {
  return await HttpService.post<IMeetingSuccess>(`/v1/meetings`, config);
};

export default {
  createMeeting
};
