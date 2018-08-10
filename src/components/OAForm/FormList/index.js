import React from 'react';
import {
  Icon,
  Button,
  Modal,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import update from 'immutability-helper';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import CustomerCard from './Drag';
import styles from './index.less';

const { confirm } = Modal;

export default (CustomerFrom) => {
  @DragDropContext(HTML5Backend)
  class newFrom extends React.PureComponent {
    constructor(props) {
      super(props);
      this.uuid = 0;
      let { initialValue } = props;
      if (initialValue.length > 0) {
        initialValue = initialValue.map((item, index) => {
          return {
            ...item,
            key: index + 1,
          };
        });
        this.uuid = initialValue.length;
      }
      this.state = {
        dataSource: initialValue || [],
      };
    }

    componentWillReceiveProps(nextProps) {
      const { dataSource } = this.state;
      if (
        JSON.stringify(nextProps.initialValue)
        !==
        JSON.stringify(this.props.initialValue)
        && (dataSource.length === 0)
      ) {
        this.uuid = 0;
        const initValue = nextProps.initialValue.map((item, index) => {
          return {
            ...item,
            key: index + 1,
          };
        });
        this.uuid = initValue.length;
        this.setState({ dataSource: initValue });
      }
    }

    showDeleteConfirm = (key, index) => {
      confirm({
        title: '确定要删除吗',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          this.remove(key, index);
        },
      });
    }

    remove = (key, index) => {
      const { dataSource } = this.state;
      const newDataSource = dataSource.filter(item => item.key !== key);
      this.setState({ dataSource: [...newDataSource] }, () => this.countNumber(null, index));
    }

    add = () => {
      const { dataSource } = this.state;
      this.uuid += 1;
      dataSource.push({ key: this.uuid });
      this.setState(
        { dataSource: [...dataSource] },
        () => this.countNumber({}, dataSource.length - 1)
      );
    }

    countNumber = (params, index) => {
      const { countNumber, onChange } = this.props;
      if (countNumber) countNumber(this.state.dataSource.length);
      onChange(params, index);
    }

    makeRmoveIcon = (k, index) => {
      return (
        <Icon
          className="dynamic-delete-button"
          type="close"
          onClick={() => this.showDeleteConfirm(k, index)}
        />
      );
    }

    moveCard = (dragIndex, hoverIndex) => {
      const { dataSource } = this.state;
      const dragList = dataSource[dragIndex];
      const newState = update(this.state, {
        dataSource: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragList]],
        },
      });
      const newDataSource = newState.dataSource.map((item, order) => {
        return {
          ...item,
          sorter: order,
        };
      });
      this.setState({ dataSource: newDataSource });
    }

    makeNewCustomerFroms = () => {
      const { sorter, name, style } = this.props;
      const newList = this.state.dataSource.map((item, i) => {
        const key = `${item.key}`;
        const newName = `${name}[${i}]`;
        const content = (
          <div key={key} className={styles.container} style={style}>
            <div className={styles.header}>
              {this.makeRmoveIcon(item.key, i)}
            </div>
            <div className={styles.content}>
              <CustomerFrom
                {...this.props}
                index={i}
                value={item}
                name={newName}
              />
            </div>
          </div>
        );
        const result = sorter ? (
          <CustomerCard
            key={key}
            index={i}
            id={key}
            content={content}
            moveCard={this.moveCard}
          />
        ) : content;
        return result;
      });
      return newList;
    }

    render() {
      const { width, style, placeholder } = this.props;
      const btnWidth = { width: width || (style && style.width) };
      return (
        <React.Fragment>
          <QueueAnim>
            {this.makeNewCustomerFroms()}
          </QueueAnim>
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
              height: 32,
              lineHeight: '32px',
            }}
          >
            <Button type="dashed" onClick={this.add} style={{ ...btnWidth }}>
              <Icon type="plus" /> {placeholder || '添加'}
            </Button>
          </div>
        </React.Fragment>
      );
    }
  }

  newFrom.defaultProps = {
    name: 'keys',
    sorter: false,
    initialValue: [],
  };
  return newFrom;
};
