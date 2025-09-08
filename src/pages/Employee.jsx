import React, { useState } from 'react';
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
import AddEmployee from './AddEmployee';
import { grey } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom'; 
export default function Employee() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [addEmployee, setAddEmployee] = useState(false);
  // Dummy data
  const newJoiners = [
    { id: 111, name: 'Rubesh', daysAgo: 2 },
    { id: 123, name: 'Arvind', daysAgo: 3 },
    { id: 112, name: 'Manish Yadav', daysAgo: 3 },
  ];

  const upcomingBirthdays = [
    { 
      id: 'T0019', 
      name: 'Aadesh Hiralal So...', 
      date: '10 Sep 2025',
      avatar: '/api/placeholder/40/40'
    },
  ];

  const resignedEmployees = []; // Empty for now

  const joiningAnniversaries = [
    { 
      id: 'T0019', 
      name: 'Aadesh Hiralal So...', 
      date: '09 Sep 2020',
      years: 5,
      avatar: '/api/placeholder/40/40'
    },
  ];

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
        {/* New Joiners Card */}
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

        {/* Upcoming Birthdays Card */}
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

        {/* Resigned Employees Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <CardComponent 
            title="Resigned Employees for Last 1 Month" 
            showAddButton={true}
            onAddClick={() => setAddEmployee(true)}
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
                      secondary={`${employee.daysAgo} days ago`}
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

        {/* Joining Anniversary Card */}
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

      {/* Floating Action Button for Chat */}
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
        onClose={() => setAddEmployee(false)}
      />
    </Box>
  );
}
