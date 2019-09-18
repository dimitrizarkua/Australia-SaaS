import {IHttpError} from 'src/models/IHttpError';
import {SubmissionError} from 'redux-form';

export const VALIDATION_ERROR_CODE = 422;

export const submissionErrorHandler = (err: IHttpError) => {
  if (err.status_code === VALIDATION_ERROR_CODE) {
    return Promise.reject(new SubmissionError(err.fields));
  }
  return Promise.reject(err);
};

export const partialErrorHandler = (err: IHttpError): Promise<IHttpError> => {
  if (err.status_code === VALIDATION_ERROR_CODE) {
    return Promise.resolve(err);
  }
  return Promise.reject(err);
};

export const getSubmissionError = (fields: any) => {
  const error = {
    status_code: VALIDATION_ERROR_CODE,
    error_message: 'Invalid request',
    error_code: 'invalid_request',
    fields
  };
  return submissionErrorHandler(error);
};
