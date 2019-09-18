import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IconName} from 'src/components/Icon/Icon';
import Dropdown, {IMenuProps, ITriggerProps} from 'src/components/Dropdown/Dropdown';
import Typography from 'src/constants/Typography';
import EditorControl from './EditorControl';

const EditTemplatesItem = styled.div`
  padding: 0 1.5rem;
  text-align: right;

  a {
    color: ${ColorPalette.blue4}!important;
    font-size: ${Typography.size.smaller};
    cursor: pointer;
  }
`;

export interface ITemplate {
  name: string;
  content: string;
}

const TEMPLATES: ITemplate[] = [
  {
    name: 'Job Scheduled',
    content: '<strong>Job Scheduled</strong><br/><br/>Some content'
  },
  {
    name: 'Unable to contact you',
    content: '<strong>Unable to contact you!!!</strong>'
  },
  {
    name: 'Welcome',
    content:
      '<strong>Welcome</strong><ul><li>Important Note</li><li><u>Something else</u></li></ul><div><i>Sincerely yours,<br/>John Smith</i></div>'
  }
];

interface IProps {
  onSelect: (template: ITemplate) => void;
}

class TemplatesControl extends React.PureComponent<IProps> {
  private selectTemplate = (template: ITemplate, props: IMenuProps) => {
    this.props.onSelect(template);
    props.close();
  };

  private renderTemplatesTrigger(props: ITriggerProps) {
    return <EditorControl isActive={false} name={IconName.Comment} onClick={props.toggle} />;
  }

  private renderTemplatesMenu = (props: IMenuProps) => {
    return (
      <>
        <EditTemplatesItem>
          <a onClick={props.close}>Edit</a>
        </EditTemplatesItem>
        <div className="dropdown-divider" />
        {TEMPLATES.map((t, index) => (
          <a key={index} className="dropdown-item" onClick={() => this.selectTemplate(t, props)}>
            {t.name}
          </a>
        ))}
      </>
    );
  };

  public render() {
    return <Dropdown trigger={this.renderTemplatesTrigger} menu={this.renderTemplatesMenu} />;
  }
}

export default TemplatesControl;
