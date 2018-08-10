import React from 'react';
import { Icon } from 'antd';
import 'ant-design-pro/dist/ant-design-pro.css';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

import styles from '../index.less';

function CircleTag(props) {
  const { afterClose, closable, style, onClick, children } = props;
  const tooltip = children.length > 3;
  return (
    <div
      onClick={onClick}
      className={styles.circlContent}
      style={style}
    >
      <div className={styles.iconfont}>
        <Icon type="user" />
        {closable && <Icon type="close" className={styles.close} onClick={() => afterClose()} />}
      </div>
      <div style={{ lineHeight: '16px', paddingTop: 3, width: 46 }}>
        <Ellipsis tooltip={tooltip} lines={1}>
          {children}
        </Ellipsis>
      </div>
    </div>
  );
}
export default CircleTag;
