import React from 'react';

import { Form } from 'antd';

export default option => (Component) => {
  const FormComponent = (props) => {
    const { bindForm, form } = props;
    bindForm(form);
    return <Component {...props} />;
  };
  return Form.create(option)(FormComponent);
};
