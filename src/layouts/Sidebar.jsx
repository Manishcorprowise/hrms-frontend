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
  } from "@mui/material";
  import DashboardIcon from "@mui/icons-material/Dashboard";
  import PeopleIcon from "@mui/icons-material/People";
  import WorkIcon from "@mui/icons-material/Work";
  import { Link, useLocation } from "react-router-dom";
  import { grey } from "@mui/material/colors";
  
  const drawerWidth = 240;
  const collapsedWidth = 70;
  
  export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
    const menuItems = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
      { text: "Employees", icon: <PeopleIcon />, path: "/employees" },
    //   { text: "Projects", icon: <WorkIcon />, path: "/projects" },
    ];

  
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
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  justifyContent: collapsed ? "center" : "initial",
                  px: { xs: 1.5, sm: 2.5 },
                  borderRadius: { xs: 1, sm: 0 },
                  mx: { xs: 0.5, sm: 0 },
                  color: "text.primary",
                  transition: "all 0.2s ease-in-out",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? "action.hover" 
                      : "action.selected",
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
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
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  }
  
  export { drawerWidth, collapsedWidth };
  