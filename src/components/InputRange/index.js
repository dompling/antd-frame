import React, { PureComponent } from 'react';
import { Input } from 'antd';

const InputGroup = Input.Group;
export default class InputBetween extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      value: value || {
        min: null,
        max: null,
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({ value: { ...nextProps.value } });
    }
  }

  handleOnChange = (e, name) => {
    const { value } = this.state;
    const inputValue = e.target ? e.target.value : e;
    value[name] = inputValue;
    this.setState({ value: { ...value } }, () => this.props.onChange(this.state.value));
  }

  render() {
    const { value: { min, max }, width } = this.state;
    const { addonAfter } = this.props;
    return (
      <React.Fragment>
        <InputGroup compact style={{ display: 'flex', ...(width ? { width } : {}) }}>
          <Input
            style={{ flexGrow: 1, textAlign: 'center' }}
            placeholder="最小值"
            value={min ? min.toString() : ''}
            onChange={e => this.handleOnChange(e, 'min')}
            type="number"
          />
          <Input
            style={{
              borderLeft: 0,
              width: 30,
              pointerEvents: 'none',
              backgroundColor: '#fff',
            }}
            placeholder="~"
            disabled
          />
          <Input
            style={{
              flexGrow: 1,
              textAlign: 'center',
              borderLeft: 0,
            }}
            type="number"
            placeholder="最大值"
            value={max ? max.toString() : ''}
            onChange={e => this.handleOnChange(e, 'max')}
          />
          {addonAfter}
        </InputGroup>
      </React.Fragment >
    );
  }
}
InputBetween.defaultProps = {
  addonAfter: null,
  onChange: () => { },
};

