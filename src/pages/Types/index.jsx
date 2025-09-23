import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Avatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Tooltip,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { apiService } from '../../apiservice/api';

export default function Types() {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch types data on component mount
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTypes();
      if (response.status) {
        setData(response.data || []);
      } else {
        console.error('Failed to fetch types:', response.message);
        // Keep empty array on error
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Define columns for React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ getValue }) => (
          <Chip 
            label={getValue()} 
            size="small"
            sx={{ 
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Type Name',
        cell: ({ getValue }) => (
          <Typography variant="body1" fontWeight={500} color="text.primary">
            {getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <Typography variant="body2" color="text.secondary">
            {getValue() || 'No description provided'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEdit(row.original)}
                disabled={loading}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    bgcolor: alpha(theme.palette.action.disabled, 0.1),
                    color: theme.palette.action.disabled,
                    transform: 'none',
                  },
                  width: 36,
                  height: 36,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDelete(row.original._id)}
                disabled={loading}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    bgcolor: alpha(theme.palette.action.disabled, 0.1),
                    color: theme.palette.action.disabled,
                    transform: 'none',
                  },
                  width: 36,
                  height: 36,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [theme, loading]
  );

  // React Table configuration
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '' });
    setErrors({});
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this type?')) {
      try {
        setLoading(true);
        const response = await apiService.deleteType({ id });
        
        if (response.status) {
          // Refresh data after successful deletion
          await fetchTypes();
        } else {
          console.error('Failed to delete type:', response.message);
          alert(response.message || 'Failed to delete type');
        }
      } catch (error) {
        console.error('Error deleting type:', error);
        alert('An error occurred while deleting the type');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Type name is required';
    }
    
    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      let response;
      if (editingItem) {
        // Update existing item
        response = await apiService.updateType({
          id: editingItem._id,
          ...payload
        });
      } else {
        // Add new item
        response = await apiService.createType(payload);
      }

      if (response.status) {
        // Refresh data after successful operation
        await fetchTypes();
        setDialogOpen(false);
        setFormData({ name: '', description: '' });
        setEditingItem(null);
        setErrors({});
      } else {
        console.error('Failed to save type:', response.message);
        alert(response.message || 'Failed to save type');
      }
    } catch (error) {
      console.error('Error saving type:', error);
      alert('An error occurred while saving the type');
    } finally {
      setSaving(false);
    }
  };




  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header Section with Search */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ padding: '10px !important' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}>
            {/* Left Section - Title */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              minWidth: { xs: '100%', md: 'auto' },
              flex: { xs: '1 1 100%', md: '0 0 auto' }
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  width: 56, 
                  height: 56,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <SettingsIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Types
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage types
                </Typography>
              </Box>
            </Box>

            {/* Center Section - Search */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 auto' },
              minWidth: { xs: '100%', md: '300px' },
              maxWidth: { xs: '100%', md: '500px' }
            }}>
              <TextField
                fullWidth
                placeholder="Search types by code, name or description..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }
                }}
              />
            </Box>

            {/* Right Section - Button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              minWidth: { xs: '100%', md: 'auto' },
              flex: { xs: '1 1 100%', md: '0 0 auto' }
            }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
              >
                Add New
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* React Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <Box sx={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr 
                  key={headerGroup.id}
                  style={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        padding: '16px',
                        textAlign: header.id === 'actions' ? 'center' : 'left',
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading types...
                    </Typography>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    <Typography variant="body2" color="text.secondary">
                      No types found
                    </Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: index % 2 === 0 
                      ? theme.palette.background.paper 
                      : alpha(theme.palette.action.hover, 0.02),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.08);
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = theme.palette.mode === 'dark' 
                      ? '0 2px 8px rgba(255,255,255,0.1)' 
                      : '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 
                      ? theme.palette.background.paper 
                      : alpha(theme.palette.action.hover, 0.02);
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '16px',
                        textAlign: cell.column.id === 'actions' ? 'center' : 'left',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.primary
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>

        {/* React Table Pagination */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: alpha(theme.palette.action.hover, 0.02),
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Showing <strong>{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</strong> to{' '}
            <strong>{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</strong> of{' '}
            <strong>{table.getFilteredRowModel().rows.length}</strong> results
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="First Page">
              <IconButton
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  color: theme.palette.text.secondary,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.action.hover, 0.2),
                    color: theme.palette.text.primary
                  },
                  '&:disabled': { 
                    bgcolor: 'transparent',
                    color: theme.palette.action.disabled
                  }
                }}
              >
                <Typography variant="body2" fontWeight="bold">⏮</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Previous Page">
              <IconButton
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  color: theme.palette.text.secondary,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.action.hover, 0.2),
                    color: theme.palette.text.primary
                  },
                  '&:disabled': { 
                    bgcolor: 'transparent',
                    color: theme.palette.action.disabled
                  }
                }}
              >
                <Typography variant="body2" fontWeight="bold">⏪</Typography>
              </IconButton>
            </Tooltip>
            
            {Array.from({ length: Math.min(4, table.getPageCount()) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Tooltip key={pageNumber} title={`Page ${pageNumber}`}>
                  <IconButton
                    onClick={() => table.setPageIndex(pageNumber - 1)}
                    sx={{
                      bgcolor: table.getState().pagination.pageIndex === pageNumber - 1 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.action.hover, 0.1),
                      color: table.getState().pagination.pageIndex === pageNumber - 1 
                        ? theme.palette.primary.contrastText 
                        : theme.palette.text.secondary,
                      minWidth: 36,
                      height: 36,
                      borderRadius: '50%',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: table.getState().pagination.pageIndex === pageNumber - 1 
                          ? theme.palette.primary.dark 
                          : alpha(theme.palette.action.hover, 0.2),
                        color: theme.palette.text.primary,
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">{pageNumber}</Typography>
                  </IconButton>
                </Tooltip>
              );
            })}
            
            <Tooltip title="Next Page">
              <IconButton
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  color: theme.palette.text.secondary,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.action.hover, 0.2),
                    color: theme.palette.text.primary
                  },
                  '&:disabled': { 
                    bgcolor: 'transparent',
                    color: theme.palette.action.disabled
                  }
                }}
              >
                <Typography variant="body2" fontWeight="bold">⏩</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Last Page">
              <IconButton
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  color: theme.palette.text.secondary,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.action.hover, 0.2),
                    color: theme.palette.text.primary
                  },
                  '&:disabled': { 
                    bgcolor: 'transparent',
                    color: theme.palette.action.disabled
                  }
                }}
              >
                <Typography variant="body2" fontWeight="bold">⏭</Typography>
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Card>


      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4,
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              width: 40,
              height: 40
            }}>
              <SettingsIcon sx={{ color: theme.palette.primary.main }} />
            </Avatar>
            <Typography variant="h6" fontWeight={600} color="primary">
              {editingItem ? 'Edit Type' : 'Add New Type'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth error={!!errors.name}>
              <InputLabel htmlFor="name">Type Name *</InputLabel>
              <OutlinedInput
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Clear error when user starts typing
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                label="Type Name *"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              {errors.name && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.name}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="description">Description</InputLabel>
              <OutlinedInput
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                label="Description"
                multiline
                rows={3}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.action.hover, 0.02)
        }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            {saving ? 'Saving...' : (editingItem ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddNew}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: 4,
          '&:hover': {
            boxShadow: 6,
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}