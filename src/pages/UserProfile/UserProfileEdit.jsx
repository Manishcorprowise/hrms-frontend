import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { apiService } from '../../apiservice/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Description as DocumentIcon,
  Brightness4,
  Brightness7,
  CloudUpload,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../theme/ThemeProvider';
import FileUpload from '../../components/FileUpload';
import { useSelector } from 'react-redux';

const UserProfileEdit = ({ onSave, onCancel, initialData, targetUserId = null }) => {
  const [expandedSections, setExpandedSections] = useState({
    employment: true,
    personal: true,
    education: false,
    documents: false,
    account: false
  });
  
  // File management state
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSelector(state => state.auth);
  // File management functions
  const fetchUserFiles = async (userId) => {
    try {
      setLoading(true);
      const response = await apiService.getUserFiles(userId);
      setUserFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSuccess = (newFile) => {
    setUserFiles(prev => [newFile, ...prev]);
  };

  const handleFileDelete = (fileId) => {
    setUserFiles(prev => prev.filter(file => file._id !== fileId));
  };

  const handleFilePreview = (file) => {
    // Handle file preview
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      // Employment Details
      employeeName: initialData?.employment?.employeeName || '',
      employeeId: initialData?.employment?.employeeId || '',
      email: initialData?.employment?.email || '',
      phone: initialData?.employment?.phone || '',
      joiningDate: initialData?.employment?.joiningDate || '',
      position: initialData?.employment?.position || '',
      manager: initialData?.employment?.manager || '',

      // Personal Details
      dateOfBirth: initialData?.personal?.dateOfBirth || '',
      nationality: initialData?.personal?.nationality || '',
      maritalStatus: initialData?.personal?.maritalStatus || '',
      placeOfBirth: initialData?.personal?.placeOfBirth || '',
      residentialStatus: initialData?.personal?.residentialStatus || '',
      fatherName: initialData?.personal?.fatherName || '',
      height: initialData?.personal?.height || '',
      weight: initialData?.personal?.weight || '',
      identificationMark: initialData?.personal?.identificationMark || '',
      hobby: initialData?.personal?.hobby || '',
      address: initialData?.personal?.address || '',

      // Education
      education: initialData?.education || [
        { id: 'edu-1', qualification: '', specialization: '', institution: '', board: '', startDate: '', endDate: '', grade: '', modeOfStudy: 'Full-time', country: '', status: 'Completed' }
      ],

      // Account Details
      bankAccountNumber: initialData?.account?.bankAccountNumber || '',
      bankIFSC: initialData?.account?.bankIFSC || '',
      beneficiaryName: initialData?.account?.beneficiaryName || '',

    }
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  });

  // Load files when component mounts
  useEffect(() => {
    const userId = targetUserId || user?.id;
    if (userId) {
      fetchUserFiles(userId);
    }
  }, [user?.id, targetUserId]);


  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addEducation = useCallback(() => {
    const newId = `edu-${Date.now()}`;
    appendEducation({ 
      id: newId, 
      qualification: '', 
      specialization: '', 
      institution: '', 
      board: '', 
      startDate: '', 
      endDate: '', 
      grade: '', 
      modeOfStudy: 'Full-time', 
      country: '', 
      status: 'Completed' 
    });
  }, [appendEducation]);


  const onSubmit = (data) => {
    // Format data according to parent component structure
    const formattedData = {
      employment: {
        employeeName: data.employeeName,
        employeeId: data.employeeId,
        email: data.email,
        phone: data.phone,
        joiningDate: data.joiningDate,
        position: data.position,
        manager: data.manager
      },
      personal: {
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        placeOfBirth: data.placeOfBirth,
        residentialStatus: data.residentialStatus,
        fatherName: data.fatherName,
        height: data.height,
        weight: data.weight,
        identificationMark: data.identificationMark,
        hobby: data.hobby,
        address: data.address
      },
      education: data.education || [],
      account: {
        bankAccountNumber: data.bankAccountNumber,
        bankIFSC: data.bankIFSC,
        beneficiaryName: data.beneficiaryName
      }
    };
    
    onSave(formattedData);
  };

  const FormCard = ({ title, children, icon, isExpanded, onToggle }) => (
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
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      backgroundColor: 'background.default', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={4}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="h4" 
          fontWeight={600}
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            mb: { xs: 1, sm: 0 }
          }}
        >
          Update Profile
        </Typography>
        <Stack 
          direction="row" 
          spacing={{ xs: 1, sm: 2 }} 
          alignItems="center"
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-end', sm: 'flex-start' }
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            sx={{ 
              px: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit(onSubmit)}
            sx={{ 
              px: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Employment Details */}
        <FormCard
          title="Employment Details"
          icon={<WorkIcon color="primary" />}
          isExpanded={expandedSections.employment}
          onToggle={() => handleSectionToggle('employment')}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="employeeName"
                control={control}
                rules={{ required: 'Employee name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Employee Name"
                    error={!!errors.employeeName}
                    helperText={errors.employeeName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="employeeId"
                control={control}
                rules={{ required: 'Employee ID is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Employee ID"
                    error={!!errors.employeeId}
                    helperText={errors.employeeId?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="joiningDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Joining Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Position/Job Title"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="manager"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Manager"
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormCard>

        {/* Personal Details */}
        <FormCard
          title="Personal Details"
          icon={<PersonIcon color="primary" />}
          isExpanded={expandedSections.personal}
          onToggle={() => handleSectionToggle('personal')}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nationality"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ minWidth: 120 }}>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Marital Status</InputLabel>
                    <Select {...field} label="Marital Status">
                      <MenuItem value="Single">Single</MenuItem>
                      <MenuItem value="Married">Married</MenuItem>
                      <MenuItem value="Divorced">Divorced</MenuItem>
                      <MenuItem value="Widowed">Widowed</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="placeOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Place of Birth"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ minWidth: 120 }}>
              <Controller
                name="residentialStatus"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Residential Status</InputLabel>
                    <Select {...field} label="Residential Status">
                      <MenuItem value="Citizen">Citizen</MenuItem>
                      <MenuItem value="Permanent Resident">Permanent Resident</MenuItem>
                      <MenuItem value="Work Visa">Work Visa</MenuItem>
                      <MenuItem value="Student Visa">Student Visa</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="fatherName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Father Name"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Height"
                    placeholder="e.g., 5'10\"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Weight"
                    placeholder="e.g., 75 kg"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="identificationMark"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Identification Mark"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="hobby"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Hobby"
                    placeholder="e.g., Photography, Reading"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    placeholder="Enter your complete address"
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormCard>


        {/* Education Details */}
        <FormCard
          title="Education Details"
          icon={<SchoolIcon color="primary" />}
          isExpanded={expandedSections.education}
          onToggle={() => handleSectionToggle('education')}
        >
          {educationFields?.map((edu, index) => (
            <Paper key={edu.id} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Education {index + 1}
                </Typography>
                {educationFields.length > 1 && (
                  <IconButton onClick={() => removeEducation(index)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.qualification`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Qualification/Degree"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.specialization`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Specialization/Major"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.institution`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Institution/University"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.board`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Board/Council"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.startDate`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.endDate`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.grade`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Grade/Percentage"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ minWidth: 120 }}>
                  <Controller
                    name={`education.${index}.modeOfStudy`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Mode of Study</InputLabel>
                        <Select {...field} label="Mode of Study">
                          <MenuItem value="Full-time">Full-time</MenuItem>
                          <MenuItem value="Part-time">Part-time</MenuItem>
                          <MenuItem value="Distance">Distance</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`education.${index}.country`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Country/Location"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ minWidth: 120 }}>
                  <Controller
                    name={`education.${index}.status`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="Ongoing">Ongoing</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addEducation}
            sx={{ mt: 1 }}
          >
            Add Education
          </Button>
        </FormCard>

        {/* Account Details */}
        <FormCard
          title="Account Details"
          icon={<AccountBalanceIcon color="primary" />}
          isExpanded={expandedSections.account}
          onToggle={() => handleSectionToggle('account')}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bankAccountNumber"
                control={control}
                rules={{ 
                  required: 'Bank Account Number is required',
                  pattern: {
                    value: /^[0-9]{9,18}$/,
                    message: 'Please enter a valid account number (9-18 digits)'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Account Number"
                    placeholder="Enter your bank account number"
                    error={!!errors.bankAccountNumber}
                    helperText={errors.bankAccountNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bankIFSC"
                control={control}
                rules={{ 
                  required: 'Bank IFSC is required',
                  pattern: {
                    value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                    message: 'Please enter a valid IFSC code (e.g., SBIN0001234)'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank IFSC Code"
                    placeholder="e.g., SBIN0001234"
                    error={!!errors.bankIFSC}
                    helperText={errors.bankIFSC?.message}
                    sx={{ textTransform: 'uppercase' }}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="beneficiaryName"
                control={control}
                rules={{ 
                  required: 'Beneficiary Name is required',
                  minLength: {
                    value: 2,
                    message: 'Beneficiary name must be at least 2 characters'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Beneficiary Name"
                    placeholder="Enter the account holder's name"
                    error={!!errors.beneficiaryName}
                    helperText={errors.beneficiaryName?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormCard>

        {/* Document Upload & Management */}
        <FormCard
          title="Document Upload & Management"
          icon={<CloudUpload color="primary" />}
          isExpanded={expandedSections.documents}
          onToggle={() => handleSectionToggle('documents')}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FileUpload
              employeeId={targetUserId || user?.id}
              onUploadSuccess={handleFileUploadSuccess}
              onUploadError={(error) => setError(error.message)}
              existingFiles={userFiles}
              onFileDelete={handleFileDelete}
              onFilePreview={handleFilePreview}
              maxFiles={10}
              allowedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx']}
              category="personal"
            />
          )}
        </FormCard>
      </form>
    </Box>
  );
};

export default UserProfileEdit;
