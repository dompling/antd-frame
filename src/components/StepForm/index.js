import React from 'react';
import {
  Input,
  Button,
  Transfer,
  Form,
  Radio,
  message,
  Badge,
} from 'antd';
import { connect } from 'dva';
import SearchTable from '../SearchTable';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;


@connect(({ staffs, loading }) => ({
  staff: staffs.staff,
  staffSearcherResult: staffs.tableResult,
  staffSearcherTotal: staffs.total,
  staffsLoading: loading.effects['staffs/fetchStaff'],
}))
@Form.create()
export default class StepForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { data, hiddenData } = this.props;

    let editData = [];

    if (data.hidden_fields) {
      hiddenData.forEach((item) => {
        if (data.hidden_fields.indexOf(item.key) === -1) {
          editData.push(item);
        }
      });
    } else {
      editData = hiddenData;
    }

    const requireData = [];
    if (data.edits) {
      editData.forEach((item) => {
        if (data.edits.indexOf(item.key) !== -1) {
          requireData.push(item);
        }
      });
    }

    const defaultValue = data.name ? data : {
      name: '',
      description: '',
      allow_condition: '',
      skip_condition: '',
      hidden_fields: [],
      editable_fields: [],
      required_fields: [],
      approvers: [],
      send_back_type: 0,
      concurrent_type: 0,
      merge_type: 0,
      start_callback_uri: '',
      check_callback_uri: '',
      approve_callback_uri: '',
      send_back_callback_uri: '',
      transfer_callback_uri: '',
      end_callback_uri: '',
      next_step_key: [],
      prev_step_key: [],
    };


    this.state = {
      hiddenFields: {
        selectedKeys: [],
        targetKeys: data.hidden_fields || [],
        data: [],
      },
      editFields: {
        selectedKeys: [],
        targetKeys: data.editable_fields || [],
        data: requireData || [],
      },
      requireFields: {
        selectedKeys: [],
        targetKeys: data.required_fields || [],
        data: [],
      },
      editData: editData || [],
      dataCommit: defaultValue,
      approvers: [],
      staffSearcherParams: '',
    };
  }

  handleHiddenChange = (nextTargetKeys) => {
    const { hiddenFields } = this.state;
    const { hiddenData } = this.props;

    const data = hiddenData.forEach((item) => {
      if (nextTargetKeys.indexOf(item.key) !== -1) {
        return item;
      }
    });

    this.setState({ hiddenFields: { ...hiddenFields, targetKeys: nextTargetKeys, data } }, () => {
      this.editDataList(nextTargetKeys);
    });
  };

  handleHiddenSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    const data = [...sourceSelectedKeys, ...targetSelectedKeys];
    const { hiddenFields } = this.state;
    this.setState({
      hiddenFields: {
        ...hiddenFields,
        selectedKeys: data,
      },
    });
  };

  editDataList = (d) => {
    this.setState({
      editFields: {
        targetKeys: [],
        selectedKeys: [],
        data: [],
      },
      requireFields: {
        selectedKeys: [],
        targetKeys: [],
        data: [],
      },
    });
    if (!d) return;
    const { hiddenData } = this.props;
    const editData = [];
    if (hiddenData.length > 0) {
      hiddenData.forEach((item) => {
        if (d.indexOf(item.key) === -1) {
          editData.push(item);
        }
      });
    }
    this.setState({ editData });
  };

  handleEditChange = (nextTargetKeys) => {
    const { editFields, editData } = this.state;
    const data = [];
    editData.forEach((item) => {
      if (nextTargetKeys.indexOf(item.key) !== -1) {
        data.push(item);
      }
    });
    this.setState({
      editFields: { ...editFields, targetKeys: nextTargetKeys, data },
      requireFields: {
        selectedKeys: [],
        targetKeys: [],
        data: [],
      },
    });
  };

  handleEditSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    const data = [...sourceSelectedKeys, ...targetSelectedKeys];
    const { editFields } = this.state;
    this.setState({ editFields: { ...editFields, selectedKeys: data } });
  };

  handleRequireChange = (nextTargetKeys) => {
    const { requireFields, editFields } = this.state;
    const data = [];
    editFields.data.forEach((item) => {
      if (nextTargetKeys.indexOf(item.key) === 0) {
        data.push(item);
      }
    });
    this.setState({ requireFields: { ...requireFields, targetKeys: nextTargetKeys, data } });
  };

  handleRequireSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    const data = [...sourceSelectedKeys, ...targetSelectedKeys];
    const { requireFields } = this.state;
    this.setState({ requireFields: { ...requireFields, selectedKeys: data } });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { hiddenFields, editFields, requireFields, dataCommit } = this.state;
        const { callbackHandleFlowChart, callbackRemoveTabs, onlyKey } = this.props;
        const commitSource = {
          ...dataCommit,
          ...values,
          step_key: onlyKey,
          hidden_fields: hiddenFields.targetKeys,
          editable_fields: editFields.targetKeys,
          required_fields: requireFields.targetKeys,
        };

        const type = typeof this.props.data.step_key === 'number';
        const result = callbackHandleFlowChart(commitSource, type);
        if (result) {
          callbackRemoveTabs(`newTabs${onlyKey}`);
          message.info('生成流程成功！');
        } else {
          message.error('存在相同步骤名，请重新输入步骤！');
        }
      }
    });
  };

  handleReset = () => {
    this.setState({
      hiddenFields: {
        selectedKeys: [],
        targetKeys: [],
        data: [],
      },
      editFields: {
        selectedKeys: [],
        targetKeys: [],
        data: [],
      },
      requireFields: {
        selectedKeys: [],
        targetKeys: [],
        data: [],
      },
      editData: this.props.hiddenData,
      dataCommit: [],
    });
    scrollTo(0, 0);
  };

  searchComponent = () => {
    const { staffSearcherResult, staffSearcherTotal } = this.props;
    const { staffSearcherParams, approvers, dataCommit } = this.state;
    const statusMap = ['default', 'processing', 'success', 'error'];

    const columns = [
      {
        title: '员工编号',
        dataIndex: 'staff_sn',
        searcher: true,
        sorter: true,
      },
      {
        title: '姓名',
        dataIndex: 'realname',
        searcher: true,
      },
      {
        title: '品牌',
        dataIndex: 'brand.name',
        searcher: true,
      }, {
        title: '部门',
        dataIndex: 'department.full_name',
        searcher: true,
      }, {
        title: '状态',
        dataIndex: 'status',
        sorter: true,
        render: val => <Badge status={statusMap[val.id > 0 ? 2 : 3]} text={val.name} />,
      },
    ];
    const tableProps = {
      columns,
      data: staffSearcherResult[staffSearcherParams],
      total: staffSearcherTotal,
      loading: this.props.staffsLoading,
      valueIndex: 'staff_sn',
      labelIndex: 'realname',
      fetchDataSource: (params) => {
        const { dispatch } = this.props;
        dispatch({
          type: 'staffs/fetchStaff',
          payload: params,
        });
        this.setState({
          staffSearcherParams: JSON.stringify(params),
        });
      },
    };

    return (
      <SearchTable
        multiple
        placeholder="请选择员工"
        style={{ width: 918, height: 30 }}
        modelStyle={{ width: '800px', height: '500px' }}
        value={approvers}
        tableProps={tableProps}
        onChange={(value) => {
          this.setState({
            dataCommit: {
              ...dataCommit,
              approvers: [...value],
            },
          });
        }}
      />
    );
  };

  render() {
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };
    const { submitting, hiddenData } = this.props;
    const {
      hiddenFields,
      editFields,
      editData,
      requireFields,
      dataCommit,
    } = this.state;


    const disVisible = editFields.data.length === 0 ? 'none' : 'block';
    const editVisible = editData.length === 0 ? 'none' : 'block';
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        id="addTypeForm"
        onSubmit={this.handleSubmit}
      >
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="名称"
          name="name"
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              message: '请输入名称',
            }, {
              max: 20,
              message: '最大字符不能超过20',
            }],
            initialValue: dataCommit.name,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="描述"
          name="description"
        >
          {getFieldDecorator('description', {
            rules: [{
              required: true, message: '请输入描述',
            }],
            initialValue: dataCommit.description,
          })(
            <Input placeholder="请输入" />
          )}

        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="审批人"
        >
          {getFieldDecorator('approvers', {
            rules: [{
              required: true, message: '审批人不能为空！',
            }],
            initialValue: dataCommit.approvers,
          })(
            <Input hidden placeholder="请输入" />
          )}
          {this.searchComponent()}
        </FormItem>


        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="访问条件"
          name="allow_condition"
        >
          {getFieldDecorator('allow_condition', {
            initialValue: dataCommit.allow_condition,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="略过条件"
          name="skip_condition"
        >
          {getFieldDecorator('skip_condition', {
            initialValue: dataCommit.skip_condition,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrappercol={{ span: 15 }}
          label="隐藏字段"
          name="hidden_fields"
        >
          <Transfer
            dataSource={hiddenData}
            titles={['待选', '选中列表']}
            targetKeys={hiddenFields.targetKeys}
            selectedKeys={hiddenFields.selectedKeys}
            onChange={this.handleHiddenChange}
            onSelectChange={this.handleHiddenSelectChange}
            render={item => item.title}
          />
        </FormItem>

        <FormItem
          style={{ display: editVisible }}
          labelCol={{ span: 5 }}
          wrappercol={{ span: 15 }}
          label="可编辑字段"
          name="editable_fields"
        >
          <Transfer
            dataSource={editData}
            titles={['待选', '选中列表']}
            targetKeys={editFields.targetKeys}
            selectedKeys={editFields.selectedKeys}
            onChange={this.handleEditChange}
            onSelectChange={this.handleEditSelectChange}
            render={item => item.title}
          />
        </FormItem>
        <FormItem
          style={{ display: disVisible }}
          labelCol={{ span: 5 }}
          wrappercol={{ span: 15 }}
          label="必填字段"
          name="required_fields"
        >
          <Transfer
            dataSource={editFields.data}
            titles={['待选', '选中列表']}
            targetKeys={requireFields.targetKeys}
            selectedKeys={requireFields.selectedKeys}
            onChange={this.handleRequireChange}
            onSelectChange={this.handleRequireSelectChange}
            render={item => item.title}
          />
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrappercol={{ span: 15 }}
          label="退回类型"
          name="send_back_type"
        >
          {getFieldDecorator('send_back_type', {
            rules: [{
              required: true, message: '请选择退回类型',
            }],
            initialValue: dataCommit.send_back_type,
          })(
            <RadioGroup name="radiogroup1">
              <RadioButton value={0}>禁止</RadioButton>
              <RadioButton value={1}>到上一步</RadioButton>
              <RadioButton value={2}>到之前任意步骤</RadioButton>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrappercol={{ span: 15 }}
          label="并发类型"
          name="concurrent_type"
        >
          {getFieldDecorator('concurrent_type', {
            rules: [{
              required: true, message: '请选择并发类型',
            }],
            initialValue: dataCommit.concurrent_type,
          })(
            <RadioGroup name="radiogroup2">
              <RadioButton value={0}>禁止</RadioButton>
              <RadioButton value={1}>允许</RadioButton>
              <RadioButton value={2}>强制</RadioButton>
            </RadioGroup>
          )}

        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrappercol={{ span: 15 }}
          label="合并类型"
          name="merge_type"
        >
          {getFieldDecorator('merge_type', {
            rules: [{
              required: true, message: '请选择合并类型',
            }],
            initialValue: dataCommit.merge_type,
          })(
            <RadioGroup name="radiogroup3">
              <RadioButton value={0}>非必须</RadioButton>
              <RadioButton value={1}>必须</RadioButton>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="开始回调地址"
          name="start_callback_uri"
        >
          {getFieldDecorator('start_callback_uri', {
            rules: [{
              type: 'url', message: '请输入正确的开始回调地址！',
            }],
            initialValue: dataCommit.start_callback_uri,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="查看回调地址"
          name="check_callback_uri"
        >
          {getFieldDecorator('check_callback_uri', {
            rules: [{
              type: 'url', message: '请输入正确的查看回调地址！',
            }],
            initialValue: dataCommit.check_callback_uri,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="通过回调地址"
          name="approve_callback_uri"
        >
          {getFieldDecorator('approve_callback_uri', {
            rules: [{
              type: 'url', message: '请输入正确的通过回调地址！',
            }],
            initialValue: dataCommit.approve_callback_uri,
          })(
            <Input placeholder="请输入" />
          )}

        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="退回回调地址"
          name="send_back_callback_uri"
        >
          {getFieldDecorator('send_back_callback_uri', {
            rules: [{
              type: 'url', message: '请输入正确的退回回调地址！',
            }],
            initialValue: dataCommit.send_back_callback_uri,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="转交回调地址"
          name="transfer_callback_uri"
        >
          {getFieldDecorator('transfer_callback_uri', {
            rules: [{
              type: 'url', message: '请输入正确的转交回调地址！',
            }],
            initialValue: dataCommit.transfer_callback_uri,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="结束回调地址"
          name="end_callback_uri"
        >
          {getFieldDecorator('end_callback_uri', {
            rules: [{
              type: 'url', message: '请输入正确的结束回调地址！',
            }],
            initialValue: dataCommit.end_callback_uri,
          })(
            <Input placeholder="请输入" />
          )}

        </FormItem>

        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>生成流程</Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={this.handleReset}
          >
            重新输入流程
          </Button>
        </FormItem>
      </Form>
    );
  }
}
