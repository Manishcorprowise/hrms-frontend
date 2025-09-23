import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { apiService } from '../apiservice/api';
import { apiUrl } from '../apiservice/apiConfig';

const FileUploadManagement = ({ 
  employeeDetails, 
  isExpanded = false, 
  onToggle,
  maxFiles = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx']
}) => {
  // Document categories
  const documentCategories = [
    { id: 'aadhaar', name: 'Aadhaar Card', required: false, maxFiles: 2 },
    { id: 'profile', name: 'Profile Picture', required: false, maxFiles: 2 },
    { id: 'identity', name: 'Identity Proof', required: false, maxFiles: 2 },
    { id: 'address', name: 'Address Proof', required: false, maxFiles: 2 },
    { id: 'education', name: 'Education Certificate', required: false, maxFiles: 2 },
    { id: 'experience', name: 'Experience Letter', required: false, maxFiles: 2 },
    { id: 'other', name: 'Other Documents', required: false, maxFiles: 10 }
  ];

  const [userFiles, setUserFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const [filesReady, setFilesReady] = useState(false);

  // Initialize selected files state
  useEffect(() => {
    const initialState = {};
    documentCategories.forEach(category => {
      initialState[category.id] = [];
    });
    setSelectedFiles(initialState);
  }, []);

  // File management functions
  const fetchUserFiles = async (employeeId) => {
    try {
      setLoading(true);
      const response = await apiService.getUserFiles(employeeId);
      
      // Handle the nested categories structure
      let files = [];
      if (response.data && response.data.categories) {
        // Flatten the categories structure into a single array
        Object.values(response.data.categories).forEach(category => {
          if (category.files && Array.isArray(category.files)) {
            // Add category property to each file for filtering
            const filesWithCategory = category.files.map(file => ({
              ...file,
              category: category.category
            }));
            files = [...files, ...filesWithCategory];
          }
        });
      }
      
      setUserFiles(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
      setUserFiles([]); // Ensure it's always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (categoryId, files) => {
    const category = documentCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    const fileArray = Array.from(files);
    const currentFiles = selectedFiles[categoryId] || [];
    
    // Check max files limit
    if (currentFiles.length + fileArray.length > category.maxFiles) {
      setError(`Maximum ${category.maxFiles} files allowed for ${category.name}`);
      return;
    }

    // Process each file and convert to data URL
    fileArray.forEach(file => {
      console.log('Processing file:', file.name, file.size, file.type);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const newFile = {
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? reader.result : null,
          dataUrl: reader.result // Store the data URL for upload
        };

        console.log('New file object created:', newFile);

        setSelectedFiles(prev => {
          const updated = {
            ...prev,
            [categoryId]: [...(prev[categoryId] || []), newFile]
          };
          console.log('Updated selectedFiles state:', updated);
          return updated;
        });
      };
    });
  };

  const removeSelectedFile = (categoryId, fileId) => {
    setSelectedFiles(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(file => file.id !== fileId)
    }));
  };

  const uploadFilesByCategory = async (categoryId) => {
    const files = selectedFiles[categoryId] || [];
    console.log('Upload function called for category:', categoryId);
    console.log('Files in category:', files);
    
    if (files.length === 0) {
      console.log('No files to upload for category:', categoryId);
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Prepare JSON payload
      const payload = {
        employeeId: employeeDetails._id,
        category: categoryId,
        files: files.map(fileObj => ({
          originalName: fileObj.name,
          fileType: fileObj.type,
          fileSize: fileObj.size,
          dataUrl: fileObj.dataUrl
        }))
      };


      setUploadProgress(prev => ({ ...prev, [categoryId]: 0 }));

      const response = await apiService.uploadFile(payload);
      
      if (response.data && response.data.length > 0) {
        setUserFiles(prev => [...response.data, ...prev]);
        fetchUserFiles(employeeDetails._id);
        // Clear selected files after successful upload
        setSelectedFiles(prev => ({
          ...prev,
          [categoryId]: []
        }));
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(prev => ({ ...prev, [categoryId]: null }));
    }
  };

  const uploadAllFiles = async () => {
    console.log('=== UPLOAD ALL FILES STARTED ===');
    console.log('Current selectedFiles state:', selectedFiles);
    
    const categoriesToUpload = Object.keys(selectedFiles).filter(
      categoryId => selectedFiles[categoryId].length > 0
    );
    
    console.log('Categories to upload:', categoriesToUpload);
    
    if (categoriesToUpload.length === 0) {
      console.log('No categories have files to upload');
      setError('No files selected for upload');
      return;
    }
    
    for (const categoryId of categoriesToUpload) {
      console.log(`Uploading files for category: ${categoryId}`);
      await uploadFilesByCategory(categoryId);
    }
  };

//   const handleFileDelete = async (fileId) => {
//     try {
//       await apiService.deleteUserFile(fileId);
//       setUserFiles(prev => prev.filter(file => file._id !== fileId));
//     } catch (error) {
//       console.error('Error deleting file:', error);
//       setError('Failed to delete file');
//     }
//   };

  const handleFilePreview = (file) => {
    // Handle both selected files and uploaded files
    console.log('File:', file);
    const previewFile = {
      originalName: file.fileName || file.name || file.originalName,
      fileType: file.type || getFileTypeFromUrl(file.fileUrl || file.preview || file.dataUrl),
      filePath: file.fileUrl, // Store original file path
      fileUrl: file.fileUrl
        ? `${apiUrl.apiEndPoint.replace('/api', '/api/files')}/${file.fileUrl.replace(/^\/+/, '')}`
        : file.preview || file.dataUrl
    };
    console.log('Preview File:', previewFile);
    setPreviewDialog({ open: true, file: previewFile });
  };

  // Helper function to determine file type from URL
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

  const handleFileDownload = (file) => {
    try {
      // Use original file path from backend, not the constructed URL from preview
      const filePath = file.filePath || file.fileUrl;
      if (!filePath) {
        setError('File URL not available');
        return;
      }

      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.setAttribute('download', file.fileName || file.originalName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    return <DocumentIcon />;
  };

  const getFileTypeColor = (fileType) => {
    if (fileType.startsWith('image/')) return 'primary';
    if (fileType === 'application/pdf') return 'error';
    return 'default';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryStatus = (categoryId) => {
    const uploadedFiles = (userFiles || []).filter(file => file.category === categoryId);
    const selectedFilesCount = selectedFiles[categoryId]?.length || 0;
    
    if (uploadedFiles.length > 0) {
      return { status: 'uploaded', text: 'Uploaded', color: 'success' };
    } else if (selectedFilesCount > 0) {
      return { status: 'ready', text: 'Ready to Upload', color: 'success' };
    } else {
      return { status: 'not_uploaded', text: 'Not Uploaded', color: 'error' };
    }
  };

  const getTotalSelectedFiles = () => {
    return Object.values(selectedFiles).reduce((total, files) => total + files.length, 0);
  };

  // Load files when component mounts or employee changes
  useEffect(() => {
    if (employeeDetails?._id) {
      fetchUserFiles(employeeDetails._id);
    }
  }, [employeeDetails?._id]);

  const FormCard = ({ title, children, icon }) => (
    <Card sx={{ 
      mb: { xs: 2, sm: 3 }, 
      boxShadow: 2,
      mx: { xs: -1, sm: 0 }
    }}>
      <Accordion expanded={isExpanded} onChange={onToggle}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" width="100%">
            {icon}
            <Typography 
              variant="h6" 
              sx={{ 
                ml: 1, 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <CardContent sx={{ pt: 0, px: { xs: 2, sm: 3 } }}>
            {children}
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </Card>
  );

  return (
    <FormCard
      title="Document Upload & Management"
      icon={<CloudUpload color="primary" />}
      sx={{ '& .MuiCardContent-root': { p: 2 } }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1.5, py: 0.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Document Categories - Compact Design */}
      <Stack spacing={1.5}>
        {documentCategories.map((category) => {
          const status = getCategoryStatus(category.id);
          const selectedFilesCount = selectedFiles[category.id]?.length || 0;
          const uploadedFiles = (userFiles || []).filter(file => file.category === category.id);
          
          return (
            <Paper key={category.id} variant="outlined" sx={{ p: 1.5 }}>
              {/* Compact Category Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                  {category.name}
                  {category.required && <span style={{ color: 'red' }}> *</span>}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={status.text}
                    color={status.color}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', height: 24 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => document.getElementById(`file-input-${category.id}`).click()}
                    sx={{ p: 0.5 }}
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Compact Upload Area */}
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: selectedFilesCount > 0 ? 'success.main' : 'grey.300',
                  borderRadius: 1,
                  p: 1,
                  textAlign: 'center',
                  backgroundColor: selectedFilesCount > 0 ? 'rgba(76, 175, 80, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                  mb: selectedFilesCount > 0 || uploadedFiles.length > 0 ? 1 : 0
                }}
                onClick={() => document.getElementById(`file-input-${category.id}`).click()}
              >
                {selectedFilesCount > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="caption" color="success.main" fontWeight={500}>
                      {selectedFilesCount} file{selectedFilesCount > 1 ? 's' : ''} selected
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CloudUpload sx={{ fontSize: 20, color: 'grey.500' }} />
                    <Typography variant="caption" color="text.secondary">
                      Click to add files
                    </Typography>
                  </Box>
                )}
                <input
                  id={`file-input-${category.id}`}
                  type="file"
                  multiple={category.maxFiles > 1}
                  accept={allowedTypes.join(',')}
                  onChange={(e) => handleFileSelect(category.id, e.target.files)}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </Box>

              {/* Compact Selected Files */}
              {selectedFilesCount > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Selected: {selectedFilesCount} file{selectedFilesCount > 1 ? 's' : ''}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<UploadIcon />}
                      onClick={() => uploadFilesByCategory(category.id)}
                      disabled={uploading}
                      sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5, minWidth: 'auto' }}
                    >
                      Upload
                    </Button>
                  </Box>
                  
                  {/* Compact File List */}
                  <Stack spacing={0.5}>
                    {selectedFiles[category.id].slice(0, 3).map((fileObj) => (
                      <Box key={fileObj.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.5, bgcolor: 'grey.50', borderRadius: 0.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* File Icon */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getFileIcon(fileObj.type)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem' }}>
                              {fileObj.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                              {formatFileSize(fileObj.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          {/* Preview Button for Images and PDFs */}
                          {(fileObj.type.startsWith('image/') || fileObj.type === 'application/pdf') && (
                            <Tooltip title="Preview">
                              <IconButton
                                size="small"
                                onClick={() => handleFilePreview(fileObj)}
                                sx={{ p: 0.25 }}
                              >
                                <ViewIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {/* Remove Button */}
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              onClick={() => removeSelectedFile(category.id, fileObj.id)}
                              sx={{ p: 0.25 }}
                            >
                              <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                    {selectedFilesCount > 3 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.7rem' }}>
                        +{selectedFilesCount - 3} more files
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Compact Upload Progress */}
              {uploadProgress[category.id] !== null && uploadProgress[category.id] !== undefined && (
                <Box sx={{ mb: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress[category.id]} sx={{ height: 4, borderRadius: 2 }} />
                </Box>
              )}

              {/* Compact Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="success.main" fontWeight={500}>
                      ✓ Uploaded ({uploadedFiles.length})
                    </Typography>
                  </Box>
                  
                  {/* Compact Uploaded Files List */}
                  <Stack spacing={0.5}>
                    {uploadedFiles.slice(0, 2).map((file) => (
                      <Box key={file._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.5, bgcolor: 'success.light', borderRadius: 0.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem' }}>
                            {file.fileName || file.originalName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => handleFilePreview(file)}
                              sx={{ p: 0.25 }}
                            >
                              <ViewIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" onClick={() => handleFileDownload(file)} sx={{ p: 0.25 }}>
                              <DownloadIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                    {uploadedFiles.length > 2 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.7rem' }}>
                        +{uploadedFiles.length - 2} more uploaded files
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      {/* Single Submit Button */}
      {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadIcon />}
          onClick={uploadAllFiles}
          disabled={uploading || getTotalSelectedFiles() === 0}
          sx={{ 
            px: 4, 
            py: 1.5, 
            fontSize: '1rem',
            fontWeight: 600,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          {uploading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : (
            `Submit Documents (${getTotalSelectedFiles()})`
          )}
        </Button>
        {getTotalSelectedFiles() === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select files above to enable submit
          </Typography>
        )}
      </Box> */}


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
        <DialogActions>
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
        </DialogActions>
      </Dialog>
    </FormCard>
  );
};

export default FileUploadManagement;
