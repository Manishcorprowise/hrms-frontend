import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    useTheme,
    Divider
  } from "@mui/material";
  import MenuIcon from "@mui/icons-material/Menu";
  import NotificationsIcon from "@mui/icons-material/Notifications";
  import Brightness4Icon from "@mui/icons-material/Brightness4";
  import Brightness7Icon from "@mui/icons-material/Brightness7";
  import LogoutIcon from "@mui/icons-material/Logout";
  import PersonIcon from "@mui/icons-material/Person";
  import { useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { useNavigate } from "react-router-dom";
  import { logoutUser } from "../store/authSlice";
  import { useThemeContext } from "../theme/ThemeProvider";
  import KAD_Logo from "../assets/KAD_Logo.png";
  
  export default function Topbar({ onToggle }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const { mode, toggleTheme } = useThemeContext();
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading } = useSelector(state => state.auth);
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect to login even if logout API fails
        navigate('/login');
      }
      handleMenuClose();
    };

    const handleProfile = () => {
      // Navigate to profile page or show profile dialog
      console.log('Profile clicked');
      handleMenuClose();
    };
  
    return (
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: theme.palette.mode === 'dark' 
            ? "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)" 
            : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          transition: "all 0.3s",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* Mobile Logo */}
            <Box
              component="img"
              src={KAD_Logo}
              alt="HRMS Logo"
              sx={{
                height: 28,
                width: 'auto',
                display: { xs: "block", sm: "none" },
                objectFit: 'contain',
                filter: theme.palette.mode === 'dark' 
                  ? 'brightness(0) invert(1)' // Invert colors for dark theme
                  : 'none',
              }}
              onError={(e) => {
                // Fallback to text if logo fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Desktop Logo */}
            <Box
              component="img"
              src={KAD_Logo}
              alt="HRMS Logo"
              sx={{
                height: { xs: 20, sm: 26 },
                width: 'auto',
                display: { xs: "none", sm: "block" },
                objectFit: 'contain',
                filter: theme.palette.mode === 'dark' 
                  ? 'brightness(0) invert(1)' // Invert colors for dark theme
                  : 'none',
              }}
              onError={(e) => {
                // Fallback to text if logo fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />


            <IconButton 
              onClick={onToggle} 
              sx={{ 
                color: "text.primary",
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              <MenuIcon />
            </IconButton>
            
          </Box>

          {/* Right side items */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 2 } }}>
            {/* Theme Toggle */}
            <IconButton 
              color="primary" 
              onClick={toggleTheme} 
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {/* Notifications */}
            <IconButton 
              color="primary" 
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Avatar */}
            <IconButton 
              onClick={handleMenuOpen} 
              size="small"
              disabled={isLoading}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              <Avatar 
                alt={user?.employeeName || "User"} 
                sx={{ 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 },
                  border: '2px solid',
                  borderColor: 'divider',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}
              >
                {user?.employeeName?.charAt(0) || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 20px rgba(0,0,0,0.4)' 
                    : '0 4px 20px rgba(0,0,0,0.15)',
                  mt: 1,
                  minWidth: 200,
                }
              }}
            >
              {/* User Info */}
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {user?.employeeName || "User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || ""}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {user?.role || ""}
                </Typography>
              </Box>

              <MenuItem 
                onClick={handleProfile}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                My Profile
              </MenuItem>
              
              <Divider />
              
              <MenuItem 
                onClick={handleLogout}
                disabled={isLoading}
                sx={{
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                {isLoading ? 'Logging out...' : 'Logout'}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }
  