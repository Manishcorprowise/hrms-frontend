import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { apiService } from "../../apiservice/api";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchAdminRequests();   
    }, []);
    
    const fetchAdminRequests = async () => {
        try {
            setLoading(true);
            const response = await apiService.getRequestsForManager();
            if (response.status) {
                if(user.role === 'employee'){
                    const filteredData = response.data.filter(item => item.employeeId === user.id);
                    setData(filteredData || []);
                }else if(user.role === 'manager'){
                    const filteredData = response.data.filter(item => item.managerId === user.id);
                    setData(filteredData || []);
                }else{
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
        const details = `
Employee: ${event.employeeName}
Email: ${event.employeeEmail}
Request Type: ${event.requestTypeName}
Status: ${event.status}
Description: ${event.description}
From: ${format(event.start, 'MMM dd, yyyy HH:mm')}
To: ${format(event.end, 'MMM dd, yyyy HH:mm')}
${event.reply ? `Reply: ${event.reply}` : ''}
        `;
        alert(details);
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
        setSelectedMonth(newDate.getMonth());
        setSelectedYear(newDate.getFullYear());
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
        setSelectedMonth(newDate.getMonth());
        setSelectedYear(newDate.getFullYear());
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
    };

    const handleMonthChange = (e) => {
        const month = parseInt(e.target.value);
        const newDate = new Date(selectedYear, month, 1);
        setCurrentDate(newDate);
        setSelectedMonth(month);
    };

    const handleYearChange = (e) => {
        const year = parseInt(e.target.value);
        const newDate = new Date(year, selectedMonth, 1);
        setCurrentDate(newDate);
        setSelectedYear(year);
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div>Loading calendar...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px', color: '#333' }}>Leave Calendar</h1>
            
            {/* Month Selection Controls */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={goToPreviousMonth}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Previous
                    </button>
                    
                    <button 
                        onClick={goToToday}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Today
                    </button>
                    
                    <button 
                        onClick={goToNextMonth}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Next →
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select 
                        value={selectedMonth} 
                        onChange={handleMonthChange}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da',
                            fontSize: '14px'
                        }}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {format(new Date(2024, i, 1), 'MMMM')}
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        value={selectedYear} 
                        onChange={handleYearChange}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da',
                            fontSize: '14px'
                        }}
                    >
                        {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {/* Month Summary */}
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                border: '1px solid #bbdefb'
            }}>
                <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {format(currentDate, 'MMMM yyyy')} Summary:
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#2e7d32' }}>Total: {monthSummary.total}</span>
                    <span style={{ color: '#28a745' }}>Approved: {monthSummary.approved}</span>
                    <span style={{ color: '#ffc107' }}>Pending: {monthSummary.pending}</span>
                    <span style={{ color: '#dc3545' }}>Rejected: {monthSummary.rejected}</span>
                    {user.role !== 'employee' && (
                        <span style={{ color: '#6f42c1' }}>Employees: {monthSummary.employees}</span>
                    )}
                </div>
            </div>

            <div style={{ height: '600px', marginBottom: '20px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    views={["month", "week", "day", "agenda"]}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    popup
                    showMultiDayTimes
                    step={30}
                    timeslots={2}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                />
            </div>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#28a745', borderRadius: '4px' }}></div>
                    <span>Approved</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107', borderRadius: '4px' }}></div>
                    <span>Pending</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', borderRadius: '4px' }}></div>
                    <span>Rejected</span>
                </div>
            </div>
        </div>
    )
}

export default CalendarPage;