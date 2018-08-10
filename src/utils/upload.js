import fetch from 'dva/fetch';
import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

function checkStatus(response) {
  const { status, url, statusText } = response;
  if ((status >= 200 && status < 300) || status === 400 || status === 422) {
    return response;
  }
  const errortext = codeMessage[status] || statusText;
  notification.error({
    message: `请求错误 ${status}: ${url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = status;
  error.response = response;
  throw error;
}
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function upload(url, options) {
  const urlParam = url;
  const defaultOptions = {
    credentials: 'include',
  };

  const accessToken = localStorage.getItem(`${TOKEN_PREFIX}access_token`);
  const expiresIn = localStorage.getItem(`${TOKEN_PREFIX}access_token__expires_in`);

  if (accessToken && expiresIn > new Date().getTime()) {
    defaultOptions.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  } else {
    store.dispatch(routerRedux.push('/passport/redirect_to_authorize'));
  }
  const newOptions = {
    ...defaultOptions,
    ...options,
  };
  newOptions.headers.Accept = 'application/json';

  return fetch(urlParam, newOptions)
    .then(checkStatus)
    .then((response) => {
      if (newOptions.method === 'DELETE' && response.status === 204) {
        return response.text();
      }
      return response.json();
    });
}
