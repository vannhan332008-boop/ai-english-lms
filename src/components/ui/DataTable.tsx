import React, { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface Column<T> {
  key?: string
  header: string
  accessorKey?: keyof T
  render?: (row: T) => React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchKey?: keyof T
  pageSize?: number
  itemsPerPage?: number
  keyExtractor?: (item: T) => string
  filterSlot?: React.ReactNode
  emptyMessage?: string
  className?: string
  hideSearch?: boolean
}

export function DataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  searchKey,
  pageSize = 10,
  itemsPerPage,
  keyExtractor,
  filterSlot,
  emptyMessage = 'Không tìm thấy dữ liệu phù hợp',
  className,
  hideSearch = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const actualPageSize = itemsPerPage || pageSize

  // Filter items
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    const term = searchTerm.toLowerCase()
    return data.filter((item) => {
      if (searchKey && item[searchKey]) {
        return String(item[searchKey]).toLowerCase().includes(term)
      }
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(term)
      )
    })
  }, [data, searchTerm, searchKey])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / actualPageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * actualPageSize
    return filteredData.slice(start, start + actualPageSize)
  }, [filteredData, currentPage, actualPageSize])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Toolbar if not hidden */}
      {(!hideSearch || filterSlot) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {!hideSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          )}
          {filterSlot && <div className="flex items-center gap-2">{filterSlot}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className={cn(
                      'px-4 py-3.5',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => {
                  const rowKey = keyExtractor ? keyExtractor(row) : (row as any).id || rowIdx
                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-accent/40 transition-colors group"
                    >
                      {columns.map((col, colIdx) => (
                        <td
                          key={col.key || colIdx}
                          className={cn(
                            'px-4 py-3.5 text-foreground',
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(row)
                            : col.accessorKey
                            ? String(row[col.accessorKey] ?? '')
                            : null}
                        </td>
                      ))}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Inbox className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                      <p className="text-xs text-muted-foreground">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div>
            Hiển thị <span className="font-semibold text-foreground">{paginatedData.length}</span> /{' '}
            <span className="font-semibold text-foreground">{filteredData.length}</span> bản ghi
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-foreground font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0"
              aria-label="Trang tiếp"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default DataTable
