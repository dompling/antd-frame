import mockjs from 'mockjs';
import { getRule, postRule } from './mock/rule';
import { getFormType, formTypeSave } from './mock/workflow';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getFakeChartData } from './mock/chart';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
// import { delay } from 'roadhog-api-doc';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  // 支持值为 Object 和 Array
  'GET /api/get_current_user': {
    $desc: "获取当前用户接口",
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: {
      realname: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      notifyCount: 12,
    },
  },
  // GET POST 可省略
  'GET /api/users': [{
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  }, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  }, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  }],
  'GET /api/project/notice': getNotice,
  'GET /api/activities': getActivities,
  'POST /api/workflow/form_type/list': getFormType,
  'POST /api/workflow/form_type/save': formTypeSave,
  'GET /api/rule': getRule,
  'POST /api/rule': getRule,
  'POST /api/rule/add': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postRule,
  },
  'POST /api/forms': (req, res) => {
    res.send({ message: 'Ok' });
  },
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 150, 'type|0-2': 1 }]
  }),
  'GET /api/fake_list': getFakeList,
  'GET /api/fake_chart_data': getFakeChartData,
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/login/account': (req, res) => {
    const { password, userName, type } = req.body;
    if (password === '888888' && userName === 'admin') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: ['admin']
      });
      return;
    }
    if (password === '123456' && userName === 'user') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: ['user']
      });
      return;
    }
    res.send({
      status: 'error',
      type,
      currentAuthority: ['guest']
    });
  },
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
  'GET /api/notices': getNotices,
  'GET /api/500': (req, res) => {
    res.status(500).send({
      "timestamp": 1513932555104,
      "status": 500,
      "error": "error",
      "message": "error",
      "path": "/base/category/list"
    });
  },
  'GET /api/404': (req, res) => {
    res.status(404).send({
      "timestamp": 1513932643431,
      "status": 404,
      "error": "Not Found",
      "message": "No message available",
      "path": "/base/category/list/2121212"
    });
  },
  'GET /api/403': (req, res) => {
    res.status(403).send({
      "timestamp": 1513932555104,
      "status": 403,
      "error": "Unauthorized",
      "message": "Unauthorized",
      "path": "/base/category/list"
    });
  },
};
export default !noProxy ? {
  // 线上
  
  // OA
  'POST /oauth/(.*)': 'http://of.xigemall.com/oauth/',
  'GET /api/oa/(.*)': 'http://of.xigemall.com/api/',
  
  // 积分制
  'GET /api/(.*)': 'http://120.79.121.158:8004/api/',
  'POST /api/(.*)': 'http://120.79.121.158:8004/api/',
  'PUT /api/(.*)': 'http://120.79.121.158:8004/api/',
  'DELETE /api/(.*)': 'http://120.79.121.158:8004/api/',
  } : {
  // 张博涵
  'GET /api/oa/current-user(.*)': 'http://192.168.20.238:8003/api/current-user',
  'GET /api/oa/departments(.*)': 'http://192.168.20.238:8003/api/departments',
  'GET /api/oa/staff(.*)': 'http://192.168.20.238:8003/api/staff',
  
  // 张博涵
  'POST /oauth/(.*)': 'http://localhost.oaupdate.org/oauth/',
  'POST /oauth/(.*)': 'http://192.168.20.238:8003/oauth/',
  'GET /api/oa/(.*)': 'http://192.168.20.238:8007/api/',
  // 'GET /api/(.*)': 'http://192.168.20.238:8007/api/',
  // 'POST /api/(.*)': 'http://192.168.20.238:8007/api/',
  // 'PUT /api/(.*)': 'http://192.168.20.238:8007/api/',
  // 'DELETE /api/(.*)': 'http://192.168.20.238:8007/api/',
  
  // 张卫
  'GET /api/(.*)': 'http://PMS.test/api/',
  'POST /api/(.*)': 'http://PMS.test/api/',
  'PUT /api/(.*)': 'http://PMS.test/api/',
  'DELETE /api/(.*)': 'http://PMS.test/api/',
  };
  