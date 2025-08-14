import React, { useMemo, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const DataTable = ({ 
  data = [], 
  columns = [], 
  onRowClick, 
  actions,
  searchTerm = "",
  loading = false,
  selectable = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll
}) => {
const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
}, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Selection state management
  const isAllSelected = useMemo(() => {
    return paginatedData.length > 0 && paginatedData.every(item => selectedItems.includes(item.Id));
  }, [paginatedData, selectedItems]);

  const isSomeSelected = useMemo(() => {
return paginatedData.some(item => selectedItems.includes(item.Id)) && !isAllSelected;
  }, [paginatedData, selectedItems, isAllSelected]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      if (isAllSelected) {
        // Deselect all current page items
        const pageIds = paginatedData.map(item => item.Id);
        pageIds.forEach(id => onSelectItem(id));
      } else {
        // Select all current page items that aren't already selected
        paginatedData.forEach(item => {
          if (!selectedItems.includes(item.Id)) {
            onSelectItem(item.Id);
          }
        });
      }
    }
  };

  const getSortIcon = (key) => {
if (sortConfig.key !== key) return "ArrowUpDown";
    return sortConfig.direction === "asc" ? "ArrowUp" : "ArrowDown";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <ApperIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">
            {searchTerm ? `No items match "${searchTerm}"` : "No data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
<th className="px-4 py-2 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                </th>
              )}
              {columns.map((column) => (
<th
                  key={column.key}
                  className={cn(
                    "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-gray-100"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <ApperIcon 
                        name={getSortIcon(column.key)} 
                        className="w-4 h-4 text-gray-400" 
                      />
                    )}
                  </div>
                </th>
              ))}
{actions && (
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
</tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => {
              const isSelected = selectedItems.includes(row.Id);
              return (
                <tr
                  key={row.Id || index}
                  className={cn(
                    "transition-colors duration-200",
                    isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
<td className="px-4 py-3 whitespace-nowrap w-12">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectItem(row.Id);
                        }}
                        className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                      />
                    </td>
                  )}
{columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 whitespace-nowrap">
                      {column.render ? column.render(row[column.key], row) : (
                        <span className="text-sm text-gray-900">
                          {row[column.key] || "-"}
                        </span>
                      )}
                    </td>
                  ))}
{actions && (
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
<div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200 sm:px-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{sortedData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-r-none"
                >
                  <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                </Button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "secondary"}
                        size="small"
                        onClick={() => setCurrentPage(page)}
                        className="rounded-none"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-3 py-1 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-l-none"
                >
                  <ApperIcon name="ChevronRight" className="w-4 h-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;