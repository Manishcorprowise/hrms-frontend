import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import EmployeeTable from '../components/EmployeeTable';

const EmployeeTableDemo = () => {
  // Sample employee data
  const [employees, setEmployees] = useState([
    {
      "_id": "68beeef95568acf35952b15d",
      "userName": "myadav002",
      "employeeName": "Manish Yadav",
      "employeeNumber": "002",
      "dateOfJoining": "2025-09-08T00:00:00.000Z",
      "email": "my1000088@gmail.com",
      "phone": "8087654321",
      "position": "Developer",
      "role": "super_admin",
      "password": "$2b$10$eMIKSAGJ20lCl8uLGdy66.6EFWsMe9FkLnjGXJKYt66Lifb0id67y",
      "isVerified": false,
      "isTemPassword": false,
      "isActive": true,
      "isDeleted": false,
      "createdBy": "admin",
      "updatedBy": "68beeef95568acf35952b15d",
      "deletedBy": "admin",
      "createdAt": "2025-09-08T14:58:01.494Z",
      "updatedAt": "2025-09-10T17:54:24.780Z",
      "deletedAt": "2025-09-08T14:58:01.494Z",
      "__v": 0,
      "lastLoginAt": "2025-09-11T06:19:21.339Z"
    },
    {
      "_id": "68bef5861720665b58254ad1",
      "userName": "tuseremp001",
      "employeeName": "Test User",
      "employeeNumber": "EMP001",
      "dateOfJoining": "2025-09-08T15:25:58.672Z",
      "email": "test@example.com",
      "phone": "1234567890",
      "position": "Software Developer",
      "role": "employee",
      "password": "$2b$10$eMIKSAGJ20lCl8uLGdy66.6EFWsMe9FkLnjGXJKYt66Lifb0id67y",
      "isVerified": false,
      "isTemPassword": false,
      "isActive": true,
      "isDeleted": false,
      "createdBy": "admin",
      "updatedBy": "68bef5861720665b58254ad1",
      "deletedBy": "admin",
      "createdAt": "2025-09-08T15:25:58.676Z",
      "updatedAt": "2025-09-10T17:15:41.973Z",
      "deletedAt": "2025-09-08T15:25:58.676Z",
      "__v": 0,
      "lastLoginAt": "2025-09-10T17:15:41.973Z"
    },
    {
      "_id": "68c18ef4907c26003633c4be",
      "userName": "admin",
      "employeeName": "Admin User",
      "employeeNumber": "ADM001",
      "dateOfJoining": "2025-09-10T14:45:08.254Z",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "position": "System Administrator",
      "department": "IT",
      "manager": "CEO",
      "role": "admin",
      "password": "$2b$10$uLktOjqPzGryy8sBQbXs0uZNB7I5BRypTCRn3mIb3Itu8e58srhtu",
      "isVerified": true,
      "isTemPassword": false,
      "isActive": true,
      "isDeleted": false,
      "createdBy": "system",
      "updatedBy": "system",
      "deletedBy": "system",
      "createdAt": "2025-09-10T14:45:08.257Z",
      "updatedAt": "2025-09-10T14:46:39.801Z",
      "deletedAt": "2025-09-10T14:45:08.257Z",
      "__v": 0,
      "lastLoginAt": "2025-09-10T14:46:39.801Z"
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleEdit = (employee) => {
    console.log('Edit employee:', employee);
    // Implement edit functionality
    alert(`Edit employee: ${employee.employeeName}`);
  };

  const handleDelete = (employee) => {
    console.log('Delete employee:', employee);
    // Implement delete functionality
    if (window.confirm(`Are you sure you want to delete ${employee.employeeName}?`)) {
      setEmployees(prev => prev.filter(emp => emp._id !== employee._id));
    }
  };

  const handleView = (employee) => {
    console.log('View employee:', employee);
    // The view functionality is handled by the table component itself
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAddEmployee = () => {
    console.log('Add new employee');
    // Implement add employee functionality
    alert('Add new employee functionality');
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Employee Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your organization's employees efficiently
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEmployee}
            >
              Add Employee
            </Button>
          </Stack>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`Total Employees: ${employees.length}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Active: ${employees.filter(emp => emp.isActive).length}`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Admins: ${employees.filter(emp => emp.role.includes('admin')).length}`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`Verified: ${employees.filter(emp => emp.isVerified).length}`}
            color="info"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={loading}
      />

      {/* Usage Instructions */}
      <Paper sx={{ p: 3, mt: 3, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Features
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Table Features
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Sortable columns</li>
              <li>Pagination with customizable rows per page</li>
              <li>Search and filter capabilities</li>
              <li>Responsive design</li>
              <li>Hover effects and visual feedback</li>
            </ul>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Actions
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>View detailed employee information</li>
              <li>Edit employee details</li>
              <li>Delete employees with confirmation</li>
              <li>Role-based access control</li>
              <li>Status indicators and badges</li>
            </ul>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Data Display
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Employee avatars with initials</li>
              <li>Role-based color coding</li>
              <li>Status indicators (Active/Inactive)</li>
              <li>Formatted dates and times</li>
              <li>Comprehensive employee details dialog</li>
            </ul>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeTableDemo;
