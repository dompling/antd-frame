import React, { Component } from 'react';
import { connect } from 'dva';
import LoginLoading from '../../components/Loading';
@connect(({ currentUser }) => ({
  currentUser: currentUser.currentUser,
}))
export default class GetAccessToken extends Component {
  componentWillMount() {
    const { location: { pathName, search }, dispatch } = this.props;
    const authCode = search.match(/code=(\w+)$/)[1];
    const params = {
      redirect_uri: pathName,
      code: authCode,
    };
    dispatch({
      type: 'oauth/getAccessTokenByAuthCode',
      payload: params,
      callBack: () => dispatch({ type: 'currentUser/fetchCurrent' }),
    });
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.currentUser).length) {
      window.location.href = localStorage.getItem('redirectUrlAfterGetToken') || '/';
    }
  }

  render() {
    return (
      <LoginLoading />
    );
  }
}
