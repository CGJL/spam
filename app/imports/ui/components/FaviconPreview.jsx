import React from 'react';
import { Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class FaviconPreview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // Regex to remove any http:// or https:// and remove any path
    let regexMatch = this.props.url.match(/(?=((\w)+?:\/\/))?((\w|\d|-)+\.)+(\w)+(?=\/)?/gm);

    // If regexMatch is null, url is invalid domain so set to none to get default icon
    let domain = regexMatch != null ? regexMatch[0] : 'none';

    let imgSrc = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
    return (
        <Image src={imgSrc} width="64px" height="64px"/>
    );
  }
}

/** Require a document to be passed to this component. */
FaviconPreview.propTypes = {
  url: PropTypes.string.isRequired,
};

/** Wrap this component in withRouter since we use the <Link> React Router element. */
export default FaviconPreview;