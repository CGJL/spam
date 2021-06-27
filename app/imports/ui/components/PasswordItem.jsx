import React from 'react';
import { Card, Icon, Accordion, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import FaviconPreview from './FaviconPreview';

// Render single row in the List stuff table
class PasswordItem extends React.Component {
  state = { activeIndex: -1 };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  // can insert image below <card red and give the src value of passwordInfo.image wrapped ui={false}
  // add link to edit password  under extra card content where button will be
  render() {
    const passwordInfo = this.props.password;
    const { activeIndex } = this.state;
    const description = passwordInfo.description ? <div>{passwordInfo.description}<br/></div> : '';
    return (
      <Card color="red">
        <Card.Content>
          <FaviconPreview url={passwordInfo.image} card/>
          <Card.Header>{passwordInfo.name}</Card.Header>
          <Card.Meta>{passwordInfo.username}</Card.Meta>
          <Card.Meta>
            <Accordion>
              <Accordion.Title
                active={activeIndex === 0}
                index={0}
                onClick={this.handleClick}>
                <Icon name="dropdown" />
                Click to view More Information
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 0}>
                {description}
                <a href={passwordInfo.url}>{passwordInfo.url}</a>
              </Accordion.Content>
            </Accordion>
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Button as={Link} to={`/edit/${passwordInfo._id}`} inverted color={'red'}>Edit</Button>
        </Card.Content>
      </Card>
    );
  }
}

// Document to be passed to this component
PasswordItem.propTypes = {
  password: PropTypes.object.isRequired,
};

// Wrap this component withRouter since we are going to use the <Link> React Router element
export default withRouter(PasswordItem);
