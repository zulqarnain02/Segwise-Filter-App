"use client"

import React from "react"
import { Upload, ArrowUpDown, Search } from "lucide-react"


interface CSVTableProps {
  csvData: string[][]
  headers: string[]
  fileName: string
  searchTerm: string
  onSearchChange: (value: string) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function CSVTable({
  csvData,
  headers,
  fileName,
  searchTerm,
  onSearchChange,
  onFileUpload
}: CSVTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string>("");
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [sortedData, setSortedData] = React.useState<string[][]>(csvData);

  React.useEffect(() => {
    setSortedData(csvData);
  }, [csvData]);

  const handleSort = () => {
    if (!sortColumn) return;

    const columnIndex = headers.indexOf(sortColumn);
    const newSortedData = [...sortedData].sort((a, b) => {
      const aValue = a[columnIndex];
      const bValue = b[columnIndex];

      // Check if the values are numbers
      const aNum = Number(aValue);
      const bNum = Number(bValue);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Sort as strings if not numbers
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setSortedData(newSortedData);
  };

  return (
    <div className="csv-container">
      <div className="csv-header-card">
        <div className="csv-upload-section">
          <div className="csv-upload-container">
            <label className="csv-upload-button">
              <Upload className="csv-icon" />
              Choose CSV File
              <input type="file" accept=".csv" onChange={onFileUpload} className="csv-hidden-input" />
            </label>
            {fileName && <span className="csv-filename">{fileName}</span>}
          </div>
        </div>
      </div>

      {csvData.length > 0 && (
        <div className="csv-table-container">
          <div className="csv-search-row">
            <div className="csv-search-row-top">
              <span className="csv-row-count">{csvData.length} rows</span>
              <div className="sort-controls">
                <select
                  value={sortColumn}
                  onChange={(e) => setSortColumn(e.target.value)}
                  className="sort-select"
                >
                  <option value="">Select Column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                  className="sort-direction-select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
                <button
                  onClick={handleSort}
                  className="apply-sort-button"
                  disabled={!sortColumn}
                >
                  <ArrowUpDown size={16} />
                  Apply Sort
                </button>
              </div>
            </div>
            <div className="csv-search-row-bottom">
              <div className="csv-search-container">
                <Search className="csv-search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search in table..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="csv-search-input"
                />
              </div>
            </div>
          </div>
          <div className="csv-table-wrapper">
            <div className="csv-table-scroll">
              <table className="csv-table">
                <thead className="csv-table-header">
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="csv-table-th">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="csv-table-body">
                  {sortedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "csv-row-even" : "csv-row-odd"}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="csv-table-td">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

