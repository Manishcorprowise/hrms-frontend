import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const EducationTab = ({ userData }) => {
  const InfoItem = ({ label, value, icon }) => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
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
      {(userData.education || []).filter(edu => edu.qualification && edu.qualification !== '').map((edu, index) => (
        <Accordion 
          key={index} 
          sx={{ 
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: '16px 0',
            }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: 'background.default',
              borderRadius: '4px 4px 0 0',
              minHeight: 60,
              '&.Mui-expanded': {
                minHeight: 60,
              },
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
                '&.Mui-expanded': {
                  margin: '12px 0',
                }
              }
            }}
          >
            <Box display="flex" alignItems="center" width="100%">
              <Box sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: 'primary.main',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SchoolIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mr: 2, flex: 1 }}>
                {edu.qualification} in {edu.specialization}
              </Typography>
              <Chip 
                label={edu.status} 
                color={edu.status === 'Completed' ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'stretch' }}>
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
                value={edu.startDate ? new Date(edu.startDate).toLocaleDateString() : 'Not provided'}
                icon={<CalendarIcon />}
              />
              <InfoItem 
                label="End Date" 
                value={edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Not provided'}
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
    </Box>
  );
};

export default EducationTab;
