import React from 'react';
import { Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class FaviconPreview extends React.Component {
  render() {
    // Regex to remove any http:// or https:// and remove any path
    const regexMatch = this.props.url.match(/(?=((\w)+?:\/\/))?((\w|\d|-)+\.)+(\w)+(?=\/)?/gm);

    // If regexMatch is null, url is invalid domain so set to none to get default icon
    const domain = regexMatch != null ? regexMatch[0] : 'none';

    const imgSrc = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
    return (
        <Image src={imgSrc} floated={this.props.card ? "right" : ""} size={this.props.card ? "mini" : "small"} centered={this.props.card ? false : true}/>
    );
  }
}

/** Require a document to be passed to this component. */
FaviconPreview.propTypes = {
  url: PropTypes.string.isRequired,
  card: PropTypes.bool,
};

/** Wrap this component in withRouter since we use the <Link> React Router element. */
export default FaviconPreview;
