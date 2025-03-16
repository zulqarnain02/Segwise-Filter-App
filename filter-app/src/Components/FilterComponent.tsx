import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Filter, Trash2, ChevronLeft } from "lucide-react";

interface FilterCondition {
  column: string;
  operator: 'is' | 'is_not' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'equal_to';
  value: string | number | string[];
  type: 'string' | 'number';
}

interface FilterComponentProps {
  isOpen: boolean;
  onFilterClick: () => void;
  headers: string[];
  columnTypes: Record<string, 'string' | 'number'>;
  activeFilters: FilterCondition[];
  onAddFilter: (filter: FilterCondition) => void;
  onRemoveFilter: (index: number) => void;
  getUniqueColumnValues: (columnIndex: number) => string[];
  onUpdateFilterLogic: (logicArray: boolean[]) => void;
  filterLogicArray: boolean[];
}

export const FilterComponent: React.FC<FilterComponentProps> = ({
  isOpen,
  onFilterClick,
  headers,
  columnTypes,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  getUniqueColumnValues,
  onUpdateFilterLogic,
  filterLogicArray
}) => {
  const filterRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<FilterCondition['operator']>('is');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [numericValue, setNumericValue] = useState<string>("");
  const [textValue, setTextValue] = useState<string>("");
  const [showColumnList, setShowColumnList] = useState(true);
  const [valueSearchTerm, setValueSearchTerm] = useState("");

  const stringOperators = [
    { value: 'is', label: 'Is' },
    { value: 'is_not', label: 'Is not' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' }
  ];

  const numberOperators = [
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Lesser than' },
    { value: 'equal_to', label: 'Equals' }
  ];

  const filteredHeaders = headers.filter(header =>
    header.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node) && isOpen) {
        onFilterClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onFilterClick]);

  const handleAddNewFilter = () => {
    setShowAddFilter(true);
    setShowColumnList(true);
    setSelectedColumn("");
    setSelectedOperator('is');
    setSelectedValues([]);
    setNumericValue("");
    setTextValue("");
    setSearchTerm("");
  };

  const handleApplyFilter = () => {
    if (!selectedColumn) return;

    const type = columnTypes[selectedColumn];
    let value: string | number | string[];

    if (type === 'number') {
      value = Number(numericValue);
    } else {
      value = selectedOperator === 'is' || selectedOperator === 'is_not'
        ? selectedValues
        : textValue;
    }

    const filter: FilterCondition = {
      column: selectedColumn,
      operator: selectedOperator,
      value,
      type
    };

    onAddFilter(filter);
    setShowAddFilter(false);
    setSelectedColumn("");
    setSelectedOperator('is');
    setSelectedValues([]);
    setNumericValue("");
    setTextValue("");
    setSearchTerm("");
    setShowColumnList(true);
  };

  const handleValueCheckboxChange = (value: string) => {
    setSelectedValues(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleFilterLogicChange = (index: number, logic: 'AND' | 'OR') => {
    const newLogic = [...filterLogicArray];
    newLogic[index] = logic === 'OR';
    onUpdateFilterLogic(newLogic);
  };

  const handleBackToColumns = () => {
    setShowColumnList(true);
    setSelectedColumn("");
  };

  const getFilteredValues = (columnIndex: number) => {
    const values = getUniqueColumnValues(columnIndex);
    return values.filter(value => value.toLowerCase().includes(valueSearchTerm.toLowerCase()));
  };

  return (
    <div className="filter-container">
      <div className="header">
        <div className="logo-section">
          <img
            src="https://dashboard.codeparrot.ai/api/image/Z9TKqZIdzXb5OlMv/group.png"
            alt="Logo"
            className="logo"
          />
          <div className="title">
            <h1>Segwise</h1>
            <h2>Front End Test</h2>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="content-area">
          <div className="filter-wrapper" ref={filterRef}>
            <button className="filter-button" onClick={onFilterClick}>
              <Filter size={20} />
              <span>Filters</span>
              {activeFilters.length > 0 && 
                <span className="filter-count">{activeFilters.length.toString().padStart(2, '0')}</span>
              }
              <svg
                className={`arrow-icon ${isOpen ? 'open' : ''}`}
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 6L0 0L10 0L5 6Z" fill="#667085"/>
              </svg>
            </button>

            {isOpen && (
              <div className="filter-dropdown">
                {showAddFilter ? (
                  <div className="filter-options-panel">
                    <div className="filter-options-header">
                      <span>Add Filter</span>
                      <button className="close-button" onClick={() => setShowAddFilter(false)}>
                        <X size={16} />
                      </button>
                    </div>

                    {selectedColumn && !showColumnList && (
                      <div className="filter-hierarchy">
                        <button className="back-button" onClick={handleBackToColumns}>
                          <ChevronLeft size={16} />
                        </button>
                        <div className="hierarchy-path">
                          <span>{selectedColumn}</span>
                        </div>
                      </div>
                    )}

                    {showColumnList ? (
                      <>
                        <div className="filter-search">
                          <Search className="search-icon" size={20} />
                          <input
                            type="text"
                            placeholder="Search columns"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                          />
                        </div>

                        <div className="column-list">
                          {filteredHeaders.map(header => (
                            <button
                              key={header}
                              className={`column-option ${selectedColumn === header ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedColumn(header);
                                setSelectedOperator(columnTypes[header] === 'number' ? 'equal_to' : 'is');
                                setShowColumnList(false);
                              }}
                            >
                              {header}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {columnTypes[selectedColumn] === 'number' ? (
                          <div className="numeric-filter">
                            <div className="operator-select-wrapper">
                              <select
                                value={selectedOperator}
                                onChange={(e) => setSelectedOperator(e.target.value as FilterCondition['operator'])}
                                className="operator-select"
                              >
                                {numberOperators.map(op => (
                                  <option key={op.value} value={op.value}>{op.label}</option>
                                ))}
                              </select>
                            </div>
                            <input
                              type="number"
                              value={numericValue}
                              onChange={(e) => setNumericValue(e.target.value)}
                              className="numeric-input"
                              placeholder="Enter value"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="value-search">
                              <div className="filter-search">
                                <Search className="search-icon" size={20} />
                                <input
                                  type="text"
                                  placeholder="Search values"
                                  value={valueSearchTerm}
                                  onChange={(e) => setValueSearchTerm(e.target.value)}
                                  className="search-input"
                                />
                              </div>
                            </div>
                            <select
                              value={selectedOperator}
                              onChange={(e) => setSelectedOperator(e.target.value as FilterCondition['operator'])}
                              className="filter-select"
                            >
                              {stringOperators.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                              ))}
                            </select>

                            {selectedOperator === 'is' || selectedOperator === 'is_not' ? (
                              <div className="checkbox-group">
                                {getFilteredValues(headers.indexOf(selectedColumn)).map(value => (
                                  <label key={value} className="checkbox-label">
                                    <input className="checkbox-input"
                                      type="checkbox"
                                      checked={selectedValues.includes(value)}
                                      onChange={() => handleValueCheckboxChange(value)}
                                    />
                                    <span>{value}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                className="filter-input"
                                placeholder="Enter value"
                              />
                            )}
                          </>
                        )}

                        <button
                          onClick={handleApplyFilter}
                          className="apply-filter-button"
                          disabled={
                            columnTypes[selectedColumn] === 'number'
                              ? !numericValue
                              : (selectedOperator === 'is' || selectedOperator === 'is_not')
                                ? selectedValues.length === 0
                                : !textValue
                          }
                        >
                          Apply⏎
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <button className="add-filter-button" onClick={handleAddNewFilter}>
                      <Plus className="plus-icon" size={16}/>
                      Add Filter
                    </button>

                    {activeFilters.length > 0 && (
                      <div className="active-filters">
                        {activeFilters.map((filter, index) => (
                          <React.Fragment key={index}>
                            <div className="active-filter-item">
                              <div className="filter-header">
                                <span className="filter-type">{filter.column}</span>
                                <button
                                  className="delete-icon"
                                  onClick={() => onRemoveFilter(index)}
                                  aria-label="Remove filter"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="filter-value">
                                {filter.operator.replace(/_/g, ' ')} {' '}
                                {Array.isArray(filter.value)
                                  ? filter.value.join(', ')
                                  : filter.value}
                              </div>
                            </div>
                            {index < activeFilters.length - 1 && (
                              <div className="filter-logic">
                                <button
                                  className={`logic-button ${!filterLogicArray[index] ? 'active' : ''}`}
                                  onClick={() => handleFilterLogicChange(index, 'AND')}
                                >
                                  AND
                                </button>
                                <button
                                  className={`logic-button ${filterLogicArray[index] ? 'active' : ''}`}
                                  onClick={() => handleFilterLogicChange(index, 'OR')}
                                >
                                  OR
                                </button>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
