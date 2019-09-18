import * as React from 'react';
import styled from 'styled-components';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';
import {Link} from 'react-router-dom';
import ColorPalette from 'src/constants/ColorPalette';
import {IPerson} from 'src/models/IPerson';

interface IProps {
  companyName: string;
  people: IPerson[];
}

const Employee = styled.div`
  margin-top: 15px;
`;

const EmployeePosition = styled.div`
  color: ${ColorPalette.gray5};
`;

class PeopleAtCompany extends React.PureComponent<IProps> {
  public render() {
    const {companyName, people} = this.props;

    return (
      <ReferenceBarItem caption={`People at ${companyName}`} collapsable={true}>
        {!people.length && <Employee>No people at {companyName}</Employee>}
        {people.map((el, index) => (
          <Employee key={index}>
            <Link to={`/contacts/${el.contact_category.id}/edit/${el.id}`}>
              {el.first_name} {el.last_name}
            </Link>
            <EmployeePosition>{el.job_title}</EmployeePosition>
          </Employee>
        ))}
      </ReferenceBarItem>
    );
  }
}

export default PeopleAtCompany;
