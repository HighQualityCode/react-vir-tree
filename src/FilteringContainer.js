import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import classNames from 'classnames';

import DefaultGroupRenderer from './filtering/DefaultGroupRenderer';
import {Node} from './shapes/nodeShapes';
import {filterNodes} from './selectors/filtering';

const indexByName = searchTerm => ({name}) => {
  const upperCaseName = name.toUpperCase();
  const upperCaseSearchTerm = searchTerm.toUpperCase();

  return upperCaseName.indexOf(upperCaseSearchTerm.trim()) > -1;
};

export default class FilteringContainer extends React.Component {
  state = {
    filterText: '',
    filterTerm: '',
  };

  getChildContext = () => {
    return {unfilteredNodes: this.props.nodes};
  };

  static childContextTypes = {
    unfilteredNodes: PropTypes.arrayOf(PropTypes.shape(Node)).isRequired,
  };

  static defaultProps = {
    debouncer: debounce,
    groupRenderer: DefaultGroupRenderer,
    indexSearch: indexByName,
  };

  constructor(props) {
    super(props);

    this.setFilterTerm = props.debouncer(this.setFilterTerm, 300);
  }

  setFilterTerm() {
    this.setState(ps => ({filterTerm: ps.filterText}));
  }

  handleFilterTextChange = e => {
    const filterText = e.target.value;

    this.setState({filterText});

    this.setFilterTerm();
  };

  handleFilterTextClear = () => {
    const filterText = '';
    this.setState({filterText});
    this.setFilterTerm();
  };

  render() {
    const {filterTerm, filterText} = this.state;
    const {
      nodes,
      children: treeRenderer,
      groups,
      selectedGroup,
      groupRenderer: GroupRenderer,
      onSelectedGroupChange,
      indexSearch,
      searchPlaceholder = 'Search...',
    } = this.props;

    const relevantNodes =
      groups && selectedGroup && groups[selectedGroup]
        ? filterNodes(groups[selectedGroup].filter, nodes)
        : {nodes, nodeParentMappings: {}};

    const {nodes: filteredNodes, nodeParentMappings} = filterTerm
      ? filterNodes(indexSearch(filterTerm, relevantNodes.nodes), relevantNodes.nodes)
      : relevantNodes;

    return (
      <div className="tree-filter-container">
        <div className={classNames('tree-lookup-input', {group: !!groups})}>
          <input value={filterText} onChange={this.handleFilterTextChange} placeholder={searchPlaceholder} />
          {filterText && (
            <div onClick={this.handleFilterTextClear} className="close-btn">
              <svg class="close-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </div>
          )}
          {groups && <GroupRenderer groups={groups} selectedGroup={selectedGroup} onChange={onSelectedGroupChange} />}
        </div>
        {treeRenderer({nodes: filteredNodes, nodeParentMappings})}
      </div>
    );
  }
}

FilteringContainer.propTypes = {
  children: PropTypes.func.isRequired,
  debouncer: PropTypes.func,
  groups: PropTypes.object,
  selectedGroup: PropTypes.string,
  groupRenderer: PropTypes.func,
  onSelectedGroupChange: PropTypes.func,
  indexSearch: PropTypes.func,
};
