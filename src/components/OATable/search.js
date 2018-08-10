import React, { PureComponent } from 'react';

export default (SearchComponent) => {
  return class NewSearchComponent extends PureComponent {
    state = {
      formFilter: {},
    }

    makeNewSearchProps = () => {
      return {
        search: this.moreSearch,
        ...this.props,
      };
    }

    moreSearch = (formFilter) => {
      const newFilter = this.props.defaultFilter;
      newFilter.filters = {
        ...this.props.defaultFilter.filters,
        ...formFilter,
      };
      this.setState({ formFilter }, () => this.props.fetchDataSource(newFilter));
    };

    render() {
      return <SearchComponent {...this.makeNewSearchProps()} />;
    }
  };
};
