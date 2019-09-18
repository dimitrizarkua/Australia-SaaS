import * as React from 'react';
import {IHttpError} from 'src/models/IHttpError';

interface IConfig {
  [resourceName: string]: IResourceConfig<any, any>;
}

interface IResourceConfig<TData, TError = IHttpError> {
  fetch: (...params: any[]) => Promise<TData>;
  initialData?: TData;
}

interface IState {
  [resourceName: string]: IResource<any, any>;
}

export interface IResource<TData, TError = IHttpError> extends IResourceConfig<TData, TError> {
  data?: TData;
  error?: TError;
  loading: boolean;
  ready: boolean;
  reset: () => void;
  init: (data: TData) => void;
}

type UnknownResourceConfig = IResourceConfig<any, any>;

export default function withData<TWrapperProps>(config: IConfig = {}) {
  return (WrappedComponent: React.ComponentClass<any>) => {
    class EnhancedComponent extends React.Component<TWrapperProps, IState> {
      public state = {};

      constructor(props: TWrapperProps) {
        super(props);

        Object.keys(config).forEach(key => {
          const resourceConfig = config[key] as UnknownResourceConfig;
          this.state[key] = {
            data: resourceConfig.initialData,
            initialData: resourceConfig.initialData,
            loading: false,
            ready: false,
            error: null,
            fetch: this.wrappedFetch(key, resourceConfig),
            init: (data: any) => this.setData(key, data, true),
            reset: () => this.setData(key, resourceConfig.initialData, false)
          };
        });
      }

      private setData(key: string, data?: any, ready = true) {
        this.setState(state => ({[key]: {...state[key], data, ready, loading: false, error: null}}));
        return data;
      }

      private setLoading(key: string, loading: boolean) {
        this.setState(state => ({[key]: {...state[key], loading}}));
      }

      private setError(key: string) {
        return (error: any) => {
          this.setLoading(key, false);
          this.setState(state => ({[key]: {...state[key], error, ready: true}}));
        };
      }

      private wrappedFetch(key: string, resourceConfig: UnknownResourceConfig) {
        return (...params: any[]) => {
          this.setLoading(key, true);

          return resourceConfig.fetch(...params).then(result => this.setData(key, result), this.setError(key));
        };
      }

      public render() {
        return <WrappedComponent {...this.props} {...this.state} />;
      }
    }

    return EnhancedComponent;
  };
}
