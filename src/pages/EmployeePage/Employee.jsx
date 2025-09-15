import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  Fab,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Add,
  Person,
  Cake,
  ExitToApp,
  Work,
  Chat,
  PersonAdd,
} from '@mui/icons-material';
import AddEmployee from '../AddEmployee/index';
import EmployeeTable from '../../components/EmployeeTable';
import { useSelector } from 'react-redux';
import { apiService } from '../../apiservice/api';
export default function Employee() {
  const theme = useTheme();
  const [addEmployee, setAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchAllEmployees();
  }, []);
  // Calculate new joiners from actual employee data
  const newJoiners = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return allEmployees
      .filter(emp => {
        if (!emp.dateOfJoining) return false;
        const joiningDate = new Date(emp.dateOfJoining);
        return joiningDate >= oneMonthAgo;
      })
      .map(emp => {
        const joiningDate = new Date(emp.dateOfJoining);
        const daysAgo = Math.floor((new Date() - joiningDate) / (1000 * 60 * 60 * 24));
        return {
          id: emp.employeeNumber,
          name: emp.employeeName,
          daysAgo: daysAgo,
          _id: emp._id
        };
      })
      .sort((a, b) => b.daysAgo - a.daysAgo); // Sort by most recent first
  }, [allEmployees]);
  // Calculate upcoming birthdays from actual employee data
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    return allEmployees
      .filter(emp => {
        if (!emp.dateOfBirth || !emp.isActive || emp.isDeleted) return false;
        const birthDate = new Date(emp.dateOfBirth);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday has passed this year, check next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        return thisYearBirthday >= today && thisYearBirthday <= oneWeekFromNow;
      })
      .map(emp => {
        const birthDate = new Date(emp.dateOfBirth);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday has passed this year, use next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        return {
          id: emp.employeeNumber,
          name: emp.employeeName,
          date: thisYearBirthday.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          _id: emp._id
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allEmployees]);
  // Calculate resigned employees from actual employee data
  const resignedEmployees = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return allEmployees
      .filter(emp => emp.isDeleted || (!emp.isActive && emp.endDate))
      .map(emp => {
        const resignationDate = emp.endDate ? new Date(emp.endDate) : (emp.deletedAt ? new Date(emp.deletedAt) : new Date());
        const daysAgo = Math.floor((new Date() - resignationDate) / (1000 * 60 * 60 * 24));
        return {
          id: emp.employeeNumber,
          name: emp.employeeName,
          daysAgo: daysAgo,
          endDate: emp.endDate,
          lwd: resignationDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          _id: emp._id
        };
      })
      .sort((a, b) => b.daysAgo - a.daysAgo);
  }, [allEmployees]);

  // Calculate joining anniversaries from actual employee data
  const joiningAnniversaries = useMemo(() => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    return allEmployees
      .filter(emp => {
        if (!emp.dateOfJoining || !emp.isActive || emp.isDeleted) return false;
        const joiningDate = new Date(emp.dateOfJoining);
        const thisYearAnniversary = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
        
        return thisYearAnniversary >= today && thisYearAnniversary <= oneWeekFromNow;
      })
      .map(emp => {
        const joiningDate = new Date(emp.dateOfJoining);
        const years = today.getFullYear() - joiningDate.getFullYear();
        const thisYearAnniversary = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
        
        return {
          id: emp.employeeNumber,
          name: emp.employeeName,
          date: thisYearAnniversary.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          years: years,
          _id: emp._id
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allEmployees]);

  const CardComponent = ({ title, children, showAddButton = false, onAddClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 16px rgba(0,0,0,0.4)'
            : '0 4px 16px rgba(0,0,0,0.15)',
        },
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            fontWeight="600" 
            color="text.primary"
            sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
          >
            {title}
          </Typography>
          {showAddButton && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={onAddClick}
              sx={{
                backgroundColor: 'primary.main',
                textTransform: 'none',
                fontWeight: 500,
                ml: 1,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 2,
                },
              }}
            >
              Add
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2, borderColor: 'divider' }} />
        {children}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, message }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4,
        textAlign: 'center',
      }}
    >
      <Icon 
        sx={{ 
          fontSize: 64, 
          color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400', 
          mb: 2 
        }} 
      />
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getAllEmployees();
      setAllEmployees(response.users || response);
    } catch (error) {
      console.error("Error fetching all employees:", error.response?.data || error.message);
      setError('Failed to fetch employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setAddEmployee(true);
  };

  const handleDeleteEmployee = (employee) => {
    console.log('Delete employee:', employee);
    if (window.confirm(`Are you sure you want to delete ${employee.employeeName}?`)) {
      // Implement delete functionality
      setAllEmployees(prev => prev.filter(emp => emp._id !== employee._id));
    }
  };

  const handleViewEmployee = (employee) => {
    console.log('View employee:', employee);
    // The view functionality is handled by the table component itself
  };

  const handleCloseDialog = () => {
    setAddEmployee(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = (employeeData) => {
    if (editingEmployee) {
      // Update existing employee
      console.log('Updating employee:', employeeData);
      
      // Here you would call the update API
      // After successful update, refresh the employee list
      fetchAllEmployees();
    } else {
      // Add new employee
      console.log('Adding new employee:', employeeData);
      // After successful add, refresh the employee list
      fetchAllEmployees();
    }
    handleCloseDialog();
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Grid container spacing={1} sx={{ p: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <CardComponent 
            title="New Joiners for Last 1 Month"
            showAddButton={true}
            onAddClick={() => setAddEmployee(true)}
          >
            {newJoiners.length > 0 ? (
              <List sx={{ p: 0 }}>
                {newJoiners.map((joiner, index) => (
                  <ListItem 
                    key={joiner.id} 
                    sx={{ 
                      px: 0, 
                      py: 1,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                          color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.600',
                        }}
                      >
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${joiner.name} (${joiner.id})`}
                      secondary={`${joiner.daysAgo} days ago`}
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                      secondaryTypographyProps={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState icon={PersonAdd} message="No new joiners to show" />
            )}
          </CardComponent>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <CardComponent title="Upcoming Birthdays for a week">
            {upcomingBirthdays.length > 0 ? (
              <List sx={{ p: 0 }}>
                {upcomingBirthdays.map((birthday, index) => (
                  <ListItem 
                    key={birthday.id} 
                    sx={{ 
                      px: 0, 
                      py: 1,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={birthday.avatar}
                        sx={{ 
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                        }}
                      >
                        <Cake />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={birthday.name}
                      secondary={birthday.date}
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                      secondaryTypographyProps={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState icon={Cake} message="No upcoming birthdays" />
            )}
          </CardComponent>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <CardComponent 
            title="Resigned Employees for Last 1 Month" 
            showAddButton={false}
          >
            {resignedEmployees.length > 0 ? (
              <List sx={{ p: 0 }}>
                {resignedEmployees.map((employee, index) => (
                  <ListItem key={employee.id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.light' }}>
                        <ExitToApp />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${employee.name} (${employee.id})`}
                      secondary={`LWD: ${employee.lwd}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState icon={ExitToApp} message="No employee resignation to show" />
            )}
          </CardComponent>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <CardComponent title="Joining Anniversary for a week">
            {joiningAnniversaries.length > 0 ? (
              <List sx={{ p: 0 }}>
                {joiningAnniversaries.map((anniversary, index) => (
                  <ListItem 
                    key={anniversary.id} 
                    sx={{ 
                      px: 0, 
                      py: 1,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={anniversary.avatar}
                        sx={{ 
                          bgcolor: 'success.light',
                          color: 'success.contrastText',
                        }}
                      >
                        <Work />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={anniversary.name}
                      secondary={`${anniversary.date} - ${anniversary.years} years`}
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                      secondaryTypographyProps={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyState icon={Work} message="No joining anniversaries" />
            )}
          </CardComponent>
        </Grid>
      </Grid>

      {/* All Employees Table Section */}
      <Box sx={{ mt: 4 }}>
        <Card 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 2px 8px rgba(0,0,0,0.3)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                mb: 3 
              }}
            >
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  gutterBottom
                  sx={{ 
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '1.875rem' }
                  }}
                >
                  All Employees
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                  }}
                >
                  Manage and view all employees in your organization
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1.5, sm: 2 }, 
                  alignItems: { xs: 'stretch', sm: 'center' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: 'fit-content' }
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 1.5 },
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                  }}
                >
                  <Chip
                    label={`Total: ${allEmployees.length}`}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      height: { xs: '28px', sm: '32px' }
                    }}
                  />
                  <Chip
                    label={`Active: ${allEmployees.filter(emp => emp.isActive).length}`}
                    color="success"
                    variant="outlined"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      height: { xs: '28px', sm: '32px' }
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddEmployee(true)}
                  sx={{
                    backgroundColor: 'primary.main',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    minWidth: { xs: 'auto', sm: 'auto' },
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      boxShadow: 2,
                    },
                  }}
                >
                  Add Employee
                </Button>
              </Box>
            </Box>
            
            {error && (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Box>
            )}

            <EmployeeTable
              employees={allEmployees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              onView={handleViewEmployee}
              onEditEmployee={handleEditEmployee}
              loading={loading}
            />
          </CardContent>
        </Card>
      </Box>

      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 12px rgba(0,0,0,0.4)' 
            : '0 4px 12px rgba(0,0,0,0.2)',
          '&:hover': {
            bgcolor: 'primary.dark',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 6px 16px rgba(0,0,0,0.5)'
              : '0 6px 16px rgba(0,0,0,0.3)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
        onClick={() => console.log('Open chat')}
      >
        <Chat />
      </Fab>

  
      <AddEmployee
        open={addEmployee}
        onClose={handleCloseDialog}
        employees={allEmployees}
        editingEmployee={editingEmployee}
        onSave={handleSaveEmployee}
      />
    </Box>
  );
}
