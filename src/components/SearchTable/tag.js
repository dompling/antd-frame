import React from 'react';
import {
  Tag,
  Tooltip,
  Icon,
} from 'antd';

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      selectValue: value || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (value !== this.props.value) {
      this.setState({ selectValue: value });
    }
  }

  handleTagRemove = (removedTag) => {
    const { selectValue } = this.state;
    const value = selectValue.filter(item => item.key !== removedTag);
    this.props.setTagSelectedValue(value);
  };

  handleModal = () => {
    this.props.showModal();
  };

  render() {
    const { selectValue } = this.state;

    const click = this.props.disabled ? null : { onClick: this.handleModal };
    const color = this.props.disabled ? '#f5f5f5' : '#fff';
    const mouseStyle = this.props.disabled ? 'not-allowed' : 'pointer';

    const tags = selectValue.map((item) => {
      const tag = item.label;
      const isLongTag = tag.length > 20;
      const key = `tag${item.key}`;
      const TooltipKey = `${tag}-${item.key}`;
      const tagElem = (
        <Tag
          key={key}
          value={item.key}
          style={{ cursor: mouseStyle, background: color }}
          closable={!this.props.disabled}
          afterClose={() => this.handleTagRemove(item.key)}
        >
          {isLongTag ? `${tag.slice(0, 20)}...` : tag}
        </Tag>
      );
      return isLongTag ? <Tooltip title={tag} key={TooltipKey}>{tagElem}</Tooltip> : tagElem;
    });

    return (
      <div>
        {tags}
        <Tag
          key="tag.add"
          {...click}
          style={{ cursor: mouseStyle, background: color, borderStyle: 'dashed' }}
        >
          <Icon type="plus" /> {this.props.placeholder}
        </Tag>
      </div>
    );
  }
}
