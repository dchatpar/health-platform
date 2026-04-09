'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selected?: string[];
  onSelectionChange?: (selected: string[]) => void;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: (row: T) => void;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    disabled?: (row: T) => boolean;
  }>;
  onExport?: () => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading = false,
  selectable = false,
  selected = [],
  onSelectionChange,
  onRowClick,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showPagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  actions = [],
  onExport,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id || '');
      onSelectionChange?.(newSelected);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((s) => s !== id);
    }

    onSelectionChange?.(newSelected);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.id as keyof T];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy as keyof T];
      const bValue = b[orderBy as keyof T];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, orderBy, order]);

  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage, showPagination]);

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const renderMobileCard = (row: T) => (
    <Card
      key={row.id || String(Math.random())}
      sx={{
        mb: 2,
        cursor: onRowClick ? 'pointer' : 'default',
        border: selected.includes(row.id || '') ? 2 : 0,
        borderColor: 'primary.main',
      }}
      onClick={() => onRowClick?.(row)}
    >
      <CardContent>
        {columns.slice(0, 3).map((column) => (
          <Box key={String(column.id)} sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {column.label}
            </Typography>
            <Typography variant="body2">
              {column.format
                ? column.format(row[column.id as keyof T], row)
                : String(row[column.id as keyof T] ?? '-')}
            </Typography>
          </Box>
        ))}
        {actions.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            {actions.map((action, index) => (
              <IconButton
                key={index}
                size="small"
                color={action.color}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
                disabled={action.disabled?.(row)}
              >
                {action.icon}
              </IconButton>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {(showSearch || onExport) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}
        >
          {showSearch && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onExport && (
              <Tooltip title="Export">
                <IconButton onClick={onExport}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Stack>
      )}

      {isMobile ? (
        <Box>
          {paginatedData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              {emptyMessage}
            </Box>
          ) : (
            paginatedData.map(renderMobileCard)
          )}
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={data.length > 0 && selected.length === data.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.id)}
                      align={column.align || 'left'}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.sortable !== false ? (
                        <TableSortLabel
                          active={orderBy === String(column.id)}
                          direction={orderBy === String(column.id) ? order : 'asc'}
                          onClick={() => handleRequestSort(String(column.id))}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} sx={{ textAlign: 'center', py: 4 }}>
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const rowId = row.id || '';
                    const isRowSelected = isSelected(rowId);

                    return (
                      <TableRow
                        key={rowId || String(Math.random())}
                        hover
                        selected={isRowSelected}
                        onClick={() => onRowClick?.(row)}
                        sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                      >
                        {selectable && (
                          <TableCell padding="checkbox">
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectOne(rowId);
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={String(column.id)} align={column.align || 'left'}>
                            {column.format
                              ? (column.format(row[column.id as keyof T], row) as React.ReactNode)
                              : column.id === 'status'
                              ? (row[column.id as keyof T] as React.ReactNode)
                              : String(row[column.id as keyof T] ?? '-')}
                          </TableCell>
                        ))}
                        {actions.length > 0 && (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              {actions.map((action, index) => (
                                <Tooltip key={index} title={action.label}>
                                  <IconButton
                                    size="small"
                                    color={action.color}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row);
                                    }}
                                    disabled={action.disabled?.(row)}
                                  >
                                    {action.icon}
                                  </IconButton>
                                </Tooltip>
                              ))}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {showPagination && (
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      )}

      {!isMobile && showPagination && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} results
          </Typography>
        </Box>
      )}
    </Box>
  );
}
