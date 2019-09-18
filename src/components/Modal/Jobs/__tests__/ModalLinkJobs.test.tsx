import * as React from 'react';
import {mount} from 'enzyme';
import {InternalModalLinkJobs as ModalLinkJobs} from '../ModalLinkJobs';
import {IJob} from 'src/models/IJob';
import {ModalWindowBody, ModalWindowFooter} from 'src/components/Modal/ModalWindow';
import SearchInput from 'src/components/SearchInput/SearchInput';

describe('ModalLinkJobs', () => {
  let props: any;

  beforeEach(() => {
    props = {
      isOpen: true,
      jobs: {} as IJob,
      dispatch: jest.fn(),
      currentJob: {
        loading: true,
        fetch: jest.fn(),
        ready: false,
        error: null
      }
    };
  });

  it('should NOT render body and footer if data is loading', () => {
    const component = mount(<ModalLinkJobs {...props} />);
    expect(component.find(ModalWindowBody).text()).toEqual('Loading...');
    expect(component.find(ModalWindowFooter).find('button').length).toEqual(1);
  });

  it('should render body and footer if data is loaded', () => {
    props.currentJob.loading = false;

    const component = mount(<ModalLinkJobs {...props} />);
    expect(component.find(ModalWindowBody).find(SearchInput).length).toEqual(1);
    expect(component.find(ModalWindowFooter).find('button').length).toEqual(1);
  });
});
