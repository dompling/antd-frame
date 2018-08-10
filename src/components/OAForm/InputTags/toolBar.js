import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Tag,
  Spin,
} from 'antd';
import './index.less';

@connect(({ workflow, loading }) => ({
  content: workflow.variate,
  fetching: loading.effects['workflow/fetchVariate'],
}))
export default class ToolBar extends PureComponent {
  constructor(props) {
    super(props);
    const { fields, makeContents } = this.props;
    const fieldsContent = {};
    if (fields) {
      fields.forEach((item) => {
        fieldsContent[`{?${item.key}?}`] = item.name;
      });
    }
    makeContents();
    this.state = {
      rules: {
        symbol: {
          color: 'volcano',
          title: '运算符号',
          content: {},
        },
        system: {
          color: 'blue',
          title: '系统变量',
          content: {},
        },
        formFields: {
          title: '字段类型',
          content: fieldsContent || {},
        },
      },
    };
  }


  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'workflow/fetchVariate',
      payload: {},
    });
  }

  componentWillReceiveProps(newProps) {
    const { rules, rules: { system, symbol, formFields } } = this.state;
    if (newProps.content !== this.props.content) {
      const { content: { variate, calculation } } = newProps;
      const sysContent = {};
      variate.forEach((item) => {
        sysContent[`{{${item.key}}}`] = item.name;
      });
      const symContent = {};
      calculation.forEach((item) => {
        symContent[`{<${item.id}>}`] = item.code;
      });
      this.setState({
        rules: {
          ...rules,
          system: {
            ...system,
            content: sysContent,
          },
          symbol: {
            ...symbol,
            content: symContent,
          },
        },
      }, this.setPropsContent);
    }
    if (newProps.fields !== this.props.fields) {
      const { fields } = newProps;
      const fieldsContent = {};
      fields.forEach((item) => {
        fieldsContent[`{?${item.key}?}`] = item.name;
      });
      this.setState({
        rules: {
          ...rules,
          formFields: {
            ...formFields,
            content: fieldsContent,
          },
        },
      }, this.setPropsContent);
    }
  }

  setPropsContent = () => {
    const { rules } = this.state;
    let contents = {};
    Object.keys(rules).forEach((key) => {
      contents = {
        ...contents,
        ...rules[key].content,
      };
    });
    this.props.makeContents(contents);
  };

  render() {
    const { rules } = this.state;
    const { fetching, plusItem } = this.props;

    return (
      <Spin spinning={fetching} delay={500}>
        {Object.keys(rules).map((key, index) => {
          if (Object.keys(rules[key].content).length === 0) {
            return '';
          }
          return (
            <div key={key}>
              <label> {`${rules[key].title} ：`} </label>
              {Object.keys(rules[key].content).map((item, count) => {
                const content = rules[key].content[item];
                const k = `${index}-${count}`;
                return (
                  <Tag
                    key={k}
                    onClick={() => plusItem(item)}
                    color={rules[key].color}
                  >
                    {content}
                  </Tag>
                );
              })}
            </div>
          );
        })}
      </Spin>
    );
  }
}
