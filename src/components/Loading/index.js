import React, { PureComponent } from 'react';

import { Icon } from 'antd';

export default class extends PureComponent {
  render() {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        background: '#f0f2f6 url(/login-bg.svg) center no-repeat fixed',
        backgroundSize: 'cover',
      }}
      >
        <div style={{
          position: 'absolute',
          top: '35%',
          width: '100%',
          textAlign: 'center',
          fontSize: '18px',
          color: '#91d5ff',
        }}
        >
          <Icon type="loading" style={{ fontSize: '50px' }} />
          <p style={{ marginTop: '10px' }}>登录中...</p>
        </div>
      </div>
    );
  }
}
