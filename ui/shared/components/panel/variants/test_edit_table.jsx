import * as React from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

const columns = [
  {
    field: 'notes',
    headerName: 'Notes',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 14,
    editable: true,
    valueGetter: params => `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  }]

const rows = [
  { id: 1, notes: 'fill in' },
  { id: 2, notes: 'fill in' }]

const initialState = {
  pagination: {
    paginationModel: {
      pageSize: 5,
    },
  },
}

const pageSizeOptions = [5]
const boxStyle = { height: 14, width: '100%' }// define the box style outside of our component and reference it in JSX

export default function FullFeaturedCrudGrid() {
  return (
    <Box sx={boxStyle}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={initialState}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  )
}
