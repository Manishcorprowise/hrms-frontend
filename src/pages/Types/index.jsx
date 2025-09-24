import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
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
  
  // Table pagination and sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Table handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setFormData({ name: selectedItem.name, description: selectedItem.description || '' });
      setErrors({});
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedItem && window.confirm('Are you sure you want to delete this type?')) {
      try {
        setLoading(true);
        const response = await apiService.deleteType({ id: selectedItem._id });
        
        if (response.status) {
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
    handleMenuClose();
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

  // Filter and sort data
  const filteredData = data.filter(item => 
    !globalFilter || 
    item.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    item.code.toLowerCase().includes(globalFilter.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(globalFilter.toLowerCase()))
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!orderBy) return 0;
    
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading types...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header Section with Search */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
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
      

      {/* Material-UI Table */}
      <Box sx={{ p: 2 }}> 
      <TableContainer component={Paper} >
        <Table sx={{ minWidth: 650 }} aria-label="types table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleSort('code')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Type Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => handleSort('description')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item._id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Chip 
                    label={item.code} 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight={500} color="text.primary">
                    {item.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.description || 'No description provided'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, item)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2 }}
      />
      </Box>
</Card>
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

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


    </Box>
  );
}