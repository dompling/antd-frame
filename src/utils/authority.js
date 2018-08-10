// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  let authority = [];
  const auth = localStorage.getItem(`antd-${AUTH_NAME}-authority`);
  if (JSON.parse(auth)) {
    authority = JSON.parse(auth);
  }
  if (localStorage.getItem(`${TOKEN_PREFIX}access_token`)
    && localStorage.getItem(`${TOKEN_PREFIX}access_token__expires_in`) > new Date().getTime()) {
    authority.push('token');
  }
  if (localStorage.getItem(`${TOKEN_PREFIX}refresh_token`)) {
    authority.push('refresh-token');
  }
  return authority;
}

export function setAuthority(authority) {
  return localStorage.setItem(`antd-${AUTH_NAME}-authority`, authority);
}
