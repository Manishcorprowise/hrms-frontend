import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { apiService } from "../../apiservice/api";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Paper,
    useTheme,
    alpha,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Avatar,
    useMediaQuery,
    Grid,
} from '@mui/material';
import {
    CalendarToday as CalendarTodayIcon,
    Today as TodayIcon,
    ViewModule as ViewModuleIcon,
    ViewWeek as ViewWeekIcon,
    ViewDay as ViewDayIcon
} from '@mui/icons-material';

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarPage = () => {
    const { user } = useSelector(state => state.auth);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventDialogOpen, setEventDialogOpen] = useState(false);

    useEffect(() => {
        fetchAdminRequests();
    }, []);

    const fetchAdminRequests = async () => {
        try {
            setLoading(true);
            const response = await apiService.getRequestsForManager();
            if (response.status) {
                if (user.role === 'employee') {
                    const filteredData = response.data.filter(item => item.employeeId === user.id);
                    setData(filteredData || []);
                } else if (user.role === 'manager') {
                    const filteredData = response.data.filter(item => item.managerId === user.id);
                    setData(filteredData || []);
                } else {
                    setData(response.data || []);
                }
            } else {
                console.error('Failed to fetch requests:', response.message);
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Convert API data to calendar events
    const events = data.map((request) => ({
        id: request._id,
        title: `${request.employeeName} - ${request.requestTypeName}`,
        start: new Date(request.from),
        end: new Date(request.to),
        status: request.status,
        description: request.description,
        employeeName: request.employeeName,
        employeeEmail: request.employeeEmail,
        requestTypeName: request.requestTypeName,
        reply: request.reply,
        resource: request
    }));

    // Custom styling based on request status
    const eventStyleGetter = (event) => {
        let backgroundColor = "#3174ad"; // default blue
        let borderColor = "#3174ad";

        switch (event.status) {
            case "approved":
                backgroundColor = "#28a745";
                borderColor = "#28a745";
                break;
            case "pending":
                backgroundColor = "#ffc107";
                borderColor = "#ffc107";
                break;
            case "rejected":
                backgroundColor = "#dc3545";
                borderColor = "#dc3545";
                break;
            default:
                backgroundColor = "#6c757d";
                borderColor = "#6c757d";
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "6px",
                opacity: 0.9,
                color: "white",
                border: `2px solid ${borderColor}`,
                display: "block",
                paddingLeft: "8px",
                paddingRight: "8px",
                fontSize: "12px",
                fontWeight: "500"
            },
        };
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setEventDialogOpen(true);
    };

    const handleCloseEventDialog = () => {
        setEventDialogOpen(false);
        setSelectedEvent(null);
    };

    // Handle date selection - switch to day view
    const handleSelectSlot = (slotInfo) => {
        setCurrentDate(slotInfo.start);
        setView('day');
    };

    // Handle view change
    const handleViewChange = (newView) => {
        setView(newView);
    };

    // Handle navigation
    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    // Get month summary data
    const getMonthSummary = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        const monthEvents = events.filter(event =>
            isWithinInterval(event.start, { start: monthStart, end: monthEnd }) ||
            isWithinInterval(event.end, { start: monthStart, end: monthEnd }) ||
            (event.start <= monthStart && event.end >= monthEnd)
        );

        const summary = {
            total: monthEvents.length,
            approved: monthEvents.filter(e => e.status === 'approved').length,
            pending: monthEvents.filter(e => e.status === 'pending').length,
            rejected: monthEvents.filter(e => e.status === 'rejected').length,
            employees: [...new Set(monthEvents.map(e => e.employeeName))].length
        };

        return summary;
    };

    const monthSummary = getMonthSummary();

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="400px"
                flexDirection="column"
                gap={2}
            >
                <CircularProgress />
                <Typography variant="body1" color="text.secondary">
                    Loading calendar...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    {/* Mobile Layout */}
                    {isMobile && (
                        <Stack spacing={3}>
                            <Typography 
                                color="primary" 
                                variant="h5" 
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
                            >
                                <CalendarTodayIcon color="primary" />
                                Calendar
                            </Typography>
                            
                            <Stack spacing={2}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.primary" textAlign="center">
                                    Quick Jump
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Month</InputLabel>
                                            <Select
                                                value={currentDate.getMonth()}
                                                onChange={(e) => {
                                                    const month = parseInt(e.target.value);
                                                    const newDate = new Date(currentDate.getFullYear(), month, 1);
                                                    setCurrentDate(newDate);
                                                }}
                                                label="Month"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <MenuItem key={i} value={i}>
                                                        {format(new Date(2024, i, 1), 'MMM')}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Year</InputLabel>
                                            <Select
                                                value={currentDate.getFullYear()}
                                                onChange={(e) => {
                                                    const year = parseInt(e.target.value);
                                                    const newDate = new Date(year, currentDate.getMonth(), 1);
                                                    setCurrentDate(newDate);
                                                }}
                                                label="Year"
                                            >
                                                {Array.from({ length: 10 }, (_, i) => {
                                                    const year = new Date().getFullYear() - 2 + i;
                                                    return (
                                                        <MenuItem key={year} value={year}>
                                                            {year}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            type="date"
                                            size="small"
                                            fullWidth
                                            value={format(currentDate, 'yyyy-MM-dd')}
                                            onChange={(e) => {
                                                const selectedDate = new Date(e.target.value);
                                                setCurrentDate(selectedDate);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<TodayIcon />}
                                            onClick={() => setCurrentDate(new Date())}
                                            fullWidth
                                            size="small"
                                        >
                                            Go to Today
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Stack>
                    )}

                    {/* Tablet Layout */}
                    {isTablet && (
                        <Stack spacing={3}>
                            <Typography 
                                color="primary" 
                                variant="h4" 
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
                            >
                                <CalendarTodayIcon color="primary" />
                                Calendar
                            </Typography>
                            
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    Quick Jump:
                                </Typography>

                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <InputLabel>Month</InputLabel>
                                    <Select
                                        value={currentDate.getMonth()}
                                        onChange={(e) => {
                                            const month = parseInt(e.target.value);
                                            const newDate = new Date(currentDate.getFullYear(), month, 1);
                                            setCurrentDate(newDate);
                                        }}
                                        label="Month"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <MenuItem key={i} value={i}>
                                                {format(new Date(2024, i, 1), 'MMM')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 80 }}>
                                    <InputLabel>Year</InputLabel>
                                    <Select
                                        value={currentDate.getFullYear()}
                                        onChange={(e) => {
                                            const year = parseInt(e.target.value);
                                            const newDate = new Date(year, currentDate.getMonth(), 1);
                                            setCurrentDate(newDate);
                                        }}
                                        label="Year"
                                    >
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return (
                                                <MenuItem key={year} value={year}>
                                                    {year}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                <TextField
                                    type="date"
                                    size="small"
                                    value={format(currentDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value);
                                        setCurrentDate(selectedDate);
                                    }}
                                    sx={{ minWidth: 140 }}
                                />

                                <Button
                                    variant="outlined"
                                    startIcon={<TodayIcon />}
                                    onClick={() => setCurrentDate(new Date())}
                                    size="small"
                                >
                                    Today
                                </Button>
                            </Stack>
                        </Stack>
                    )}

                    {/* Desktop Layout */}
                    {isDesktop && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography color="primary" variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarTodayIcon color="primary" />
                                Calendar
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    Quick Jump:
                                </Typography>

                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Month</InputLabel>
                                    <Select
                                        value={currentDate.getMonth()}
                                        onChange={(e) => {
                                            const month = parseInt(e.target.value);
                                            const newDate = new Date(currentDate.getFullYear(), month, 1);
                                            setCurrentDate(newDate);
                                        }}
                                        label="Month"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <MenuItem key={i} value={i}>
                                                {format(new Date(2024, i, 1), 'MMMM')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <InputLabel>Year</InputLabel>
                                    <Select
                                        value={currentDate.getFullYear()}
                                        onChange={(e) => {
                                            const year = parseInt(e.target.value);
                                            const newDate = new Date(year, currentDate.getMonth(), 1);
                                            setCurrentDate(newDate);
                                        }}
                                        label="Year"
                                    >
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return (
                                                <MenuItem key={year} value={year}>
                                                    {year}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                <TextField
                                    type="date"
                                    size="small"
                                    value={format(currentDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value);
                                        setCurrentDate(selectedDate);
                                    }}
                                    sx={{ minWidth: 150 }}
                                />

                                <Button
                                    variant="outlined"
                                    startIcon={<TodayIcon />}
                                    onClick={() => setCurrentDate(new Date())}
                                    size="small"
                                >
                                    Go to Today
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </CardContent>
                <CardContent>
                    {/* Mobile Summary */}
                    {isMobile && (
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" textAlign="center">
                                {format(currentDate, 'MMM yyyy')} Summary
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <Chip
                                        label={`Total: ${monthSummary.total}`}
                                        color="default"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Chip
                                        label={`Approved: ${monthSummary.approved}`}
                                        color="success"
                                        variant="filled"
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Chip
                                        label={`Pending: ${monthSummary.pending}`}
                                        color="warning"
                                        variant="filled"
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Chip
                                        label={`Rejected: ${monthSummary.rejected}`}
                                        color="error"
                                        variant="filled"
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                {user.role !== 'employee' && (
                                    <Grid item xs={12}>
                                        <Chip
                                            label={`Employees: ${monthSummary.employees}`}
                                            color="secondary"
                                            variant="filled"
                                            size="small"
                                            fullWidth
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Stack>
                    )}

                    {/* Tablet Summary */}
                    {isTablet && (
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" textAlign="center">
                                {format(currentDate, 'MMMM yyyy')} Summary
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                                <Chip
                                    label={`Total: ${monthSummary.total}`}
                                    color="default"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    label={`Approved: ${monthSummary.approved}`}
                                    color="success"
                                    variant="filled"
                                    size="small"
                                />
                                <Chip
                                    label={`Pending: ${monthSummary.pending}`}
                                    color="warning"
                                    variant="filled"
                                    size="small"
                                />
                                <Chip
                                    label={`Rejected: ${monthSummary.rejected}`}
                                    color="error"
                                    variant="filled"
                                    size="small"
                                />
                                {user.role !== 'employee' && (
                                    <Chip
                                        label={`Employees: ${monthSummary.employees}`}
                                        color="secondary"
                                        variant="filled"
                                        size="small"
                                    />
                                )}
                            </Stack>
                        </Stack>
                    )}

                    {/* Desktop Summary */}
                    {isDesktop && (
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {format(currentDate, 'MMMM yyyy')} Summary:
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Chip
                                    label={`Total: ${monthSummary.total}`}
                                    color="default"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    label={`Approved: ${monthSummary.approved}`}
                                    color="success"
                                    variant="filled"
                                    size="small"
                                />
                                <Chip
                                    label={`Pending: ${monthSummary.pending}`}
                                    color="warning"
                                    variant="filled"
                                    size="small"
                                />
                                <Chip
                                    label={`Rejected: ${monthSummary.rejected}`}
                                    color="error"
                                    variant="filled"
                                    size="small"
                                />
                                {user.role !== 'employee' && (
                                    <Chip
                                        label={`Employees: ${monthSummary.employees}`}
                                        color="secondary"
                                        variant="filled"
                                        size="small"
                                    />
                                )}
                            </Stack>
                        </Stack>
                    )}
                </CardContent>
                <Box sx={{ 
                    height: isMobile ? '400px' : isTablet ? '500px' : '600px', 
                    p: isMobile ? 1 : 2 
                }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: "100%" }}
                        views={isMobile ? ["month", "agenda"] : ["month", "week", "day", "agenda"]}
                        view={view}
                        onView={handleViewChange}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        selectable={true}
                        popup
                        showMultiDayTimes
                        step={30}
                        timeslots={2}
                        date={currentDate}
                        onNavigate={handleNavigate}
                    />
                </Box>
                <CardContent>
                    {/* Mobile Legend */}
                    {isMobile && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight="bold" textAlign="center">
                                Legend
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: 'success.main',
                                                borderRadius: 1
                                            }}
                                        />
                                        <Typography variant="caption">Approved</Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={4}>
                                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: 'warning.main',
                                                borderRadius: 1
                                            }}
                                        />
                                        <Typography variant="caption">Pending</Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={4}>
                                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: 'error.main',
                                                borderRadius: 1
                                            }}
                                        />
                                        <Typography variant="caption">Rejected</Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Stack>
                    )}

                    {/* Tablet Legend */}
                    {isTablet && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                                Legend
                            </Typography>
                            <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            backgroundColor: 'success.main',
                                            borderRadius: 1
                                        }}
                                    />
                                    <Typography variant="body2">Approved</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            backgroundColor: 'warning.main',
                                            borderRadius: 1
                                        }}
                                    />
                                    <Typography variant="body2">Pending</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            backgroundColor: 'error.main',
                                            borderRadius: 1
                                        }}
                                    />
                                    <Typography variant="body2">Rejected</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    )}

                    {/* Desktop Legend */}
                    {isDesktop && (
                        <Stack direction="row" spacing={3} flexWrap="wrap" gap={2}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: 'success.main',
                                        borderRadius: 1
                                    }}
                                />
                                <Typography variant="body2">Approved</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: 'warning.main',
                                        borderRadius: 1
                                    }}
                                />
                                <Typography variant="body2">Pending</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: 'error.main',
                                        borderRadius: 1
                                    }}
                                />
                                <Typography variant="body2">Rejected</Typography>
                            </Stack>
                        </Stack>
                    )}
                </CardContent>

            </Card>

            {/* Event Details Dialog */}
            <Dialog 
                open={eventDialogOpen} 
                onClose={handleCloseEventDialog}
                maxWidth={isMobile ? "xs" : isTablet ? "sm" : "md"}
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: selectedEvent?.status === 'approved' ? 'success.main' : 
                                          selectedEvent?.status === 'pending' ? 'warning.main' : 
                                          selectedEvent?.status === 'rejected' ? 'error.main' : 'grey.500' }}>
                        {selectedEvent?.employeeName?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{selectedEvent?.employeeName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedEvent?.requestTypeName}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Status
                            </Typography>
                            <Chip 
                                label={selectedEvent?.status?.toUpperCase()} 
                                color={selectedEvent?.status === 'approved' ? 'success' : 
                                       selectedEvent?.status === 'pending' ? 'warning' : 
                                       selectedEvent?.status === 'rejected' ? 'error' : 'default'}
                                variant="filled"
                                size="small"
                            />
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Employee Details
                            </Typography>
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    <strong>Name:</strong> {selectedEvent?.employeeName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Email:</strong> {selectedEvent?.employeeEmail}
                                </Typography>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Request Details
                            </Typography>
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    <strong>Type:</strong> {selectedEvent?.requestTypeName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Description:</strong> {selectedEvent?.description || 'No description provided'}
                                </Typography>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Time Period
                            </Typography>
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    <strong>From:</strong> {selectedEvent?.start ? format(selectedEvent.start, 'MMM dd, yyyy HH:mm') : 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>To:</strong> {selectedEvent?.end ? format(selectedEvent.end, 'MMM dd, yyyy HH:mm') : 'N/A'}
                                </Typography>
                            </Stack>
                        </Box>

                        {selectedEvent?.reply && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Manager Reply
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        p: 2, 
                                        bgcolor: 'grey.50', 
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'grey.200'
                                    }}>
                                        {selectedEvent.reply}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEventDialog} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CalendarPage;