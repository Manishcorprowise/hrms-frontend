import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import { hrmsConfig } from '../../../apiservice/apiConfig';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  FormHelperText
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
const userDetails = {
  firstname: "",
  lastname: "",
  email: "",
  mobile: "",
  position_code: "",
  role_code: "",
};

export const UserMasterFrom = ({
  open,
  onClose,
  dataToEdit = null,
}) => {
  console.log('HRMS Key:', hrmsConfig.hrmsKey);
  
  // Check if HRMS key is available
  if (!hrmsConfig.hrmsKey) {
    console.error('VITE_HRMS_KEY environment variable is not set!');
    console.error('Please create a .env file in your project root with: VITE_HRMS_KEY=your_key_here');
  }
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: userDetails
  });
  const role_code = watch('role_code') || ""
  const position_code = watch('position_code') || ""
  const [positionCodes, setPositionCodes] = useState([]);
  const [roleCodes, setRoleCodes] = useState([]);
  const apiURLs = "http://localhost:4200"
  useEffect(() => {
    fetchRoleCodes();
  }, []);

  // Populate form when dataToEdit changes
  useEffect(() => {
    if (dataToEdit) {
      // Split employeeName into first and last name
      const nameParts = dataToEdit.employeeName?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      reset({
        firstname: firstName,
        lastname: lastName,
        email: dataToEdit.email || '',
        mobile: dataToEdit.phone || '',
        position_code: dataToEdit.position || '',
        role_code: dataToEdit.role || '',
      });
    } else {
      reset(userDetails);
    }
  }, [dataToEdit, reset]);

  useEffect(() => {
    if (role_code) {
      fetchPositionCodes();
    } 
  }, [role_code]);


  const fetchRoleCodes = async () => {
    try {
      const response = await axios.get(`${apiURLs}/api/role/hrms`, {
        headers: {
          'hrms_key': hrmsConfig.hrmsKey
        }
      });
      if (response.status === 200) {
        setRoleCodes(response.data.data?.map(el => ({
          value: el.roleCode,
          label: `${el.roleCode} - ${el.roleName}`
        })));
      }
    } catch (error) {
      console.error("Error fetching role codes:", error);
    }
  };




  const fetchPositionCodes = async () => {
    try {
      const response = await axios.get(`${apiURLs}/api/position/hrms?role_code=${role_code}`, {
        headers: {
          'hrms_key': hrmsConfig.hrmsKey
        }
      });
      if (response.status) {
        setPositionCodes(response.data.data.map(el => ({
          value: el.positionCode,
          label: `${el.positionCode} - ${el.positionName}`
        })));
      }
    } catch (error) {
      console.error("Error fetching position code:", error);
    }
  };



  const onSubmit = async (data) => {
    try {
      if (!hrmsConfig.hrmsKey) {
        console.error('Cannot submit: HRMS key is not configured');
        alert('HRMS key is not configured. Please check your environment variables.');
        return;
      }

      const response = await axios.post(`${apiURLs}/api/user/hrms`,data, {
        headers: {
          'hrms_key': hrmsConfig.hrmsKey
        },
      });
      console.log(response);
      if (response.status === 200) {
        try {
          response = await apiService.updateEmployee(dataToEdit._id, {kadCred:true});
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      }

    } catch (error) {
      console.log(error);
    }
  };
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '56px',
      width: "100%",
      borderRadius: '4px',
      borderColor: state.isFocused ? '#1976d2' : '#e0e0e0',
      boxShadow: state.isFocused ? '0 0 0 1px #1976d2' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#1976d2' : '#80bdff'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 100
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999'
    })
  };


  return (
    <Dialog
      open={open}
      // onClose={onClose}
      fullWidth={true}
      maxWidth={"md"}
      sx={{ zIndex: 5 }}
    >
      <DialogTitle sx={{ p: 0, mb: 2 }}>
        <Box sx={{ 
          backgroundColor: '#f8f9fa', 
          padding: 2, 
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 600,
          fontSize: '1.1rem'
        }}>
          Generate Kad Credentials
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Role and Position - Editable fields */}
          

          {/* Read-only fields when editing */}
          <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.role_code}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Role <span style={{ color: '#f44336' }}>*</span>
              </Typography>
              <Controller
                name="role_code"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={roleCodes}
                    value={roleCodes.find(
                      (option) => option.value === role_code
                    ) || role_code}
                    placeholder="Select Role"
                    styles={selectStyles}
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.value);
                      setPositionCodes([]);
                      setValue("position_code", "");
                    }}
                  />
                )}
              />
              {errors.role_code && (
                <FormHelperText>{errors.role_code.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth error={!!errors.position_code}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Position <span style={{ color: '#f44336' }}>*</span>
              </Typography>
              <Controller
                name="position_code"
                control={control}
                rules={{ required: "Position is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={positionCodes}
                    value={positionCodes.find(
                      (option) => option.value === position_code
                    ) || position_code}
                    placeholder="Select Position"
                    styles={selectStyles}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                  />
                )}
              />
              {errors.position_code && (
                <FormHelperText>{errors.position_code.message}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              placeholder="First Name"
              error={!!errors.firstname}
              helperText={errors.firstname?.message}
              {...register("firstname", {
                required: "First Name is required",
              })}
              required
              InputProps={{
                readOnly: !!dataToEdit,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                }
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              placeholder="Last Name"
              error={!!errors.lastname}
              helperText={errors.lastname?.message}
              {...register("lastname", {
                required: "Last Name is required",
              })}
              required
              InputProps={{
                readOnly: !!dataToEdit,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                }
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Email"
              placeholder="Email Id"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              required
              InputProps={{
                readOnly: !!dataToEdit,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                }
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Mobile Number"
              placeholder="Fill 10 digit number"
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
              {...register("mobile", {
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit cell number",
                },
              })}
              required
              InputProps={{
                readOnly: !!dataToEdit,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#f0f3f6" }}>
        <Button size="small" variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button size="small" variant="contained" onClick={handleSubmit(onSubmit)}>
          {dataToEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
