import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Description as DocumentIcon
} from '@mui/icons-material';

const DocumentsTab = ({ userFiles, filesLoading, onEdit }) => {
  return (
    <Box>
      {filesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : userFiles.length > 0 ? (
        <Box>
          <Typography 
            variant="h6" 
            color="text.primary" 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            📁 {userFiles.length} document(s) uploaded
          </Typography>
          <List sx={{ p: 0 }}>
            {userFiles.map((file, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  px: 0, 
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.default',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <ListItemIcon>
                  <Box sx={{
                    p: { xs: 0.8, sm: 1 },
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <DocumentIcon sx={{ 
                      color: 'white',
                      fontSize: { xs: 18, sm: 20 }
                    }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      fontWeight={600}
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {file.originalName || file.filename}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                    </Typography>
                  }
                />
                <Chip 
                  label={file.fileType || 'Document'} 
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ flexShrink: 0 }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{ 
                px: { xs: 2, sm: 3 }, 
                py: { xs: 1, sm: 1.5 }
              }}
            >
              Manage Documents
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
          <Box sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}>
            <DocumentIcon sx={{ 
              fontSize: { xs: 36, sm: 42, md: 48 }, 
              color: 'white' 
            }} />
          </Box>
          <Typography 
            variant="h5" 
            color="text.primary" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
            }}
          >
            No Documents Uploaded
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: { xs: '100%', sm: '400px' },
              mx: 'auto'
            }}
          >
            Upload and manage your documents to keep them organized and easily accessible
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ 
              mt: 2, 
              px: { xs: 3, sm: 4 }, 
              py: { xs: 1.5, sm: 2 }
            }}
          >
            Upload Documents
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DocumentsTab;
