import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import FileUploadManagement from '../../../components/FileUploadManagement';
import { apiService } from '../../../apiservice/api';
import { apiUrl } from '../../../apiservice/apiConfig';

const DocumentsTab = ({ userFiles, filesLoading, onEdit, employeeDetails }) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });

  // Group files by category - ensure userFiles is an array
  const groupedFiles = (userFiles || []).reduce((acc, file) => {
    const category = file.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {});

  // Document categories with display names
  const categoryNames = {
    'aadhaar': 'Aadhaar Card',
    'profile': 'Profile Picture',
    'identity': 'Identity Proof',
    'address': 'Address Proof',
    'education': 'Education Certificate',
    'experience': 'Experience Letter',
    'other': 'Other Documents'
  };

  const getFileIcon = (fileType) => {
    if (fileType && fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    return <DocumentIcon />;
  };

  const getFileTypeFromUrl = (url) => {
    if (!url) return null;
    const extension = url.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image/' + extension;
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };

  const handleFilePreview = (file) => {
    const previewFile = {
      originalName: file.fileName || file.originalName,
      fileType: getFileTypeFromUrl(file.fileUrl),
      filePath: file.fileUrl, // Store original file path
      fileUrl: file.fileUrl
        ? `${apiUrl.apiEndPoint.replace('/api', '/api/files')}/${file.fileUrl.replace(/^\/+/, '')}`
        : file.fileUrl
    };
    setPreviewDialog({ open: true, file: previewFile });
  };

  const handleFileDownload = (file) => {
    try {
      // Use original file path from backend
      const filePath = file.filePath || file.fileUrl;
      
      if (!filePath) {
        console.error('File URL not available');
        return;
      }

      const link = document.createElement('a');
      // Check if filePath already contains a full URL
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        link.href = filePath;
      } else {
        link.href = `${apiUrl.apiEndPoint.replace('/api', '/api/files')}/${filePath.replace(/^\/+/, '')}`;
      }
      
      // Force download behavior
      link.setAttribute('download', file.fileName || file.originalName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Box>
      {filesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (userFiles || []).length > 0 ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              📁 Documents ({(userFiles || []).length})
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => setShowUploadDialog(true)}
              sx={{ 
                px: { xs: 2, sm: 3 }, 
                py: { xs: 1, sm: 1.5 }
              }}
            >
              Manage Documents
            </Button>
          </Box>

          {/* Grouped Documents by Category */}
          <Stack spacing={3}>
            {Object.entries(groupedFiles).map(([category, files]) => (
              <Paper key={category} variant="outlined" sx={{ p: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  sx={{ mb: 2, color: 'primary.main' }}
                >
                  {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Stack spacing={1}>
                  {files.map((file) => (
                    <Box 
                      key={file._id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 1.5,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                          {getFileIcon(getFileTypeFromUrl(file.fileUrl) || file.fileType)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight={500}
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            {file.fileName || file.originalName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => handleFilePreview(file)}
                            sx={{ p: 0.5 }}
                          >
                            <ViewIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleFileDownload(file)}
                            sx={{ p: 0.5 }}
                          >
                            <DownloadIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
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
            onClick={() => setShowUploadDialog(true)}
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

      {/* File Upload Management Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Document Management</Typography>
            <IconButton onClick={() => setShowUploadDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {employeeDetails && (
            <FileUploadManagement 
              employeeDetails={employeeDetails}
              isExpanded={true}
              onToggle={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {previewDialog.file && getFileIcon(previewDialog.file.fileType)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {previewDialog.file?.originalName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box sx={{ textAlign: 'center' }}>
              {previewDialog.file.fileType && previewDialog.file.fileType.startsWith('image/') ? (
                <img
                  src={previewDialog.file.fileUrl}
                  alt={previewDialog.file.originalName}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : previewDialog.file.fileType === 'application/pdf' ? (
                <iframe
                  src={previewDialog.file.fileUrl}
                  width="100%"
                  height="70vh"
                  style={{ border: 'none' }}
                  title={previewDialog.file.originalName}
                />
              ) : (
                <Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    File Preview
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {previewDialog.file.originalName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preview not available for this file type. Click Download to view the file.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={() => setPreviewDialog({ open: false, file: null })}>
            Close
          </Button>
          {previewDialog.file && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleFileDownload(previewDialog.file)}
            >
              Download
            </Button>
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default DocumentsTab;
