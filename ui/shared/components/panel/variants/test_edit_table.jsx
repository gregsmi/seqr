import * as React from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

const columns = [
  {
    field: 'notes',
    headerName: 'Notes',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    editable: true,
    valueGetter: (params) => `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  }]

const rows = [
  { id: 1, notes: 'fill in' },
  { id: 2, notes: 'fill in' }]

export default function DataGridDemo() {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  )
}