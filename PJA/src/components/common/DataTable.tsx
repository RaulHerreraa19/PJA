import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Paper } from '@mantine/core'
import { DataTable as MantineDataTable, type DataTableColumn } from 'mantine-datatable'

export interface Column<T> {
  header: string
  accessor: keyof T | string
  render?: (item: T) => ReactNode
  textAlign?: 'left' | 'right' | 'center'
  width?: number | string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  isLoading?: boolean
  initialPageSize?: number
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'Sin registros',
  isLoading = false,
  initialPageSize = 10,
}: DataTableProps<T>) {
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [pageSize, data.length])

  const mantineColumns = useMemo<Array<DataTableColumn<T>>>(
    () =>
      columns.map((column) => ({
        accessor: column.accessor as string,
        title: column.header,
        textAlign: column.textAlign ?? 'left',
        width: column.width,
        render: column.render,
      })),
    [columns],
  )

  return (
    <Paper radius="xl" shadow="lg" p={0} withBorder>
      <MantineDataTable
        records={data}
        columns={mantineColumns}
        fetching={isLoading}
        idAccessor="id"
        minHeight={data.length === 0 ? 140 : undefined}
        withTableBorder
        withColumnBorders={false}
        highlightOnHover
        striped
        noRecordsText={emptyMessage}
        recordsPerPage={pageSize}
        page={page}
        totalRecords={data.length}
        recordsPerPageOptions={[5, 10, 20, 50]}
        onPageChange={setPage}
        onRecordsPerPageChange={setPageSize}
      />
    </Paper>
  )
}

export default DataTable
