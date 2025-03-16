import { useState } from 'react'
import './App.css'
import FilterComponent from './Components/FilterComponent';
import CSVTable from './Components/CSVTable';

type CSVData = string[][]

interface FilterCondition {
  column: string;
  operator: 'is' | 'is_not' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'equal_to';
  value: string | number | string[];
  type: 'string' | 'number';
}

function App() {
  // States lifted from CSVTable
  const [csvData, setCsvData] = useState<CSVData>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  
  // States for filtering
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([])
  const [columnTypes, setColumnTypes] = useState<Record<string, 'string' | 'number'>>({})
  const [filterLogicArray, setFilterLogicArray] = useState<boolean[]>([])

  // Handler functions to be passed to children
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)

      if (rows.length > 0) {
        setHeaders(rows[0])
        setCsvData(rows.slice(1))
        
        // Detect column types from the first data row
        const types: Record<string, 'string' | 'number'> = {}
        rows[0].forEach((header, index) => {
          const value = rows[1]?.[index]
          types[header] = !isNaN(Number(value)) ? 'number' : 'string'
        })
        setColumnTypes(types)
      }
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string): CSVData => {
    const rows: CSVData = []
    let currentRow: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentValue += '"'
          i++
        } else {
          insideQuotes = !insideQuotes
        }
      } else if (char === "," && !insideQuotes) {
        currentRow.push(currentValue)
        currentValue = ""
      } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !insideQuotes) {
        if (char === "\r") i++
        currentRow.push(currentValue)
        rows.push(currentRow)
        currentRow = []
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    if (currentValue || currentRow.length > 0) {
      currentRow.push(currentValue)
      rows.push(currentRow)
    }

    return rows
  }

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const getUniqueColumnValues = (columnIndex: number): string[] => {
    const uniqueValues = new Set<string>()
    csvData.forEach(row => {
      uniqueValues.add(row[columnIndex])
    })
    return Array.from(uniqueValues).sort()
  }

  const handleAddFilter = (filter: FilterCondition) => {
    setActiveFilters(prev => [...prev, filter])
    // Add default AND logic (false) for the new filter
    setFilterLogicArray(prev => [...prev, false])
  }

  const handleRemoveFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index))
    // Remove the corresponding logic
    setFilterLogicArray(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateFilterLogic = (newLogicArray: boolean[]) => {
    setFilterLogicArray(newLogicArray)
  }

  const applyFilters = (data: CSVData): CSVData => {
    if (activeFilters.length === 0) return data

    return data.filter(row => {
      let result = true
      
      for (let i = 0; i < activeFilters.length; i++) {
        const filter = activeFilters[i]
        const columnIndex = headers.indexOf(filter.column)
        const cellValue = row[columnIndex]
        let currentResult: boolean

        if (filter.type === 'number') {
          const numValue = Number(cellValue)
          const filterValue = Number(filter.value)

          switch (filter.operator) {
            case 'greater_than':
              currentResult = numValue > filterValue
              break
            case 'less_than':
              currentResult = numValue < filterValue
              break
            case 'equal_to':
              currentResult = numValue === filterValue
              break
            default:
              currentResult = true
          }
        } else {
          switch (filter.operator) {
            case 'is':
              currentResult = Array.isArray(filter.value) 
                ? filter.value.includes(cellValue)
                : cellValue === filter.value
              break
            case 'is_not':
              currentResult = Array.isArray(filter.value)
                ? !filter.value.includes(cellValue)
                : cellValue !== filter.value
              break
            case 'contains':
              currentResult = cellValue.toLowerCase().includes(String(filter.value).toLowerCase())
              break
            case 'not_contains':
              currentResult = !cellValue.toLowerCase().includes(String(filter.value).toLowerCase())
              break
            default:
              currentResult = true
          }
        }

        if (i === 0) {
          result = currentResult
        } else {
          // If the previous logic is OR (true), use OR operation, otherwise use AND
          result = filterLogicArray[i - 1] 
            ? (result || currentResult)  // OR
            : (result && currentResult)  // AND
        }
      }

      return result
    })
  }

  // Apply search and filters
  const filteredBySearch = csvData.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const finalFilteredData = applyFilters(filteredBySearch)

  return (
    <>
      <FilterComponent 
        isOpen={isFilterOpen}
        onFilterClick={handleFilterClick}
        headers={headers}
        columnTypes={columnTypes}
        activeFilters={activeFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        getUniqueColumnValues={getUniqueColumnValues}
        onUpdateFilterLogic={handleUpdateFilterLogic}
        filterLogicArray={filterLogicArray}
      />
      <CSVTable
        csvData={finalFilteredData}
        headers={headers}
        fileName={fileName}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onFileUpload={handleFileUpload}
      />
    </>
  )
}

export default App
