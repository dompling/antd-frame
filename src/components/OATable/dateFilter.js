import React, { PureComponent } from 'react';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      date: [],
    };
  }

  onChange = (dates, dateStrings) => {
    this.setState({
      value: [{
        min: dateStrings[0],
        max: dateStrings[1],
      }],
      date: dates,
    });
  };

  resetOnSearchTime = () => {
    const { onSearchTime } = this.props;
    this.setState({
      value: [],
      date: [],
    }, () => {
      onSearchTime([]);
    });
  };

  makeExtraFooter = () => {
    const { onSearchTime } = this.props;
    const { value } = this.state;
    return (
      <div className="ant-table-filter-dropdown-btns">
        <a className="ant-table-filter-dropdown-link clear" onClick={() => this.resetOnSearchTime()}>重置</a>
        <a className="ant-table-filter-dropdown-link confirm" onClick={() => onSearchTime(value)}>确定</a>
      </div>
    );
  };

  render() {
    const { dateFilterVisible } = this.props;
    const { date } = this.state;
    const dateFormat = 'YYYY-MM-DD';
    return (
      <div className="ant-table-filter-dropdown">
        <RangePicker
          format={dateFormat}
          open={dateFilterVisible}
          defaultValue={date}
          renderExtraFooter={this.makeExtraFooter}
          getCalendarContainer={(trigger) => {
            return trigger;
          }}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
