import HttpService, {withController} from './HttpService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IUsersTeams} from 'src/models/ITeam';

const searchTeamUser = async (search: string, params?: {}, fetchOptions?: {}): Promise<IUsersTeams> => {
  const res = await HttpService.get<IObjectEnvelope<IUsersTeams>>(
    `/v1/search/users-and-teams?term=${search}`,
    params,
    fetchOptions
  );
  return res.data;
};

const searchTeamUserWC = withController(searchTeamUser, 3);

export default {
  searchTeamUserWC,
  searchTeamUser
};
