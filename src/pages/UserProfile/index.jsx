import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../apiservice/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Avatar,
  Tabs,
  Tab,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import UserProfileEdit from './UserProfileEdit';
import PersonalDetailsTab from './tabs/PersonalDetailsTab';
import EducationTab from './tabs/EducationTab';
import DocumentsTab from './tabs/DocumentsTab';
import AccountDetailsTab from './tabs/AccountDetailsTab';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useSelector(state => state.auth);
  const [personalData, setPersonalData] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  // Fetch user files
  const fetchUserFiles = async (userId) => {
    try {
      setFilesLoading(true);
      const response = await apiService.getUserFiles(userId);
      setUserFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching user files:', error);
      setUserFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch user data from API
  useEffect(() => {
    if (userId) {
      // Viewing another user's profile
      fetchTargetUserData();
    } else if (user?.id) {
      // Viewing own profile
      fetchUserData();
    }
  }, [userId, user?.id]);

  const fetchTargetUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch target user's basic info
      const userResponse = await apiService.getEmployeeById(userId);
      const targetUserData = userResponse.user || userResponse;
      setTargetUser(targetUserData);

      // Fetch employment details (from target user data)
      const employmentData = {
        employeeName: targetUserData?.employeeName || '',
        employeeId: targetUserData?.employeeNumber || '',
        email: targetUserData?.email || '',
        phone: targetUserData?.phone || '',
        joiningDate: targetUserData?.dateOfJoining || '',
        position: targetUserData?.position || '',
        department: targetUserData?.department || '',
        manager: targetUserData?.manager || ''
      };

      // Fetch personal details
      let personalDetailsData = null;
      try {
        const response = await apiService.getPersonalDetails(userId);
        personalDetailsData = response.data;
        setPersonalData(response.data);
      } catch (error) {
        // No personal details found for this user
      }

      const finalUserData = {
        employment: employmentData,
        personal: personalDetailsData || {
          dateOfBirth: '',
          nationality: '',
          maritalStatus: '',
          placeOfBirth: '',
          residentialStatus: '',
          fatherName: '',
          height: '',
          weight: '',
          identificationMark: '',
          hobby: '',
          address: ''
        },
        education: personalDetailsData?.education || [
          { qualification: '', specialization: '', institution: '', board: '', startDate: '', endDate: '', grade: '', modeOfStudy: '', country: '', status: 'Completed' }
        ],
        // Keep account as array since that's how it comes from API
        account: personalDetailsData?.account || []
      };
      
      setUserData(finalUserData);
      
      // Fetch user files
      fetchUserFiles(userId);
    } catch (error) {
      console.error('Error fetching target user data:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch employment details (from user data)
      const employmentData = {
        employeeName: user?.employeeName || '',
        employeeId: user?.employeeNumber || '',
        email: user?.email || '',
        phone: user?.phone || '',
        joiningDate: user?.dateOfJoining || '',
        position: user?.position || '',
        department: user?.department || '',
        manager: user?.manager || ''
      };

      // Fetch personal details
      let personalDetailsData = null;
      if (user?.id) {
        try {
          const response = await apiService.getPersonalDetails(user.id);
          personalDetailsData = response.data;
          setPersonalData(response.data);
        } catch (error) {
          // No personal details found, will create new
        }
      }

      const finalUserData = {
        employment: employmentData,
        personal: personalDetailsData || {
          dateOfBirth: '',
          nationality: '',
          maritalStatus: '',
          placeOfBirth: '',
          residentialStatus: '',
          fatherName: '',
          height: '',
          weight: '',
          identificationMark: '',
          hobby: '',
          address: ''
        },
        education: personalDetailsData?.education || [
          { qualification: '', specialization: '', institution: '', board: '', startDate: '', endDate: '', grade: '', modeOfStudy: '', country: '', status: 'Completed' }
        ],
        // Keep account as array since that's how it comes from API
        account: personalDetailsData?.account || []
      };
      
      setUserData(finalUserData);

      
      // Fetch user files
      if (user?.id) {
        fetchUserFiles(user.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      
      // Determine which user ID to use for saving
      const targetUserId = userId || user.id;
      
      // Prepare personal details data
      const personalDetailsData = {
        ...formData.personal,
        education: formData.education,
        account: formData.account
      };

      // Save or update personal details
      const response = personalData 
        ? await apiService.updatePersonalDetails(targetUserId, personalDetailsData)
        : await apiService.createPersonalDetails(targetUserId, personalDetailsData);

      setUserData(prev => ({
        ...prev,
        personal: response.data,
        education: response.data.education,
        account: response.data.account || prev.account
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };


  // Show loading state
  if (loading && !userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Show edit form if editing
  if (isEditing) {
    return (
      <UserProfileEdit
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={userData}
        targetUserId={userId}
      />
    );
  }

  // Show message if no user data
  if (!userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No user data available. Please log in again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      <Box>
        {/* Enhanced Header Section with All Employee Details */}
        <Card sx={{ 
          mb: 4, 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
              mb={4}
              gap={2}
            >
              <Box display="flex" alignItems="center" flex={1}>
                <Avatar
                  sx={{ 
                    width: { xs: 80, sm: 90, md: 100 }, 
                    height: { xs: 80, sm: 90, md: 100 }, 
                    mr: { xs: 2, sm: 3, md: 4 },
                    bgcolor: 'primary.main',
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {(userData.employment?.employeeName || 'User').split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h3" 
                    fontWeight={700} 
                    gutterBottom 
                    sx={{ 
                      mb: 1, 
                      color: 'text.primary',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      wordBreak: 'break-word'
                    }}
                  >
                    {userData.employment?.employeeName || 'User Name'}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="text.secondary" 
                    gutterBottom 
                    sx={{ 
                      mb: 3,
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }
                    }}
                  >
                    {userData.employment?.position || 'Position'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip 
                      label={`ID: ${userData.employment?.employeeId || 'N/A'}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label="Active Employee" 
                      color="success"
                      size="small"
                    />
                  </Stack>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {userId && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ 
                      px: { xs: 2, sm: 3, md: 4 }, 
                      py: { xs: 1, sm: 1.5, md: 2 },
                      borderRadius: 2,
                      minWidth: { xs: 'auto', sm: '120px' }
                    }}
                  >
                    Back
                  </Button>
                )}
                {/* Show edit button for own profile or if user has admin permissions */}
                {(!userId || (user?.role === 'admin' || user?.role === 'super_admin')) && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(!isEditing)}
                    sx={{ 
                      px: { xs: 2, sm: 3, md: 4 }, 
                      py: { xs: 1, sm: 1.5, md: 2 },
                      borderRadius: 2,
                      minWidth: { xs: 'auto', sm: '140px' }
                    }}
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Employee Details Grid in Header */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                }}
              >
                Employee Information
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1, 
                    backgroundColor: 'background.default',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        mb: 1
                      }}
                    >
                      Email Address
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ minHeight: { xs: '32px', sm: '40px' } }}>
                      <EmailIcon sx={{ 
                        mr: 1, 
                        color: 'primary.main', 
                        fontSize: { xs: 18, sm: 20 },
                        flexShrink: 0
                      }} />
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        sx={{
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {userData.employment?.email || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1, 
                    backgroundColor: 'background.default',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        mb: 1
                      }}
                    >
                      Phone Number
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ minHeight: { xs: '32px', sm: '40px' } }}>
                      <PhoneIcon sx={{ 
                        mr: 1, 
                        color: 'primary.main', 
                        fontSize: { xs: 18, sm: 20 },
                        flexShrink: 0
                      }} />
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        sx={{
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {userData.employment?.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1, 
                    backgroundColor: 'background.default',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        mb: 1
                      }}
                    >
                      Joining Date
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ minHeight: { xs: '32px', sm: '40px' } }}>
                      <CalendarIcon sx={{ 
                        mr: 1, 
                        color: 'primary.main', 
                        fontSize: { xs: 18, sm: 20 },
                        flexShrink: 0
                      }} />
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        sx={{
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {userData.employment?.joiningDate ? new Date(userData.employment.joiningDate).toLocaleDateString() : 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1, 
                    backgroundColor: 'background.default',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        mb: 1
                      }}
                    >
                      Department
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ minHeight: { xs: '32px', sm: '40px' } }}>
                      <WorkIcon sx={{ 
                        mr: 1, 
                        color: 'primary.main', 
                        fontSize: { xs: 18, sm: 20 },
                        flexShrink: 0
                      }} />
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        sx={{
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {userData.employment?.department || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1, 
                    backgroundColor: 'background.default',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        mb: 1
                      }}
                    >
                      Manager
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ minHeight: { xs: '32px', sm: '40px' } }}>
                      <PersonIcon sx={{ 
                        mr: 1, 
                        color: 'primary.main', 
                        fontSize: { xs: 18, sm: 20 },
                        flexShrink: 0
                      }} />
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        sx={{
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {userData.employment?.manager || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

      {/* Tabs Section */}
      <Card sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Personal Details" 
              iconPosition="start"
            />
            <Tab 
              icon={<SchoolIcon />} 
              label="Education" 
              iconPosition="start"
            />
            <Tab 
              icon={<DocumentIcon />} 
              label="Documents" 
              iconPosition="start"
            />
            <Tab 
              icon={<AccountBalanceIcon />} 
              label="Account Details" 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {activeTab === 0 && <PersonalDetailsTab userData={userData} />}
          {activeTab === 1 && <EducationTab userData={userData} />}
          {activeTab === 2 && (
            <DocumentsTab 
              userFiles={userFiles}
              filesLoading={filesLoading}
              onEdit={handleEdit}
            />
          )}
          {activeTab === 3 && <AccountDetailsTab userData={userData} />}
        </CardContent>
      </Card>
      </Box>
    </Box>
  );
};

export default UserProfile;
