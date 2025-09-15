import React from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

const PersonalDetailsTab = ({ userData }) => {
  const InfoItem = ({ label, value, icon }) => (
    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <Box 
        sx={{ 
          mb: 2,
          height: { xs: '90px', sm: '100px', md: '110px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
          backgroundColor: 'background.default',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'primary.main'
          }
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom 
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}
        >
          {label}
        </Typography>
        <Box 
          display="flex" 
          alignItems="center" 
          flex={1} 
          sx={{ 
            minHeight: { xs: '32px', sm: '40px' }
          }}
        >
          {icon && (
            <Box sx={{ 
              mr: { xs: 0.8, sm: 1 }, 
              color: 'primary.main', 
              minWidth: { xs: '18px', sm: '20px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {icon}
            </Box>
          )}
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
              WebkitBoxOrient: 'vertical',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {value || 'Not provided'}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

  return (
    <Box>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'stretch' }}>
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
    </Box>
  );
};

export default PersonalDetailsTab;
