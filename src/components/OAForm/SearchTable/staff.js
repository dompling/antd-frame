import React from 'react';
import {
  Tooltip,
  Icon,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import styles from './index.less';
import UserCircle from './UserCircle';


export default class extends React.PureComponent {
  handleTagRemove = (removedTag) => {
    this.props.setTagSelectedValue(removedTag);
  };

  render() {
    const { value, showName, valueName, style } = this.props;
    let tagsData = [];
    if (value && value.length > 0) {
      tagsData = value.map((item, index) => {
        return {
          disabled: item.disabled || false,
          value: item[valueName],
          label: item[showName] || '',
          key: index,
        };
      });
    }
    const click = this.props.disabled ? null : {
      onClick: () => {
        this.props.handleModelVisble(true);
      },
    };
    const color = this.props.disabled ? '#f5f5f5' : '#fff';
    const mouseStyle = this.props.disabled ? 'not-allowed' : 'pointer';
    const tags = tagsData.map((item, index) => {
      const tag = item.label;
      const isLongTag = tag.length > 20;
      const key = `tag${item.value}-${index}`;
      // const TooltipKey = `${tag}-${item.value}`;
      const tagElem = (
        <UserCircle
          key={key}
          style={{ cursor: mouseStyle, background: color }}
          closable={this.props.disabled || !item.disabled}
          afterClose={() => this.handleTagRemove(item.key)}
        >
          {isLongTag ? `${tag.slice(0, 20)}...` : tag}
        </UserCircle>
      );
      return isLongTag ? <Tooltip title={tag} key={key}>{tagElem}</Tooltip> : tagElem;
    });

    return (
      <div style={{ ...style }}>
        <QueueAnim>
          {tags}
        </QueueAnim>
        <div
          className={styles.dashed}
          style={{
            cursor: mouseStyle,
            background: color,
            float: 'left',
          }}
          {...click}
        >
          <Icon type="plus" />
        </div>
      </div>
    );
  }
}
