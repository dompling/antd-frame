import React, { Component } from 'react';
import { connect } from 'dva';
import LoginLoading from '../../components/Loading';

class RefreshAccessToken extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'oauth/refreshAccessToken',
      callBack: () => dispatch({ type: 'currentUser/fetchCurrent' }),
    });
  }

  componentWillUpdate(nextProps) {
    const { accessToken } = nextProps;
    if (accessToken && accessToken.length > 0) {
      window.location.href = '/';
    }
  }

  render() {
    return (
      <LoginLoading />
    );
  }
}

export default connect(({ oauth }) => ({
  accessToken: oauth.accessToken,
}))(RefreshAccessToken);
