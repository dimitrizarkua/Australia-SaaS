export interface IHttpError {
  status_code: number;
  error_code: string;
  error_message: string;
  message?: string;
  fields?: any;
}
