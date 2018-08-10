import React from 'react';
import Authorized from '../utils/Authorized';
import { getRoutes } from '../utils/utils';

const { AuthorizedRoute } = Authorized;

export default class BlankLayout extends React.PureComponent {
  render() {
    const { routerData, match } = this.props;
    return (
      <div>
        {getRoutes(match.path, routerData).map(item =>
          (
            <AuthorizedRoute
              key={item.key}
              path={item.path}
              component={item.component}
              exact={item.exact}
              authority={item.authority}
              redirectPath={item.redirectPath || '/exception/403'}
            />
          )
        )}
      </div>
    );
  }
}
