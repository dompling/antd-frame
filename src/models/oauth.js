import { getAccessToken } from '../services/oauth';

export default {
  namespace: 'oauth',

  state: {
    accessToken: '',
  },

  effects: {
    * getAccessTokenByAuthCode({ payload, callBack }, { call, put }) {
      try {
        const params = {
          grant_type: 'authorization_code',
          client_id: OA_CLIENT_ID,
          client_secret: OA_CLIENT_SECRET,
          ...payload,
        };
        const response = yield call(getAccessToken, params);
        yield put({
          type: 'saveAccessToken',
          payload: response,
        });
        callBack();
      } catch (e) {
        return e;
      }
    },
    * refreshAccessToken({ payload, callBack }, { call, put }) {
      try {
        const params = {
          grant_type: 'refresh_token',
          refresh_token: localStorage.getItem(`${TOKEN_PREFIX}refresh_token`),
          client_id: OA_CLIENT_ID,
          client_secret: OA_CLIENT_SECRET,
          scope: '',
          ...payload,
        };
        const response = yield call(getAccessToken, params);
        yield put({
          type: 'saveAccessToken',
          payload: response,
        });
        callBack();
      } catch (e) {
        return e;
      }
    },
  },

  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    saveAccessToken(state, { payload }) {
      localStorage.setItem(`${TOKEN_PREFIX}access_token`, payload.access_token);
      localStorage.setItem(`${TOKEN_PREFIX}access_token__expires_in`, new Date().getTime() + ((payload.expires_in - 10) * 1000));
      localStorage.setItem(`${TOKEN_PREFIX}refresh_token`, payload.refresh_token);
      return {
        ...state,
        accessToken: payload.access_token,
      };
    },
  },
};
