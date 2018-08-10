import React from 'react';
import { connect } from 'dva';
import Authorized from './utils/Authorized';
import { getRouterData } from './common/router';

const { AuthorizedRoute } = Authorized;
@connect()
export default class extends React.Component {
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'currentUser/fetchUser' });
  }

  render() {
    const { app } = this.props;
    const routerData = getRouterData(app);
    // const GetAceessToken = routerData['/passport/get_access_token'].component;
    const BasicLayout = routerData['/'].component;
    return (
      <AuthorizedRoute
        path="/"
        render={props => <BasicLayout {...props} />}
        authority={['token']}
        redirectPath="/passport/refresh_access_token"
      />
    );
  }
}
