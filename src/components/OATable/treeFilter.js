import React, { PureComponent } from 'react';
import { Tree, Switch } from 'antd';

const { TreeNode } = Tree;

export default class TreeFilter extends PureComponent {
  constructor(props) {
    super(props);
    const { treeFilters: { parentVal } } = this.props;
    const treeData = this.markTreeData(props.treeFilters.data, parentVal);
    this.state = {
      checkedKeys: {
        checked: [],
        halfChecked: [],
      },
      selectChild: false,
      treeData: treeData || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { treeFilters: { data, parentVal } } = nextProps;
    if (data !== this.props.treeFilters.data) {
      const treeData = this.markTreeData(data, parentVal);
      this.setState({ treeData });
    }
  }

  markTreeData = (data, pId) => {
    const tree = [];
    const { treeFilters: { parentId, title, value } } = this.props;
    let pid = pId;
    if (pId === undefined) {
      pid = 0;
    }
    data.forEach((item) => {
      if (item[parentId] === pid) {
        const temp = {
          title: item[title],
          key: `${item[value]}`,
          disabled: item.disabled || false,
        };
        const children = this.markTreeData(data, item[value]);
        if (children.length > 0) {
          temp.children = children;
        }
        tree.push(temp);
      }
    });
    return tree;
  };

  handleCheck = (checkedKeys) => {
    this.setState({ checkedKeys });
  }

  handleSwitchOnChange = (checked) => {
    this.setState({
      selectChild: checked,
      checkedKeys: {
        checked: [],
        halfChecked: [],
      },
    });
  };

  handleResetTree = () => {
    this.setState({
      checkedKeys: {
        checked: [],
        halfChecked: [],
      },
    }, () => {
      const { handleConfirm } = this.props;
      handleConfirm([]);
    });
  };

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item} disabled={item.disabled}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} disabled={item.disabled} />;
    });
  }

  render() {
    const { handleConfirm } = this.props;
    const { checkedKeys, treeData, selectChild } = this.state;
    const result = selectChild ? checkedKeys : checkedKeys.checked;
    return (
      <div className="ant-table-filter-dropdown ant-table-tree-filter">
        <div className="table-filter-title">
          <span>包含下级:  </span>
          <Switch
            size="small"
            checked={selectChild}
            onChange={this.handleSwitchOnChange}
          />
        </div>
        <div className="scroll-bar" style={{ maxHeight: 208 }}>
          <Tree
            checkable
            checkStrictly={!selectChild}
            checkedKeys={checkedKeys}
            onCheck={this.handleCheck}
          >
            {this.renderTreeNodes(treeData)}
          </Tree>
        </div>
        <div className="ant-table-filter-dropdown-btns">
          <a className="ant-table-filter-dropdown-link confirm" onClick={() => handleConfirm(result)}>确定</a>
          <a className="ant-table-filter-dropdown-link clear" onClick={() => this.handleResetTree()}>重置</a>
        </div>
      </div>
    );
  }
}
