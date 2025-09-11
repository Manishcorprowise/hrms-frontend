import React from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const AccountDetailsTab = ({ userData }) => {
  // Handle both array and object formats for account data
  const accountData = Array.isArray(userData?.account) ? userData.account[0] : userData?.account;
  
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
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'stretch' }}>
        <InfoItem 
          label="Bank Account Number" 
          value={accountData?.bankAccountNumber || 'Not provided'}
          icon={<CardIcon />}
        />
        <InfoItem 
          label="Bank IFSC" 
          value={accountData?.bankIFSC || 'Not provided'}
          icon={<BankIcon />}
        />
        <InfoItem 
          label="Beneficiary Name" 
          value={accountData?.beneficiaryName || 'Not provided'}
          icon={<PersonIcon />}
        />
      </Grid>
    </Box>
  );
};

export default AccountDetailsTab;
