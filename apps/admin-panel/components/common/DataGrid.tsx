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
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
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
}

interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
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

export function DataGrid<T extends { id?: string }>({
  columns,
  data,
  loading = false,
  onRowClick,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showPagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  actions = [],
  onExport,
  emptyMessage = 'No data available',
}: DataGridProps<T>) {
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
            paginatedData.map((row) => (
              <Card key={row.id || String(Math.random())} sx={{ mb: 2, cursor: onRowClick ? 'pointer' : 'default' }} onClick={() => onRowClick?.(row)}>
                <CardContent>
                  {columns.slice(0, 3).map((column) => (
                    <Box key={String(column.id)} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {column.label}
                      </Typography>
                      <Typography variant="body2">
                        {column.format ? column.format(row[column.id as keyof T], row) : String(row[column.id as keyof T] ?? '-')}
                      </Typography>
                    </Box>
                  ))}
                  {actions.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {actions.map((action, index) => (
                        <IconButton key={index} size="small" color={action.color} onClick={(e) => { e.stopPropagation(); action.onClick(row); }}>
                          {action.icon}
                        </IconButton>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
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
                    <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} sx={{ textAlign: 'center', py: 4 }}>
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id || String(Math.random())} hover onClick={() => onRowClick?.(row)} sx={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                      {columns.map((column) => (
                        <TableCell key={String(column.id)} align={column.align || 'left'}>
                          {column.format ? column.format(row[column.id as keyof T], row) : String(row[column.id as keyof T] ?? '-')}
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {actions.map((action, index) => (
                              <Tooltip key={index} title={action.label}>
                                <IconButton size="small" color={action.color} onClick={(e) => { e.stopPropagation(); action.onClick(row); }} disabled={action.disabled?.(row)}>
                                  {action.icon}
                                </IconButton>
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
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
    </Box>
  );
}
