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
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { apiService } from "../../apiservice/api";
import { useSelector } from "react-redux";

export default function AddEmployee({ open, onClose, onSave }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useSelector(state => state.auth);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      employeeName: '',
      employeeNumber: '',
      dateOfJoining: '',
      email: '',
      phone: '',
      position: '',
      role: '',
      department: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Validate all fields before submission
      const isValid = await trigger();
      if (!isValid) {
        setErrorMessage('Please fill in all required fields correctly');
        setShowError(true);
        return;
      }

      console.log("Employee Data:", data);
      const response = await apiService.createEmployee(data);
      console.log("Response:", response);
      
      if (response && response.message) {
        setShowSuccess(true);
        onSave?.(data);
      } else {
        throw new Error('Failed to create employee');
      }
      
      // Close dialog after success
      setTimeout(() => {
        reset();
        onClose?.();
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving employee:", error);
      setErrorMessage('Failed to save employee. Please try again.');
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
            Add New Employee
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
            {isSubmitting ? 'Saving...' : 'Add Employee'}
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