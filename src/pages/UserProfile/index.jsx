import React, { useState, useEffect } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import UserProfileEdit from './UserProfileEdit';
import { useThemeContext } from '../../theme/ThemeProvider';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useSelector(state => state.auth);
  const [personalData, setPersonalData] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Fetch user filescons
  const fetchUserFiles = async (userId) => {
    try {
      setFilesLoading(true);
      const response = await apiService.getUserFiles(userId);
      console.log(response,'response');
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
        if (user?.id) {
          try {
            const response = await apiService.getPersonalDetails(user.id);
            setPersonalData(response.data);
          } catch (error) {
            console.log('No personal details found, will create new');
          }
        }

        setUserData({
          employment: employmentData,
          personal: personalData || {
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
          education: personalData?.education || [
            { qualification: '', specialization: '', institution: '', board: '', startDate: '', endDate: '', grade: '', modeOfStudy: '', country: '', status: 'Completed' }
          ]
        });

        setPersonalDetails(personalData);
        
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

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (formData) => {
    try {

      setLoading(true);
      
      // Prepare personal details data
      const personalDetailsData = {
        ...formData.personal,
        education: formData.education
      };

      // Save or update personal details
      const response = personalData 
        ? await apiService.updatePersonalDetails(user.id, personalDetailsData)
        : await apiService.createPersonalDetails(user.id, personalDetailsData);

      setPersonalDetails(response.data);
      setUserData(prev => ({
        ...prev,
        personal: response.data,
        education: response.data.education
      }));
      setIsEditing(false);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const InfoCard = ({ title, children, icon }) => (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  const InfoItem = ({ label, value, icon }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Box 
        sx={{ 
          mb: 2,
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Box display="flex" alignItems="center" flex={1} sx={{ minHeight: '40px' }}>
          {icon && <Box sx={{ mr: 1, color: 'primary.main', minWidth: '20px' }}>{icon}</Box>}
          <Typography 
            variant="body1" 
            fontWeight={500}
            color="text.primary"
            sx={{ 
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {value || 'Not provided'}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

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
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {(userData.employment?.employeeName || 'User').split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography p={0} m={0} variant="h4" fontWeight={600} gutterBottom>
              {userData.employment?.employeeName || 'User Name'}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {userData.employment?.position || 'Position'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={userData.employment?.employeeId || 'ID'} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label="Active" 
                size="small" 
                color="success" 
                variant="filled"
              />
            </Stack>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setIsEditing(!isEditing)}
          sx={{ px: 3, py: 1.5 }}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Employment Details */}
        <Grid item xs={12}>
          <InfoCard 
            title="Employment Details" 
            icon={<WorkIcon color="primary" />}
          >
            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
              <InfoItem 
                label="Employee Name" 
                value={userData.employment?.employeeName || 'Not provided'}
                icon={<PersonIcon />}
              />
              <InfoItem 
                label="Employee ID" 
                value={userData.employment?.employeeId || 'Not provided'}
                icon={<BadgeIcon />}
              />
              <InfoItem 
                label="Email Address" 
                value={userData.employment?.email || 'Not provided'}
                icon={<EmailIcon />}
              />
              <InfoItem 
                label="Phone Number" 
                value={userData.employment?.phone || 'Not provided'}
                icon={<PhoneIcon />}
              />
              <InfoItem 
                label="Joining Date" 
                value={userData.employment?.joiningDate ? new Date(userData.employment.joiningDate).toLocaleDateString() : 'Not provided'}
                icon={<CalendarIcon />}
              />
              <InfoItem 
                label="Position/Job Title" 
                value={userData.employment?.position || 'Not provided'}
                icon={<WorkIcon />}
              />
              <InfoItem 
                label="Department" 
                value={userData.employment?.department || 'Not provided'}
                icon={<WorkIcon />}
              />
              <InfoItem 
                label="Manager" 
                value={userData.employment?.manager || 'Not provided'}
                icon={<PersonIcon />}
              />
            </Grid>
          </InfoCard>
        </Grid>

        {/* Personal Details */}
        <Grid item xs={12}>
          <InfoCard 
            title="Personal Details" 
            icon={<PersonIcon color="primary" />}
          >
            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
              <InfoItem 
                label="Date of Birth" 
                value={userData.personal?.dateOfBirth ? new Date(userData.personal.dateOfBirth).toLocaleDateString() : 'Not provided'}
                icon={<CalendarIcon />}
              />
              <InfoItem 
                label="Nationality" 
                value={userData.personal?.nationality || 'Not provided'}
                icon={<LocationIcon />}
              />
              <InfoItem 
                label="Marital Status" 
                value={userData.personal?.maritalStatus || 'Not provided'}
                icon={<PersonIcon />}
              />
              <InfoItem 
                label="Place of Birth" 
                value={userData.personal?.placeOfBirth || 'Not provided'}
                icon={<LocationIcon />}
              />
              <InfoItem 
                label="Residential Status" 
                value={userData.personal?.residentialStatus || 'Not provided'}
                icon={<BadgeIcon />}
              />
              <InfoItem 
                label="Father Name" 
                value={userData.personal?.fatherName || 'Not provided'}
                icon={<PersonIcon />}
              />
              <InfoItem 
                label="Height" 
                value={userData.personal?.height || 'Not provided'}
                icon={<PersonIcon />}
              />
              <InfoItem 
                label="Weight" 
                value={userData.personal?.weight || 'Not provided'}
                icon={<PersonIcon />}
              />
              <InfoItem 
                label="Identification Mark" 
                value={userData.personal?.identificationMark || 'Not provided'}
                icon={<BadgeIcon />}
              />
              <InfoItem 
                label="Hobby" 
                value={userData.personal?.hobby || 'Not provided'}
                icon={<PersonIcon />}
              />
              <InfoItem 
                label="Address" 
                value={userData.personal?.address || 'Not provided'}
                icon={<LocationIcon />}
              />
            </Grid>
          </InfoCard>
        </Grid>


        {/* Education Details */}
        <Grid item xs={12}>
          <InfoCard 
            title="Education Details" 
            icon={<SchoolIcon color="primary" />}
          >
            {userData.education[0].qualification!=='' && (userData.education || []).map((edu, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography variant="subtitle1" fontWeight={500} sx={{ mr: 2 }}>
                      {edu.qualification} in {edu.specialization}
                    </Typography>
                    <Chip 
                      label={edu.status} 
                      color={edu.status === 'Completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                    <InfoItem 
                      label="Qualification/Degree" 
                      value={edu.qualification}
                      icon={<SchoolIcon />}
                    />
                    <InfoItem 
                      label="Specialization/Major" 
                      value={edu.specialization}
                      icon={<SchoolIcon />}
                    />
                    <InfoItem 
                      label="Institution/University" 
                      value={edu.institution}
                      icon={<SchoolIcon />}
                    />
                    <InfoItem 
                      label="Board/Council" 
                      value={edu.board}
                      icon={<SchoolIcon />}
                    />
                    <InfoItem 
                      label="Start Date" 
                      value={new Date(edu.startDate).toLocaleDateString()}
                      icon={<CalendarIcon />}
                    />
                    <InfoItem 
                      label="End Date" 
                      value={new Date(edu.endDate).toLocaleDateString()}
                      icon={<CalendarIcon />}
                    />
                    <InfoItem 
                      label="Grade/Percentage" 
                      value={edu.grade}
                      icon={<SchoolIcon />}
                    />
                    <InfoItem 
                      label="Mode of Study" 
                      value={edu.modeOfStudy}
                      icon={<SchoolIcon />}
                    />
                    <InfoItem 
                      label="Country/Location" 
                      value={edu.country}
                      icon={<LocationIcon />}
                    />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </InfoCard>
        </Grid>

        {/* Document Management */}
        <Grid item xs={12}>
          <InfoCard 
            title="Document Management" 
            icon={<DocumentIcon color="primary" />}
          >
            {filesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : userFiles.length > 0 ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {userFiles.length} document(s) uploaded
                </Typography>
                <List>
                  {userFiles.map((file, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <DocumentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.originalName || file.filename}
                        secondary={`Uploaded: ${new Date(file.uploadDate).toLocaleDateString()}`}
                      />
                      <Chip 
                        label={file.fileType || 'Document'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    size="small"
                  >
                    Manage Documents
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Documents Uploaded
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload and manage your documents in the edit mode
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ mt: 2 }}
                >
                  Upload Documents
                </Button>
              </Box>
            )}
          </InfoCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
