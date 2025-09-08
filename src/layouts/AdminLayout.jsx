import { useState } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import Sidebar, { drawerWidth, collapsedWidth } from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} mobileOpen={mobileOpen} />

      {/* Main Content */}
      <Box>
        <Topbar
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
          drawerWidth={drawerWidth}
          collapsedWidth={collapsedWidth}
        />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, sm: 3 }, 
            mt: { xs: 7, sm: 8 },
            minHeight: "calc(100vh - 64px)",
            backgroundColor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
