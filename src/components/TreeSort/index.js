import React, { PureComponent } from 'react';
import {
  Tree,
  Spin,
} from 'antd';

const { TreeNode } = Tree;


const defaultProps = {
  sorter: false,
  dataSource: [],
  isEdit: true,
  dataType: {
    parentId: 'parent_id',
    title: 'name',
    value: 'id',
  },
  renderTreeNodes: (data) => {
    return data.map((item) => {
      if (item.children && item.children.length) {
        return (
          <TreeNode title={item.title} key={item.key} >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  },
  onChange: () => { },
};
export default class TreeSorter extends PureComponent {
  constructor(props) {
    super(props);
    const { dataSource } = props;
    const treeData = this.markTreeData(dataSource || []);
    this.state = {
      treeData: treeData || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = nextProps;
    if (JSON.stringify(dataSource) !== JSON.stringify(this.props.dataSource)) {
      const treeData = this.markTreeData(dataSource || []);
      this.setState({ treeData: [...treeData] });
    }
  }

  markTreeData = (data, pid = null) => {
    const tree = [];
    const { dataType: { parentId, value } } = this.props;
    data.forEach((item) => {
      if (item[parentId] === pid) {
        const temp = {
          ...item,
          key: `${item[value]}`,
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


  pushTreeChildren = (data, key, callback) => {
    const newData = [];
    data.forEach((item, index, arr) => {
      const temp = {
        ...item,
      };
      if (item.key === key) {
        temp.children = [];
        temp.children = callback(item, index, arr);
      }
      if (item.children) {
        temp.children = this.pushTreeChildren(item.children, key, callback);
      }
      newData.push(temp);
    });
    return newData;
  }

  handleDrop = (info) => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    let data = [...this.state.treeData];
    let dragObj;

    this.pushTreeChildren(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (info.dropToGap) {
      let ar;
      let i;
      this.pushTreeChildren(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    } else {
      data = this.pushTreeChildren(data, dropKey, (item) => {
        const children = item.children || [];
        children.push(dragObj);
        return children;
      });
    }

    this.setState({ treeData: [...data] }, () => {
      this.props.onChange(data);
    });
  }


  makeTreeProps = () => {
    const { sorter } = this.props;
    const response = {
      ...this.props,
      ...(sorter ? {
        draggable: true,
        onDrop: this.handleDrop,
      } : {}),
    };
    Object.keys(defaultProps).forEach((key) => {
      delete response[key];
    });
    return response;
  }


  render() {
    const { treeData } = this.state;
    const { loading } = this.props;
    return (
      <Spin spinning={loading || false} delay={500}>
        <div key="content" className="tree-view" >
          <Tree {...this.makeTreeProps()}>
            {this.props.renderTreeNodes(treeData)}
          </Tree>
        </div>
      </Spin>
    );
  }
}
TreeSorter.defaultProps = defaultProps;

