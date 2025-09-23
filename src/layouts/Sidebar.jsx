import {
    Drawer,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    Collapse,
    Box,
  } from "@mui/material";
  import DashboardIcon from "@mui/icons-material/Dashboard";
  import PeopleIcon from "@mui/icons-material/People";
  import WorkIcon from "@mui/icons-material/Work";
  import SettingsIcon from "@mui/icons-material/Settings";
  import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
  import PersonIcon from "@mui/icons-material/Person";
  import ExpandLess from "@mui/icons-material/ExpandLess";
  import ExpandMore from "@mui/icons-material/ExpandMore";
  import RouteIcon from "@mui/icons-material/Route";
  import BusinessIcon from "@mui/icons-material/Business";
  import SecurityIcon from "@mui/icons-material/Security";
  import AccountTreeIcon from "@mui/icons-material/AccountTree";
  import BuildIcon from "@mui/icons-material/Build";
  import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
  import CheckCircleIcon from "@mui/icons-material/CheckCircle";
  import { Link, useLocation } from "react-router-dom";
  import { useSelector } from "react-redux";
  import { hasRole } from "../utils/roleUtils";
  import { grey } from "@mui/material/colors";
  import { useState } from "react";
  
  const drawerWidth = 240;
  const collapsedWidth = 70;
  
  export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useSelector(state => state.auth);
    const [mastersOpen, setMastersOpen] = useState(false);
  
    // Define menu items with role requirements
    const allMenuItems = [
      // { 
      //   text: "Dashboard", 
      //   icon: <DashboardIcon />, 
      //   path: "/dashboard",
      //   roles: ['admin', 'super_admin', 'employee'] 
      // },
      { 
        text: "My Profile", 
        icon: <PersonIcon />, 
        path: "/profile",
        roles: ['admin', 'super_admin', 'employee','manager']
      },
      { 
        text: "Employees", 
        icon: <PeopleIcon />, 
        path: "/employees",
        roles: ['admin', 'super_admin','manager'] 
      },
      {
        text: "Masters",
        icon: <SettingsIcon />,
        roles: ['admin', 'super_admin','manager'],
        hasSubItems: true,
        subItems: [
          { text: "Types", icon: <CheckCircleIcon />, path: "/masters/types" },
          { text: "Status Types", icon: <BusinessIcon />, path: "/masters/status-types" },
        ]
      }
      // { 
      //   text: "Projects", 
      //   icon: <WorkIcon />, 
      //   path: "/projects",
      //   roles: ['admin', 'super_admin']
      // },
      // { 
      //   text: "Settings", 
      //   icon: <SettingsIcon />, 
      //   path: "/settings",
      //   roles: ['admin', 'super_admin', 'employee']
      // },
      // { 
      //   text: "Admin Panel", 
      //   icon: <AdminPanelSettingsIcon />, 
      //   path: "/admin",
      //   roles: ['super_admin'] 
      // },
    ];

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => {
      return hasRole(user?.role, item.roles);
    });


  
    return (
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={onToggle}
        sx={{
          width: collapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedWidth : drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            color: "text.primary",
            transition: "width 0.3s",
            overflowX: "hidden",
            height: "100vh",
            top: 0,
            left: 0,
            zIndex: theme.zIndex.drawer,
            transform: isMobile ? undefined : "none",
            position: isMobile ? "fixed" : "fixed",
            borderRight: "1px solid",
            borderColor: "divider",
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 0 20px rgba(0,0,0,0.3)' 
              : '0 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Toolbar />
        <List sx={{ px: { xs: 1, sm: 0 } }}>
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <Box key={item.text}>
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    onClick={item.hasSubItems ? () => setMastersOpen(!mastersOpen) : undefined}
                    component={item.hasSubItems ? "div" : Link}
                    to={item.hasSubItems ? undefined : item.path}
                    selected={item.hasSubItems ? false : location.pathname === item.path}
                    sx={{
                      minHeight: { xs: 44, sm: 48 },
                      justifyContent: collapsed ? "center" : "initial",
                      px: { xs: 1.5, sm: 2.5 },
                      borderRadius: { xs: 1, sm: 0 },
                      mx: { xs: 0.5, sm: 0 },
                      color: "text.primary",
                      transition: "all 0.2s ease-in-out",
                      "&.Mui-selected": {
                        bgcolor: "rgb(33, 44, 101)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                        "&:hover": {
                          bgcolor: "rgb(43, 54, 111)",
                        },
                      },
                      "&:hover": {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? "action.hover" 
                          : "action.selected",
                        "& .MuiListItemIcon-root": {
                          color: "rgb(33, 44, 101)",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "text.secondary",
                        minWidth: 0,
                        mr: collapsed ? "auto" : 2,
                        justifyContent: "center",
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        transition: "color 0.2s ease-in-out",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText 
                          primary={item.text} 
                          sx={{ 
                            "& .MuiListItemText-primary": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                              fontWeight: 500,
                              color: "inherit",
                              transition: "color 0.2s ease-in-out",
                            }
                          }}
                        />
                        {item.hasSubItems && (
                          mastersOpen ? <ExpandLess /> : <ExpandMore />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
                
                {/* Sub-items for Masters */}
                {item.hasSubItems && !collapsed && (
                  <Collapse in={mastersOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItem key={subItem.text} disablePadding sx={{ display: "block" }}>
                          <ListItemButton
                            component={Link}
                            to={subItem.path}
                            selected={location.pathname === subItem.path}
                            sx={{
                              minHeight: { xs: 40, sm: 44 },
                              pl: { xs: 4, sm: 6 },
                              pr: { xs: 1.5, sm: 2.5 },
                              borderRadius: { xs: 1, sm: 0 },
                              mx: { xs: 0.5, sm: 0 },
                              color: "text.secondary",
                              transition: "all 0.2s ease-in-out",
                              "&.Mui-selected": {
                                bgcolor: "rgb(33, 44, 101)",
                                color: "white",
                                "& .MuiListItemIcon-root": {
                                  color: "white",
                                },
                                "&:hover": {
                                  bgcolor: "rgb(43, 54, 111)",
                                },
                              },
                              "&:hover": {
                                bgcolor: theme.palette.mode === 'dark' 
                                  ? "action.hover" 
                                  : "action.selected",
                                "& .MuiListItemIcon-root": {
                                  color: "rgb(33, 44, 101)",
                                },
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: "text.secondary",
                                minWidth: 0,
                                mr: 2,
                                justifyContent: "center",
                                fontSize: { xs: "1rem", sm: "1.2rem" },
                                transition: "color 0.2s ease-in-out",
                              }}
                            >
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text} 
                              sx={{ 
                                "& .MuiListItemText-primary": {
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                  fontWeight: 400,
                                  color: "inherit",
                                  transition: "color 0.2s ease-in-out",
                                }
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))
          ) : (
            <ListItem disablePadding sx={{ display: "block", px: 2, py: 1 }}>
              <ListItemText 
                primary="No menu items available" 
                sx={{ 
                  color: "text.secondary",
                  textAlign: "center",
                  "& .MuiListItemText-primary": {
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                  }
                }}
              />
            </ListItem>
          )}
        </List>
      </Drawer>
    );
  }
  
  export { drawerWidth, collapsedWidth };
  