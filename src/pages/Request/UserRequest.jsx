import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    Stack,
    Avatar,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    OutlinedInput,
    Chip,
    Tooltip,
    Fab,
    useTheme,
    alpha,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TableSortLabel,
    Menu,
    MenuItem,
    Select,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Controller } from 'react-hook-form';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Settings as SettingsIcon,
    MoreVert as MoreVertIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteFileIcon,
    Visibility as PreviewIcon,
    Close as CloseIcon,
    Image as ImageIcon,
    Description as DescriptionIcon,
    PictureAsPdf as PdfIcon,
    InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { apiService } from '../../apiservice/api';
import { Base64FilePreview, FilePathPreview } from '../../components/FilePreview';

export default function UserRequest() {
    const theme = useTheme();
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ 
        requestTypeCode: '', 
        description: '', 
        from: null, 
        to: null, 
        file: '', 
        fileName: '' 
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // File upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
    const fileInputRef = useRef(null);

    // Table pagination and sorting states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [requestOptions, setRequestOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    // Fetch types data on component mount
    useEffect(() => {
        fetchUserRequest();
        fetchRequestOptions();
    }, []);

    const fetchRequestOptions = async () => {
        if (loadingOptions) return; // Prevent multiple calls
        
        try {
            setLoadingOptions(true);
            const response = await apiService.getOptionByTypeCodes(2);
            if (response && response.status) {
                setRequestOptions(response.data || []);
            } else {
                console.warn('No request options available');
                setRequestOptions([]);
            }
        }
        catch (error) {
            console.error('Error fetching request types:', error);
            setRequestOptions([]);
        }
        finally {
            setLoadingOptions(false);
        }
    }

    const fetchUserRequest = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUserRequest();
            if (response.status) {
                setData(response.data || []);
            } else {
                console.error('Failed to fetch types:', response.message);
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };
    // Table handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const handleMenuClick = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };
    const handleEdit = () => {
        if (selectedItem) {
            setEditingItem(selectedItem);
            setFormData({ 
                requestTypeCode: selectedItem.requestTypeCode || '', 
                description: selectedItem.description || '', 
                from: selectedItem.from ? new Date(selectedItem.from) : null, 
                to: selectedItem.to ? new Date(selectedItem.to) : null, 
                file: selectedItem.file || '', 
                fileName: selectedItem.fileName || '' 
            });
            
            // Load existing file information if available
            if (selectedItem.fileName && selectedItem.filePath) {
                setSelectedFile({
                    name: selectedItem.fileName,
                    filePath: selectedItem.filePath,
                    type: selectedItem.fileName.split('.').pop().toLowerCase(),
                    size: 0 // We don't have size info from database
                });
                setFilePreview(null); // No preview for existing files in edit mode
            } else {
                setSelectedFile(null);
                setFilePreview(null);
            }
            
            setErrors({});
            setDialogOpen(true);
        }
        handleMenuClose();
    };
    const handleDelete = async () => {
        if (selectedItem && window.confirm('Are you sure you want to delete this type?')) {
            try {
                setLoading(true);
                const response = await apiService.deleteType({ id: selectedItem._id });

                if (response.status) {
                    await fetchUserRequest();
                } else {
                    console.error('Failed to delete type:', response.message);
                    alert(response.message || 'Failed to delete type');
                }
            } catch (error) {
                console.error('Error deleting type:', error);
                alert('An error occurred while deleting the type');
            } finally {
                setLoading(false);
            }
        }
        handleMenuClose();
    };
    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({ requestTypeCode: '', description: '', from: null, to: null, file: '', fileName: '' });
        setSelectedFile(null);
        setFilePreview(null);
        setErrors({});
        setDialogOpen(true);
    };
    // File upload handlers
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {         
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setSelectedFile({
                    ...file,
                    dataUrl: reader.result
                });
                setFormData(prev => ({ ...prev, fileName: file.name }));
                
                // Create preview for images
                if (file.type && file.type.startsWith('image/')) {
                    setFilePreview(reader.result);
                } else {
                    setFilePreview(null);
                }
            };
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setFormData(prev => ({ ...prev, file: '', fileName: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

    const getFileIcon = (fileType) => {
        if (!fileType) return <FileIcon />;
        if (fileType.startsWith('image/')) return <ImageIcon />;
        if (fileType === 'application/pdf') return <PdfIcon />;
        if (fileType.includes('document') || fileType.includes('text')) return <DescriptionIcon />;
        return <FileIcon />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSave = async () => {
        // Clear previous errors
        setErrors({});

        // Validate required fields
        const newErrors = {};
        if (!formData.requestTypeCode) {
            newErrors.requestTypeCode = 'Request type code is required';
        }

        // If there are errors, set them and return
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSaving(true);
            const payload = {
                requestTypeCode: formData.requestTypeCode,
                description: formData.description.trim(),
                from: formData.from ? formData.from.toISOString() : '',
                to: formData.to ? formData.to.toISOString() : '',
                file: selectedFile ? selectedFile.dataUrl : '',
                fileName: formData.fileName || (selectedFile ? selectedFile.name : '')
            };
            let response;
            if (editingItem) {
                // Update existing item
                response = await apiService.updateRequest({
                    id: editingItem._id,
                    ...payload
                });
            } else {
                // Add new item
                response = await apiService.createRequest(payload);
            }

            if (response.status) {
                // Refresh data after successful operation
                await fetchUserRequest();
                setDialogOpen(false);
                setFormData({ requestTypeCode: '', description: '', from: null, to: null, file: '', fileName: '' });
                setSelectedFile(null);
                setFilePreview(null);
                setEditingItem(null);
                setErrors({});
            } else {
                console.error('Failed to save request:', response.message);
                alert(response.message || 'Failed to save type');
            }
        } catch (error) {
            console.error('Error saving request:', error);
            alert('An error occurred while saving the type');
        } finally {
            setSaving(false);
        }
    };

    // Filter and sort data
    const filteredData = data.filter(item =>
        !globalFilter ||
        (item.requestTypeName && item.requestTypeName.toLowerCase().includes(globalFilter.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(globalFilter.toLowerCase())) ||
        (item.status && item.status.toLowerCase().includes(globalFilter.toLowerCase())) ||
        (item.fileName && item.fileName.toLowerCase().includes(globalFilter.toLowerCase())) ||
        (item.from && new Date(item.from).toLocaleDateString().toLowerCase().includes(globalFilter.toLowerCase())) ||
        (item.to && new Date(item.to).toLocaleDateString().toLowerCase().includes(globalFilter.toLowerCase()))
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!orderBy) return 0;

        let aValue = a[orderBy];
        let bValue = b[orderBy];

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (order === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const paginatedData = sortedData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading requests...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header Section with Search */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: { xs: 'wrap', md: 'nowrap' }
                    }}>
                        {/* Left Section - Title */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            minWidth: { xs: '100%', md: 'auto' },
                            flex: { xs: '1 1 100%', md: '0 0 auto' }
                        }}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    width: 56,
                                    height: 56,
                                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                }}
                            >
                                <SettingsIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="primary">
                                    My Requests
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Manage requests
                                </Typography>
                            </Box>
                        </Box>

                        {/* Center Section - Search */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '1 1 auto' },
                            minWidth: { xs: '100%', md: '300px' },
                            maxWidth: { xs: '100%', md: '500px' }
                        }}>
                            <TextField
                                fullWidth
                                placeholder="Search by type, description, status, file name, dates..."
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
                                        bgcolor: 'background.paper',
                                    }
                                }}
                            />
                        </Box>

                        {/* Right Section - Button */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            minWidth: { xs: '100%', md: 'auto' },
                            flex: { xs: '1 1 100%', md: '0 0 auto' }
                        }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddNew}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4,
                                    }
                                }}
                            >
                                Add New
                            </Button>
                        </Box>
                    </Box>
                </CardContent>


                {/* Material-UI Table */}
                <Box sx={{ p: 2 }}>
                    <TableContainer component={Paper} >
                        <Table sx={{ minWidth: 650 }} aria-label="types table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
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
                                            <Chip
                                                label={item.status || 'Unknown'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    bgcolor: item.status === 'pending' 
                                                        ? alpha(theme.palette.warning.main, 0.1)
                                                        : item.status === 'approved'
                                                        ? alpha(theme.palette.success.main, 0.1)
                                                        : alpha(theme.palette.error.main, 0.1),
                                                    color: item.status === 'pending' 
                                                        ? theme.palette.warning.main
                                                        : item.status === 'approved'
                                                        ? theme.palette.success.main
                                                        : theme.palette.error.main,
                                                    border: `1px solid ${
                                                        item.status === 'pending' 
                                                            ? alpha(theme.palette.warning.main, 0.2)
                                                            : item.status === 'approved'
                                                            ? alpha(theme.palette.success.main, 0.2)
                                                            : alpha(theme.palette.error.main, 0.2)
                                                    }`
                                                }}
                                            />
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
                        sx={{ mt: 2 }}
                    />
                </Box>
            </Card>
            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: 4,
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            width: 40,
                            height: 40
                        }}>
                            <SettingsIcon sx={{ color: theme.palette.primary.main }} />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} color="primary">
                            {editingItem ? 'Edit Request' : 'Add New Request'}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {/* Request Type Code Dropdown */}
                        <FormControl fullWidth error={!!errors.requestTypeCode}>
                            <InputLabel>Request Type</InputLabel>
                            <Select
                                value={formData.requestTypeCode || ''}
                                onChange={(e) => setFormData({ ...formData, requestTypeCode: e.target.value })}
                                label="Request Type"
                                displayEmpty
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0, 0, 0, 0.23)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0, 0, 0, 0.87)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgb(33, 44, 101)',
                                        borderWidth: 2,
                                    },
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return '';
                                    const selectedOption = requestOptions.find(option => 
                                        option.code == selected || 
                                        option.id == selected || 
                                        option._id == selected ||
                                        option.name == selected
                                    );
                                    return selectedOption ? selectedOption.name : selected;
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select Request Type</em>
                                </MenuItem>
                                {requestOptions.map((option) => {
                                    // Use code if available, otherwise use id, _id, or name as fallback
                                    const optionValue = option.code || option.id || option._id || option.name;
                                    return (
                                        <MenuItem key={option._id || option.id || option.name} value={optionValue}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'secondary.main',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {(option.name || 'U').charAt(0).toUpperCase()}
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {option.name || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Code: {option.code}
                                                    </Typography>
                                                    {option.description && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {option.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                            {errors.requestTypeCode && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                    {errors.requestTypeCode}
                                </Typography>
                            )}
                        </FormControl>

                        {/* Description Field */}
                        <FormControl fullWidth>
                            <InputLabel htmlFor="description">Description</InputLabel>
                            <OutlinedInput
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                label="Description"
                                multiline
                                rows={3}
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: theme.palette.primary.main,
                                        },
                                    },
                                }}
                            />
                        </FormControl>

                        {/* From Date Time Field */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="From Date & Time"
                                value={formData.from}
                                onChange={(newValue) => setFormData({ ...formData, from: newValue })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        sx={{
                                            borderRadius: 2,
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            },
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>

                        {/* To Date Time Field */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="To Date & Time"
                                value={formData.to}
                                onChange={(newValue) => setFormData({ ...formData, to: newValue })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        sx={{
                                            borderRadius: 2,
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            },
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>

                        {/* File Upload Section */}
                        <Box>
                            
                            <InputLabel>Attach File (Optional)</InputLabel>
                            
                            {!selectedFile ? (
                                <Box
                                    sx={{
                                        border: `2px dashed ${theme.palette.grey[300]}`,
                                        borderRadius: 2,
                                        p: 1,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                        }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <CloudUploadIcon sx={{ fontSize: 25, color: 'text.secondary', }} />
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        Click to upload a file
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Supports: Images, PDF, Documents
                                    </Typography>
                                </Box>
                            ) : (
                                <Card sx={{ p: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ color: theme.palette.primary.main }}>
                                            {getFileIcon(selectedFile.type)}
                                        </Box>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="body1" fontWeight={500} noWrap>
                                                {selectedFile.name || 'Unknown file'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatFileSize(selectedFile.size || 0)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {/* Show preview button for existing files or files with preview */}
                                            {(filePreview || selectedFile.filePath) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handlePreviewFile(selectedFile)}
                                                    color="primary"
                                                >
                                                    <PreviewIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={handleRemoveFile}
                                                color="error"
                                            >
                                                <DeleteFileIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    {filePreview && (
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '8px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Card>
                            )}
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,application/pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{
                    p: 3,
                    gap: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.action.hover, 0.02)
                }}>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 2,
                            '&:hover': {
                                boxShadow: 4,
                            }
                        }}
                    >
                        {saving ? 'Saving...' : (editingItem ? 'Update' : 'Save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* File Preview Dialog */}
            <FilePathPreview
                path={previewDialog.file?.filePath}
                fileName={previewDialog.file?.name}
                open={previewDialog.open}
                onClose={() => setPreviewDialog({ open: false, file: null })}
            />

        </Box>
    );
}