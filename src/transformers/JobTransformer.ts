import {IJob, JobStatuses} from 'src/models/IJob';
import DateTransformer from './DateTransformer';
import {getUserNames} from 'src/utility/Helpers';
import {ITeamSimple, IUserTeamSimple, UTEntityTypes} from 'src/models/ITeam';
import {IUser} from 'src/models/IUser';
import {IHttpError} from 'src/models/IHttpError';

const hydrate = (job: any): IJob => {
  const latestStatus = job.latest_status.status;

  const users = job.job_users.map((user: IUser) => {
    const userNames = getUserNames(user);
    return {
      id: user.id,
      name: userNames.name,
      type: UTEntityTypes.user,
      primary_location: user.locations.find(l => l.primary)
    } as IUserTeamSimple;
  });

  const teams = job.job_teams.map(
    (team: ITeamSimple) =>
      ({
        ...team,
        type: 'team'
      } as IUserTeamSimple)
  );

  return {
    ...job,
    created_at: DateTransformer.hydrateDateTime(job.created_at),
    initial_contact_at: DateTransformer.hydrateDateTime(job.initial_contact_at),
    date_of_loss: DateTransformer.hydrateDate(job.date_of_loss),
    anticipated_invoice_date: DateTransformer.hydrateDate(job.anticipated_invoice_date),
    authority_received_at: DateTransformer.hydrateDateTime(job.authority_received_at),
    criticality: job.criticality && {value: job.criticality, label: job.criticality},
    claim_type: job.claim_type && {value: job.claim_type, label: job.claim_type},
    edit_forbidden: latestStatus === JobStatuses.Closed || latestStatus === JobStatuses.Cancelled,
    assigned_to: [...users, ...teams]
  };
};

const hydrateError = (err: IHttpError): IHttpError => {
  const result = {...err};
  if (result.fields) {
    result.fields = {
      claim_number: err.fields.claim_number,
      reference_number: err.fields.reference_number,
      job_service: err.fields.job_service_id,
      insurer: err.fields.insurer_id,
      assigned_location: err.fields.assigned_location_id,
      owner_location: err.fields.owner_location_id,
      claim_type: err.fields.claim_type,
      criticality: err.fields.criticality,
      initial_contact_at: err.fields.initial_contact_at,
      date_of_loss: err.fields.date_of_loss,
      anticipated_invoice_date: err.fields.anticipated_invoice_date,
      authority_received_at: err.fields.authority_received_at,
      cause_of_loss: err.fields.cause_of_loss,
      description: err.fields.description,
      anticipated_revenue: err.fields.anticipated_revenue,
      expected_excess_payment: err.fields.expected_excess_payment,
      site_address_id: err.fields.site_address_id,
      site_address_lng: err.fields.site_address_lng,
      site_address_lat: err.fields.site_address_lat,
      service: err.fields.service
    };
  }
  return result;
};

const dehydrate = (job: Partial<IJob>) => {
  return Object.assign(
    {
      claim_number: job.claim_number,
      reference_number: job.reference_number,
      job_service_id: job.service && job.service.id,
      insurer_id: job.insurer && job.insurer.id,
      assigned_location_id: job.assigned_location && job.assigned_location.id,
      owner_location_id: job.owner_location && job.owner_location.id,
      claim_type: job.claim_type && job.claim_type.value,
      criticality: job.criticality && job.criticality.value,
      initial_contact_at: DateTransformer.dehydrateDateTime(job.initial_contact_at),
      date_of_loss: DateTransformer.dehydrateDate(job.date_of_loss),
      anticipated_invoice_date: DateTransformer.dehydrateDate(job.anticipated_invoice_date),
      authority_received_at: DateTransformer.dehydrateDateTime(job.authority_received_at),
      cause_of_loss: job.cause_of_loss,
      description: job.description,
      anticipated_revenue: job.anticipated_revenue,
      expected_excess_payment: job.expected_excess_payment,
      [(job.site_address_id && 'site_address_id') || '']: job.site_address_id,
      [(job.site_address_lng && 'site_address_lng') || '']: job.site_address_lng,
      [(job.site_address_lat && 'site_address_lat') || '']: job.site_address_lat,
      service: job.service
    },
    {}
  ) as Partial<IJob>;
};

export default {
  hydrate,
  hydrateError,
  dehydrate
};
