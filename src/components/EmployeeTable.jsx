import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Chip,
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  PersonAdd as EmployeeIcon,
  Security as SecurityIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { UserMasterFrom } from '../pages/EmployeePage/UserMasterForm/UserMasterForm';

const EmployeeTable = ({ employees, onEdit, onDelete, onView, loading = false, onEditEmployee }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [openUserMasterForm, setOpenUserMasterForm] = useState(null);


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

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleView = () => {
    if (selectedEmployee) {
      // Navigate to user profile page with employee ID
      navigate(`/profile/${selectedEmployee._id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (onEditEmployee && selectedEmployee) {
      onEditEmployee(selectedEmployee);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete && selectedEmployee) {
      onDelete(selectedEmployee);
    }
    handleMenuClose();
  };
  const handleGenerateKadCredentials = () => {
    setOpenUserMasterForm(selectedEmployee);
    handleMenuClose();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <AdminIcon color="error" />;
      case 'admin':
        return <SecurityIcon color="warning" />;
      case 'employee':
        return <EmployeeIcon color="primary" />;
      default:
        return <PersonIcon color="default" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'employee':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort employees
  const sortedEmployees = [...employees].sort((a, b) => {
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

  const paginatedEmployees = sortedEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading employees...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="employee table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'employeeName'}
                  direction={orderBy === 'employeeName' ? order : 'asc'}
                  onClick={() => handleSort('employeeName')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Employee
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'employeeNumber'}
                  direction={orderBy === 'employeeNumber' ? order : 'asc'}
                  onClick={() => handleSort('employeeNumber')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Employee ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleSort('email')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'position'}
                  direction={orderBy === 'position' ? order : 'asc'}
                  onClick={() => handleSort('position')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Position
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'manager'}
                  direction={orderBy === 'manager' ? order : 'asc'}
                  onClick={() => handleSort('manager')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Manager
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={() => handleSort('role')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'dateOfJoining'}
                  direction={orderBy === 'dateOfJoining' ? order : 'asc'}
                  onClick={() => handleSort('dateOfJoining')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Joining Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'isActive'}
                  direction={orderBy === 'isActive' ? order : 'asc'}
                  onClick={() => handleSort('isActive')}
                  sx={{ color: 'white', '&:hover': { color: 'white' } }}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow
                key={employee._id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 40,
                        height: 40,
                        fontSize: '1rem'
                      }}
                    >
                      {employee.employeeName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {employee.employeeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{employee.userName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {employee.employeeNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {employee.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {employee.position}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {employee.manager?.employeeName || employee.manager || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getRoleIcon(employee.role)}
                    label={employee.role.replace('_', ' ').toUpperCase()}
                    color={getRoleColor(employee.role)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatDate(employee.dateOfJoining)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={employee.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(employee.isActive)}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, employee)}
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
        count={employees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2 }}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {selectedEmployee?.isActive && selectedEmployee?.kadCred !== true && (
          <MenuItem onClick={handleGenerateKadCredentials} sx={{ color: 'primary.main' }}>
            <KeyIcon sx={{ mr: 1 }} />
            Generate kad cred
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Employee Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              {selectedEmployee?.employeeName?.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedEmployee?.employeeName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee?.position}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmployee.employeeNumber}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Username
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          @{selectedEmployee.userName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmployee.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmployee.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Employment Details
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Position
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmployee.position}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmployee.department || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Manager
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmployee.manager || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Joining Date
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(selectedEmployee.dateOfJoining)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Account Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Chip
                            icon={getRoleIcon(selectedEmployee.role)}
                            label={selectedEmployee.role.replace('_', ' ').toUpperCase()}
                            color={getRoleColor(selectedEmployee.role)}
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Chip
                            label={selectedEmployee.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(selectedEmployee.isActive)}
                            variant="filled"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Chip
                            label={selectedEmployee.isVerified ? 'Verified' : 'Unverified'}
                            color={selectedEmployee.isVerified ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Chip
                            label={selectedEmployee.isTemPassword ? 'Temp Password' : 'Permanent'}
                            color={selectedEmployee.isTemPassword ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDateTime(selectedEmployee.lastLoginAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDialogOpen(false);
              handleEdit();
            }}
          >
            Edit Employee
          </Button>
        </DialogActions>
      </Dialog>

      {openUserMasterForm && <UserMasterFrom
        open={openUserMasterForm ? true : false}
        onClose={() => setOpenUserMasterForm(null)}
        dataToEdit={openUserMasterForm}
      />}
    </Box>
  );
};

export default EmployeeTable;
