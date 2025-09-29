import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Avatar,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Preview as PreviewIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EditNotifications
} from '@mui/icons-material';
import { apiService } from '../../apiservice/api';
import { Base64FilePreview, FilePathPreview } from '../../components/FilePreview';
import { useSelector } from 'react-redux';

export default function AdminRequest() {
  const { user } = useSelector(state => state.auth);
  console.log(user);

  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });

  // Response dialog states
  const [responseDialog, setResponseDialog] = useState({ open: false, request: null });
  const [responseData, setResponseData] = useState({ status: '', reply: '' });
  const [responseLoading, setResponseLoading] = useState(false);

  // Snackbar states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data on component mount
  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRequestsForManager();
      if (response.status) {
        if(user.role === 'admin' || user.role === 'super_admin'){
          setData(response.data || []);
        }else{
          const filteredData = response.data.filter(item => item.managerId === user.id);
          setData(filteredData || []);
        }
      } else {
        console.error('Failed to fetch requests:', response.message);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const filteredData = data.filter(item =>
    !globalFilter ||
    (item.requestTypeName && item.requestTypeName.toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.status && item.status.toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.fileName && item.fileName.toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.employeeName && item.employeeName.toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.employeeEmail && item.employeeEmail.toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.from && new Date(item.from).toLocaleDateString().toLowerCase().includes(globalFilter.toLowerCase())) ||
    (item.to && new Date(item.to).toLocaleDateString().toLowerCase().includes(globalFilter.toLowerCase()))
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'from' || orderBy === 'to' || orderBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleRespond = () => {
    if (selectedItem) {
      setResponseDialog({ open: true, request: selectedItem });
      setResponseData({
        status: selectedItem.status || 'pending',
        reply: selectedItem.reply || ''
      });
    }
    handleMenuClose();
  };

  const handleCloseResponseDialog = () => {
    setResponseDialog({ open: false, request: null });
    setResponseData({ status: '', reply: '' });
  };

  const handleSubmitResponse = async (status = null) => {
    if (!responseDialog.request) return;

    try {
      setResponseLoading(true);
      const finalStatus = status || responseData.status;
      const payload = {
        id: responseDialog.request._id,
        status: finalStatus,
        reply: responseData.reply.trim()
      };

      const response = await apiService.respondRequest(payload);
      if (response.status) {
        await fetchAdminRequests();
        handleCloseResponseDialog();
        setSnackbar({
          open: true,
          message: `Request ${finalStatus} successfully`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to respond to request',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while responding to request',
        severity: 'error'
      });
    } finally {
      setResponseLoading(false);
    }
  };


  const handlePreviewFile = (file) => {
    if (file) {
      // For existing files, we need to create a proper file object
      if (file.filePath) {
        // This is an existing file from database
        setPreviewDialog({ 
          open: true, 
          file: {
            name: file.name,
            filePath: file.filePath,
            type: file.type
          }
        });
      } else {
        // This is a new file being uploaded
        setPreviewDialog({ open: true, file: file });
      }
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'success', icon: <CheckCircleIcon /> };
      case 'rejected':
        return { color: 'error', icon: <CancelIcon /> };
      case 'pending':
      default:
        return { color: 'warning', icon: <CancelIcon /> };
    }
  };

  const getStatusChip = (status) => {
    const { color, icon } = getStatusColor(status);
    return (
      <Chip
        icon={icon}
        label={status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
        size="small"
        color={color}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Material-UI Table */}
              <Box sx={{ p: 2 }}>
                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      Admin Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and respond to employee requests
                    </Typography>
                  </Box>
                  <Box sx={{
                    flex: { xs: '1 1 100%', md: '1 1 auto' },
                    minWidth: { xs: '100%', md: '300px' },
                    maxWidth: { xs: '100%', md: '500px' }
                  }}>
                    <TextField
                      fullWidth
                      placeholder="Search by employee,description"
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                </Box>
                <TableContainer component={Paper} >
                  <Table sx={{ minWidth: 650 }} aria-label="admin requests table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                          <TableSortLabel
                            active={orderBy === 'employeeName'}
                            direction={orderBy === 'employeeName' ? order : 'asc'}
                            onClick={() => handleSort('employeeName')}
                            sx={{ color: 'white', '&:hover': { color: 'white' } }}
                          >
                            Employee
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                          <TableSortLabel
                            active={orderBy === 'requestTypeName'}
                            direction={orderBy === 'requestTypeName' ? order : 'asc'}
                            onClick={() => handleSort('requestTypeName')}
                            sx={{ color: 'white', '&:hover': { color: 'white' } }}
                          >
                            Request Type
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                          <TableSortLabel
                            active={orderBy === 'description'}
                            direction={orderBy === 'description' ? order : 'asc'}
                            onClick={() => handleSort('description')}
                            sx={{ color: 'white', '&:hover': { color: 'white' } }}
                          >
                            Description
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                          <TableSortLabel
                            active={orderBy === 'status'}
                            direction={orderBy === 'status' ? order : 'asc'}
                            onClick={() => handleSort('status')}
                            sx={{ color: 'white', '&:hover': { color: 'white' } }}
                          >
                            Status
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                          <TableSortLabel
                            active={orderBy === 'from'}
                            direction={orderBy === 'from' ? order : 'asc'}
                            onClick={() => handleSort('from')}
                            sx={{ color: 'white', '&:hover': { color: 'white' } }}
                          >
                            From
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                          <TableSortLabel
                            active={orderBy === 'to'}
                            direction={orderBy === 'to' ? order : 'asc'}
                            onClick={() => handleSort('to')}
                            sx={{ color: 'white', '&:hover': { color: 'white' } }}
                          >
                            To
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                          File
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.map((item) => (
                        <TableRow
                          key={item._id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{
                                width: 32,
                                height: 32,
                                bgcolor: theme.palette.primary.main,
                                fontSize: '0.875rem'
                              }}>
                                {(item.employeeName || 'U').charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.employeeName || 'Unknown Employee'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.employeeEmail || 'No email'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.requestTypeName || 'Unknown'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {item.description || 'No description provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(item.status)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight={500} color="text.primary">
                              {item.from ? new Date(item.from).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight={500} color="text.primary">
                              {item.to ? new Date(item.to).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {item.fileName ? (
                              <IconButton
                                onClick={() => handlePreviewFile({ name: item.fileName, filePath: item.filePath, type: 'file' })}
                                size="small"
                                color="primary"
                              >
                                <PreviewIcon />
                              </IconButton>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                No file
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, item)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleRespond}>
          <EditNotifications sx={{ mr: 1 }} />
          Respond to Request
        </MenuItem>
      </Menu>

      {/* Response Dialog */}
      <Dialog open={responseDialog.open} onClose={handleCloseResponseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SettingsIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Respond to Request
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review and approve or reject this request
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseResponseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {responseDialog.request && (
            <Box>
              {/* Request Header Card */}
              <Card sx={{
                mb: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{
                      width: 56,
                      height: 56,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      {(responseDialog.request.employeeName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {responseDialog.request.employeeName || 'Unknown Employee'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {responseDialog.request.employeeEmail || 'No email'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {getStatusChip(responseDialog.request.status)}
                        <Chip
                          label={responseDialog.request.requestTypeName || 'Unknown Type'}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Request Details Grid */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2
                  }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.05),
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
                      }}>
                        {responseDialog.request.description || 'No description provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Request Period
                      </Typography>
                      <Box sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.05),
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
                      }}>
                        <Typography variant="body2" fontWeight={500}>
                          From: {responseDialog.request.from ? new Date(responseDialog.request.from).toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          To: {responseDialog.request.to ? new Date(responseDialog.request.to).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Response Section */}
              <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Your Response
                  </Typography>

                  <TextField
                    fullWidth
                    label="Add a comment or reason for your decision"
                    multiline
                    rows={4}
                    value={responseData.reply}
                    onChange={(e) => setResponseData({ ...responseData, reply: e.target.value })}
                    placeholder="Provide feedback or reasoning for your decision..."
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  {/* Action Buttons */}

                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.grey[50], 0.5)
        }}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={() => handleSubmitResponse('rejected')}
              disabled={responseLoading}
              startIcon={<CancelIcon />}
              sx={{
                minWidth: 140,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              {responseLoading ? 'Processing...' : 'Reject'}
            </Button>

            <Button
              variant="outlined"
              color="warning"
              size="large"
              onClick={() => handleSubmitResponse('pending')}
              disabled={responseLoading}
              startIcon={<CancelIcon />}
              sx={{
                minWidth: 140,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              {responseLoading ? 'Processing...' : 'Keep Pending'}
            </Button>

            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => handleSubmitResponse('approved')}
              disabled={responseLoading}
              startIcon={<CheckCircleIcon />}
              sx={{
                minWidth: 140,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: 2
              }}
            >
              {responseLoading ? 'Processing...' : 'Approve'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      {previewDialog.file?.filePath ? (
        <FilePathPreview
          path={previewDialog.file.filePath}
          fileName={previewDialog.file.name}
          open={previewDialog.open}
          onClose={() => setPreviewDialog({ open: false, file: null })}
        />
      ) : (
        <Base64FilePreview
          base64Data={previewDialog.file?.dataUrl}
          fileName={previewDialog.file?.name}
          open={previewDialog.open}
          onClose={() => setPreviewDialog({ open: false, file: null })}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}