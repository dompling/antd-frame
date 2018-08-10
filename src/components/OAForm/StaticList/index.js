import React from 'react';
import {
  Icon,
  Modal,
  Button,
  Input,
  Checkbox,
  Select,
  Radio,
  Switch,
  Form,
  InputNumber,
  Tooltip,
} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import CustomerCard from '../FormList/Drag';
import SearchTable from '../SearchTable';
import Address from '../Address';
import DatePicker from '../DatePicker';
import InputTags from '../InputTags';
import TagInput from '../../TagInput';
/**
 * 列表控件 弹窗形式
 * config:{
    sorter: false,   是否排序 默认否
    initialValue: [],  默认值
    onChange: () => { }, 表单change对象
 * }
 */

@DragDropContext(HTML5Backend)
export default class List extends React.Component {
  constructor(props) {
    super(props);
    let { initialValue } = props;
    this.newIndex = 0;
    initialValue = this.dotDataSource(initialValue);
    this.state = {
      dataSource: initialValue || [],
      dataInfo: {},
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = this.state;
    if (nextProps.initialValue.length !== 0) {
      if (
        JSON.stringify(nextProps.initialValue)
        !==
        JSON.stringify(this.props.initialValue)
        && (dataSource.length === 0)
      ) {
        this.setState({ dataSource: this.dotDataSource(nextProps.initialValue) });
      }
    }
  }

  decorateFormItemDeftultValue = (children, data) => {
    return React.Children.map(children, (item) => {
      const { type } = item;
      if (
        type === Input ||
        type === InputNumber ||
        type === Input.TextArea ||
        type === Checkbox ||
        type === DatePicker ||
        type === Select ||
        type === Radio ||
        type === Switch ||
        type === Input.Search ||
        type === SearchTable ||
        type === Address ||
        type === InputTags ||
        type === TagInput
      ) {
        data.push(item);
      } else if (React.isValidElement(item) && item.props.children) {
        this.decorateFormItemDeftultValue(item.props.children, data);
      }
    });
  }

  dotDataSource = (initialValue) => {
    const newValue = initialValue.map((item, index) => {
      return {
        ...item,
        onlyId: index + 1,
      };
    });
    this.newIndex = initialValue.length;
    return newValue;
  }

  handleOnChange = (e, formItemName) => {
    const value = e && e.target ? e.target.value : e;
    const { dataInfo } = this.state;
    this.setState({
      dataInfo: {
        ...dataInfo,
        [formItemName]: value,
      },
    });
  }

  makeFormItemElementProps = (item, isReadOnly) => {
    let newProps = {};
    if (isReadOnly) {
      newProps = {
        disabled: true,
        readOnly: true,
      };
    } else {
      newProps.onChange = (e) => {
        this.handleOnChange(e, item.props.name);
      };
    }
    const { dataInfo } = this.state;
    newProps.value = dataInfo[item.props.name];
    return newProps;
  }


  handleEditItem = (id) => {
    const { dataSource } = this.state;
    const [dataInfo] = dataSource.filter(item => item.onlyId === id);
    this.setState({
      dataInfo,
    }, () => this.handleVisible(true));
  }

  handleOk = () => {
    const { dataInfo, dataSource } = this.state;
    if (Object.keys(dataInfo).length === 0) {
      this.handleVisible(false);
      return;
    }
    let newDataSource = dataSource;
    if (dataInfo.onlyId) {
      newDataSource = dataSource.map((item) => {
        let newItem = item;
        if (newItem.onlyId === dataInfo.onlyId) {
          newItem = dataInfo;
        }
        return newItem;
      });
    } else {
      this.newIndex += 1;
      dataInfo.onlyId = this.newIndex;
      newDataSource.push(dataInfo);
    }
    this.setState({
      dataSource: [...newDataSource],
    }, () => {
      this.handleVisible(false);
      const value = this.state.dataSource.map((item) => {
        const temp = { ...item };
        delete temp.onlyId;
        return temp;
      });
      this.props.onChange(value);
    });
  }

  handleRemove = (id) => {
    const { dataSource } = this.state;
    const newDataSource = dataSource.filter(item => item.onlyId !== id);
    this.setState({
      dataSource: [...newDataSource],
    }, () => {
      this.handleVisible(false);
      this.props.onChange(this.state.dataSource);
    });
  }

  decorateFormItemByTree = (children, isReadOnly) => {
    return React.Children.map(children, (item) => {
      const { type } = item;
      if (
        type === Input ||
        type === InputNumber ||
        type === Input.TextArea ||
        type === Checkbox ||
        type === DatePicker ||
        type === Select ||
        type === Radio ||
        type === Switch ||
        type === Input.Search ||
        type === SearchTable ||
        type === Address ||
        type === InputTags ||
        type === TagInput
      ) {
        const newProps = this.makeFormItemElementProps(item, isReadOnly);
        return React.cloneElement(item, newProps);
      } else if (React.isValidElement(item) && item.props.children) {
        const decoratedChildren = this.decorateFormItemByTree(
          item.props.children,
          isReadOnly
        );
        return React.cloneElement(item, null, decoratedChildren);
      } else {
        return item;
      }
    });
  }

  handleVisible = (flag) => {
    this.setState({ visible: !!flag });
  }

  makeButtom = (id) => {
    return [
      <Tooltip key="delete" title="删除" placement="right">
        <Icon
          className="dynamic-delete-button"
          type="close"
          onClick={() => this.handleRemove(id)}
        />
      </Tooltip>,
      <Tooltip key="edit" title="编辑" placement="right">
        <a>
          <Icon
            type="form"
            onClick={() => this.handleEditItem(id)}
          />
        </a>
      </Tooltip>,
    ];
  }

  moveCard = (dragIndex, hoverIndex) => {
    const { dataSource } = this.state;
    const dragList = dataSource[dragIndex];
    const newState = update(this.state, {
      dataSource: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragList]],
      },
    });
    const newDataSource = newState.dataSource.map((item, i) => {
      return {
        ...item,
        sorter: i,
      };
    });
    this.setState({ dataSource: newDataSource }, () => {
      this.props.onChange(this.state.dataSource);
    });
  }

  makeListContent = () => {
    const { dataSource } = this.state;
    const {
      children,
      sorter,
      listItemContent,
      error,
    } = this.props;
    const list = dataSource.map((value, i) => {
      const errorObj = typeof error[i] === 'object' ? error[i] : {};
      const form = listItemContent ?
        listItemContent(value, errorObj) :
        this.renderFormItemByTree(children, value, true);
      const key = i;
      const content = (
        <div
          key={key}
          style={{
            flexGrow: 1,
            display: 'flex',
            ...(!sorter ? {
              borderBottom: '1px solid #ccc',
              marginTop: '8px',
              paddingBottom: '8px',
            } : null),
          }}
        >
          <div style={{ flexGrow: 1 }}>
            {form}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: '10px',
          }}
          >
            {this.makeButtom(value.onlyId)}
          </div>
        </div>
      );
      const result = sorter ? (
        <CustomerCard
          key={value.onlyId}
          index={i}
          id={value.onlyId}
          content={content}
          moveCard={this.moveCard}
        />
      ) : content;
      return result;
    });
    return list;
  }


  renderFormItemByTree = (children, isReadOnly) => {
    return React.Children.map(children, (item) => {
      if (item.type === Form.Item) {
        return (
          <Form.Item {...item.props} >
            {this.decorateFormItemByTree(item.props.children, isReadOnly)}
          </Form.Item>
        );
      } else if (React.isValidElement(item) && item.props.children) {
        return React.cloneElement(
          item,
          null,
          this.renderFormItemByTree(item.props.children, isReadOnly)
        );
      } else {
        return item;
      }
    });
  }

  render() {
    const { visible } = this.state;
    const {
      children,
      title,
      width,
      zIndex,
      bodyStyle,
      height,
    } = this.props;
    return (
      <React.Fragment>
        {this.makeListContent()}
        <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
          <Button
            type="dashed"
            onClick={() => {
              const formItem = [];
              this.decorateFormItemDeftultValue(children, formItem);
              const dataInfo = {};
              formItem.forEach((item) => {
                dataInfo[item.props.name] = item.props.value;
              });
              this.setState({ dataInfo }, () => this.handleVisible(true));
            }}
            style={{ width: '60%' }}
          >
            <Icon type="plus" /> 添加
          </Button>
        </div>
        <Modal
          destroyOnClose
          title={title || '信息'}
          visible={visible}
          onCancel={() => this.handleVisible(false)}
          onOk={this.handleOk}
          afterClose={() => { this.setState({ dataInfo: {} }); }}
          width={width}
          zIndex={zIndex}
          bodyStyle={{
            ...bodyStyle,
            ...({ height }),
          }}
        >
          {this.renderFormItemByTree(children)}
        </Modal>
      </React.Fragment>
    );
  }
}
List.defaultProps = {
  sorter: false,
  initialValue: [],
  onChange: () => { },
  width: 520,
  zIndex: 1000,
  bodyStyle: { overflow: 'auto' },
  error: {},
};
