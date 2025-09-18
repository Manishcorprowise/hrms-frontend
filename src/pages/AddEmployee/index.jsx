import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Grid,
  Alert,
  Snackbar,
  Slide,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  InputLabel,
  Switch,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { apiService } from "../../apiservice/api";
import { useSelector } from "react-redux";

export default function AddEmployee({ open, onClose, onSave, employees = [], editingEmployee = null }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useSelector(state => state.auth);
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      employeeName: editingEmployee?.employeeName || '',
      employeeNumber: editingEmployee?.employeeNumber || '',
      dateOfJoining: editingEmployee?.dateOfJoining ? editingEmployee.dateOfJoining.split('T')[0] : '',
      email: editingEmployee?.email || '',
      phone: editingEmployee?.phone || '',
      position: editingEmployee?.position || '',
      role: editingEmployee?.role || '',
      department: editingEmployee?.department || '',
      manager: editingEmployee?.manager || '',
      isActive: editingEmployee?.isActive !== undefined ? editingEmployee.isActive : true,
      endDate: editingEmployee?.endDate ? editingEmployee.endDate.split('T')[0] : '',
      managerId: editingEmployee?.managerId || '',
    },
  });

  // Reset form when editingEmployee changes
  React.useEffect(() => {
    if (editingEmployee) {
      reset({
        employeeName: editingEmployee.employeeName || '',
        employeeNumber: editingEmployee.employeeNumber || '',
        dateOfJoining: editingEmployee.dateOfJoining ? editingEmployee.dateOfJoining.split('T')[0] : '',
        email: editingEmployee.email || '',
        phone: editingEmployee.phone || '',
        position: editingEmployee.position || '',
        role: editingEmployee.role || '',
        department: editingEmployee.department || '',
        manager: editingEmployee.manager || '',
        isActive: editingEmployee.isActive !== undefined ? editingEmployee.isActive : true,
        endDate: editingEmployee.endDate ? editingEmployee.endDate.split('T')[0] : '',
        managerId: editingEmployee.managerId || (typeof editingEmployee.manager === 'string' && editingEmployee.manager ? employees.find(emp => emp.employeeName === editingEmployee.manager)?._id || '' : ''),
      });
    } else {
      reset({
        employeeName: '',
        employeeNumber: '',
        dateOfJoining: '',
        email: '',
        phone: '',
        position: '',
        role: '',
        department: '',
        manager: '',
        isActive: true,
        endDate: '',
        managerId: '',
      });
    }
  }, [editingEmployee, reset]);

  // Watch the isActive field to show/hide end date
  const isActive = watch('isActive');

  const onSubmit = async (data) => {
    try {
      const isValid = await trigger();
      if (!isValid) {
        setErrorMessage('Please fill in all required fields correctly');
        setShowError(true);
        return;
      }
      
      // Transform the data for API submission
      const submitData = {
        ...data,
        manager: data.managerId, // Send managerId as manager field
        managerId: undefined // Remove managerId field
      };
      delete submitData.managerId; // Clean up the managerId field
      
      let response;
      if (editingEmployee) {
        // Update existing employee
        response = await apiService.updateEmployee(editingEmployee._id, submitData);
      } else {
        // Create new employee
        response = await apiService.createEmployee(submitData);
      }
      
      if (response && response.message) {
        setShowSuccess(true);
        onSave?.(data);
      } else {
        throw new Error(`Failed to ${editingEmployee ? 'update' : 'create'} employee`);
      }
      setTimeout(() => {
        reset();
        onClose?.();
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving employee:", error);
      setErrorMessage(`Failed to ${editingEmployee ? 'update' : 'save'} employee. Please try again.`);
      setShowError(true);
    }
  };

  const handleClose = () => {
    reset();
    setShowError(false);
    setShowSuccess(false);
    onClose?.();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: "bold",
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2,
            px: 2,

          }}
        >
          <PersonAddIcon sx={{ fontSize: 20 }} />
          <Typography >
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </DialogTitle>

        {/* Body */}
        <DialogContent dividers>
          <Box
            component="form"
            id="employee-form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
          >
            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
              <Alert 
                severity="error" 
                icon={<ErrorIcon />}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                Please fill in all required fields correctly
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Employee Name */}
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
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Employee Number */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="employeeNumber"
                  control={control}
                  rules={{ required: 'Employee number is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Employee ID"
                      error={!!errors.employeeNumber}
                      helperText={errors.employeeNumber?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      label="Email Address"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Date of Joining */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateOfJoining"
                  control={control}
                  rules={{ required: 'Date of joining is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Date of Joining"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfJoining}
                      helperText={errors.dateOfJoining?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>


              {/* Position */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="position"
                  control={control}
                  rules={{ required: 'Position is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Position/Job Title"
                      error={!!errors.position}
                      helperText={errors.position?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.role}>
                  <FormLabel component="legend">Select Role:</FormLabel>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Please select a role" }}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        {user.role === 'super_admin' && <FormControlLabel value="admin" control={<Radio />} label="Admin" />}
                        <FormControlLabel value="manager" control={<Radio />} label="Manager" />
                        <FormControlLabel value="employee" control={<Radio />} label="Employee" />
                      </RadioGroup>
                    )}
                  />
                  {errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.role.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Manager Selection */}
              <Grid item xs={12} sm={6} sx={{ minWidth: 160 }}>
                <Controller
                  name="managerId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.managerId} variant="outlined">
                      <InputLabel>Select Manager</InputLabel>
                      <Select
                        {...field}
                        value={typeof field.value === 'object' ? field.value?._id || '' : field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        label="Select Manager"
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

                          
                          // First try to find by ID
                          const selectedEmployee = employees.find(emp => emp._id === selected);
                          if (selectedEmployee) {
                            return selectedEmployee.employeeName;
                          }
                          
                          // If not found by ID, try to find by name (for backward compatibility)
                          const selectedByName = employees.find(emp => emp.employeeName === selected);
                          if (selectedByName) {
                            return selectedByName.employeeName;
                          }
                          
                          // If still not found, return the selected value
                          return selected;
                        }}
                      >
                        <MenuItem value="">
                          <em>No Manager</em>
                        </MenuItem>
                        {employees
                          .filter(emp => emp.isActive && emp.role !== 'employee')
                          .map((employee) => (
                            <MenuItem key={employee._id} value={employee._id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {employee.employeeName.split(' ').map(n => n[0]).join('')}
                                </Box>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {employee.employeeName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {employee.position} • {employee.role}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.managerId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                          {errors.managerId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Department"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Active Status Toggle */}
              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Employee Status
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {field.value ? 'Employee is active and can access the system' : 'Employee is inactive and cannot access the system'}
                        </Typography>
                      </Box>
                      <MuiFormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="primary"
                            size="medium"
                          />
                        }
                        label={field.value ? 'Active' : 'Inactive'}
                        labelPlacement="start"
                        sx={{ m: 0 }}
                      />
                    </Box>
                  )}
                />
              </Grid>

              {/* End Date - Show only when isActive is false */}
              {!isActive && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ 
                      required: !isActive ? 'End date is required when employee is inactive' : false 
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="date"
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 1, gap: 1 }}>
          <Button 
            onClick={handleClose}
            disabled={isSubmitting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="employee-form" 
            variant="contained"
            disabled={isSubmitting}
            startIcon={<PersonAddIcon />}
          >
            {isSubmitting ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          Employee added successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          icon={<ErrorIcon />}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}