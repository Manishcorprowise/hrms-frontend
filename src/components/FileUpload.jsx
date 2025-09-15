import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Download,
  Close,
  Image,
  Description,
  PictureAsPdf,
  InsertDriveFile
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { apiUrl } from '../apiservice/apiConfig';

const FileUpload = ({ 
  employeeId, 
  onUploadSuccess, 
  onUploadError, 
  existingFiles = [], 
  onFileDelete,
  onFilePreview,
  maxFiles = 5,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  category = 'personal'
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    fileType: 'other',
    category: category,
    description: ''
  });

  const fileTypeOptions = [
    { value: 'profile-picture', label: 'Profile Picture' },
    { value: 'document', label: 'Document' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'id-proof', label: 'ID Proof' },
    { value: 'address-proof', label: 'Address Proof' },
    { value: 'education-certificate', label: 'Education Certificate' },
    { value: 'experience-letter', label: 'Experience Letter' },
    { value: 'other', label: 'Other' }
  ];

  const categoryOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'personal', label: 'Personal' },
    { value: 'tax', label: 'Tax' },
    { value: 'employment', label: 'Employment' },
    { value: 'bank', label: 'Bank' },
    { value: 'photos', label: 'Photos' },
    { value: 'education', label: 'Education' },
    { value: 'identity', label: 'Identity' }
  ];

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setUploadDialog(true);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', uploadData.fileType);
        formData.append('category', uploadData.category);
        formData.append('description', uploadData.description);

        const response = await fetch(`${apiUrl.apiEndPoint}/profile/upload/${employeeId}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setUploadProgress(((i + 1) / files.length) * 100);
          if (onUploadSuccess) {
            onUploadSuccess(result.data);
          }
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      }

      setSuccess(`${files.length} file(s) uploaded successfully`);
      setFiles([]);
      setUploadDialog(false);
      setUploadData({
        fileType: 'other',
        category: category,
        description: ''
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      const response = await fetch(`${apiUrl.apiEndPoint}/profile/file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (onFileDelete) {
          onFileDelete(fileId);
        }
        setSuccess('File deleted successfully');
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
    }
  };

  const handleFilePreview = (file) => {
    setPreviewDialog({ open: true, file });
    if (onFilePreview) {
      onFilePreview(file);
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `/api/profile/download/${file._id}`;
    link.download = file.originalName;
    link.click();
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image />;
    if (mimeType === 'application/pdf') return <PictureAsPdf />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Upload Button */}
      <Button
        variant="contained"
        startIcon={<CloudUpload />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        sx={{ mb: 2 }}
      >
        Upload Files
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading files... {Math.round(uploadProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files
          </Typography>
          <Grid container spacing={2}>
            {existingFiles.map((file) => (
              <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={file._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getFileIcon(file.mimeType)}
                      <Typography variant="subtitle2" sx={{ ml: 1, flexGrow: 1 }}>
                        {file.originalName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatFileSize(file.fileSize)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip label={file.fileType} size="small" />
                      <Chip label={file.category} size="small" color="primary" />
                    </Box>
                    {file.description && (
                      <Typography variant="body2" color="text.secondary">
                        {file.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleFilePreview(file)}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(file)}
                      color="secondary"
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleFileDelete(file._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Files</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>File Type</InputLabel>
                <Select
                  value={uploadData.fileType}
                  onChange={(e) => setUploadData({ ...uploadData, fileType: e.target.value })}
                >
                  {fileTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Selected files: {files.map(f => f.name).join(', ')}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            File Preview
            <IconButton onClick={() => setPreviewDialog({ open: false, file: null })}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewDialog.file.originalName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Size: {formatFileSize(previewDialog.file.fileSize)} | 
                Type: {previewDialog.file.mimeType}
              </Typography>
              {previewDialog.file.mimeType.startsWith('image/') ? (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={`/api/files/${previewDialog.file.filePath}`}
                    alt={previewDialog.file.originalName}
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                  />
                </Box>
              ) : (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body1">
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownload(previewDialog.file)}
                    sx={{ mt: 2 }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FileUpload;

