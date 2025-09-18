import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  Business,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { loginUser, clearError } from '../store/authSlice';
import KADLogo from '../assets/KAD_Logo.png';

export default function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, isLoading, error } = useSelector(state => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();

      if (result.success) {
        // Check if user has temporary password
        if (result.user && result.user.isTemPassword) {
          // Redirect to change password page if user has temporary password
          navigate('/change-password', { replace: true });
        } else {
          // Normal redirect to intended page or dashboard
          const from = location.state?.from?.pathname || '/profile';
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      // Error is handled by Redux
      console.error('Login failed:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, rgb(33, 44, 101) 0%, rgb(25, 35, 85) 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper
          elevation={24}
          sx={{
            display: 'flex',
            width: '100%',
            minHeight: isMobile ? 'auto' : '600px',
            borderRadius: 3,
            overflow: 'hidden',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* Left Section - Branding */}
          <Box
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, rgb(33, 44, 101) 0%, rgb(25, 35, 85) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              color: 'white',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.1,
              },
            }}
          >
            <Box sx={{ textAlign: 'center', zIndex: 1 }}>
              <Box
                component="img"
                src={KADLogo}
                alt="Company Logo"
                sx={{
                  height: 50,
                  width: 'auto',
                  mb: 2,
                  opacity: 0.9,
                  maxWidth: '100%',
                  backgroundColor: 'white',
                  padding: 1,
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              {/* <Box><Business sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} /></Box> */}
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                HRMS
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                Human Resource Management System
              </Typography>

            </Box>
          </Box>

          {/* Right Section - Login Form */}
          <Box
            sx={{
              flex: 1,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                Welcome
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Sign in to your account to continue
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      sx={{ mb: 3 }}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={{ mb: 3 }}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{
                    py: 1.5,
                    mb: 3,
                    background: 'linear-gradient(135deg, rgb(33, 44, 101) 0%, rgb(25, 35, 85) 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgb(43, 54, 111) 0%, rgb(35, 45, 95) 100%)',
                    },
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>


              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

