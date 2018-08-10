import React, { Component } from 'react';

export default class RedirectToAuthorize extends Component {
  constructor() {
    window.location.href = `${OA_PATH}oauth/authorize?client_id=${OA_CLIENT_ID}&response_type=code`;
    super();
  }

  render() {
    return (
      <div />
    );
  }
}
