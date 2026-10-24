import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
export default function DateRangePicker({ startDate, endDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectingStart, setSelectingStart] = useState(true);
    const [tempStart, setTempStart] = useState(startDate);
    const [tempEnd, setTempEnd] = useState(endDate);
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (startDate) {
            const date = new Date(startDate);
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }
        return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    });
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        setTempStart(startDate);
        setTempEnd(endDate);
        if (startDate) {
            setCurrentMonth(new Date(startDate));
        }
    }, [startDate, endDate]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const handleDateClick = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (selectingStart) {
            setTempStart(dateStr);
            setTempEnd(dateStr);
            setSelectingStart(false);
        }
        else {
            if (new Date(dateStr) < new Date(tempStart)) {
                // If clicked date is before start, make it the new start
                setTempStart(dateStr);
                setTempEnd(tempStart);
            }
            else {
                setTempEnd(dateStr);
                setSelectingStart(true);
                onChange(tempStart, dateStr);
                setIsOpen(false);
            }
        }
    };
    const handleApply = () => {
        if (tempStart && tempEnd) {
            onChange(tempStart, tempEnd);
            setIsOpen(false);
        }
    };
    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            }
            else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };
    const selectMonth = (month) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), month, 1));
        setShowMonthPicker(false);
    };
    const selectYear = (year) => {
        setCurrentMonth(prev => new Date(year, prev.getMonth(), 1));
        setShowYearPicker(false);
    };
    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const days = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };
    const getYearRange = () => {
        const currentYear = currentMonth.getFullYear();
        const startYear = currentYear - 10;
        const endYear = currentYear + 10;
        const years = [];
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return years;
    };
    const isInRange = (date) => {
        if (!tempStart || !tempEnd)
            return false;
        const dateStr = date.toISOString().split('T')[0];
        return dateStr >= tempStart && dateStr <= tempEnd;
    };
    const isStartDate = (date) => {
        if (!tempStart)
            return false;
        return date.toISOString().split('T')[0] === tempStart;
    };
    const isEndDate = (date) => {
        if (!tempEnd)
            return false;
        return date.toISOString().split('T')[0] === tempEnd;
    };
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };
    const days = generateCalendar();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[currentMonth.getMonth()];
    const year = currentMonth.getFullYear();
    const years = getYearRange();
    return (_jsxs("div", { className: "relative", ref: containerRef, children: [_jsxs("button", { type: "button", onClick: () => setIsOpen(!isOpen), className: "w-full h-9 px-3 text-sm border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-left flex items-center justify-between hover:border-muted-foreground/40 transition-colors", children: [_jsx("span", { children: tempStart && tempEnd ? `${formatDate(tempStart)} - ${formatDate(tempEnd)}` : 'Select date range' }), _jsx("svg", { className: "w-4 h-4 text-muted-foreground", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })] }), isOpen && (_jsxs("div", { className: "absolute z-50 mt-2 bg-surface-elevated border border-border rounded-xl shadow-xl shadow-black/20 p-4 w-80 animate-scale-in", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("button", { type: "button", onClick: () => navigateMonth('prev'), className: "p-1.5 hover:bg-muted rounded-lg transition-colors", "aria-label": "Previous month", children: _jsx("svg", { className: "w-5 h-5 text-muted-foreground", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                    setShowYearPicker(false);
                                                    setShowMonthPicker(!showMonthPicker);
                                                }, className: "px-3 py-1 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors", children: monthName }), _jsx("button", { type: "button", onClick: () => {
                                                    setShowMonthPicker(false);
                                                    setShowYearPicker(!showYearPicker);
                                                }, className: "px-3 py-1 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors", children: year })] }), _jsx("button", { type: "button", onClick: () => navigateMonth('next'), className: "p-1.5 hover:bg-muted rounded-lg transition-colors", "aria-label": "Next month", children: _jsx("svg", { className: "w-5 h-5 text-muted-foreground", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), showMonthPicker && (_jsx("div", { className: "mb-3 p-2 bg-muted rounded-lg", children: _jsx("div", { className: "grid grid-cols-3 gap-2", children: monthNames.map((month, idx) => (_jsx("button", { type: "button", onClick: () => selectMonth(idx), className: `px-3 py-2 text-xs rounded transition-colors ${idx === currentMonth.getMonth()
                                            ? 'bg-accent text-accent-foreground font-semibold'
                                            : 'hover:bg-border/60 text-muted-foreground'}`, children: month.substring(0, 3) }, month))) }) })), showYearPicker && (_jsx("div", { className: "mb-3 p-2 bg-muted rounded-lg max-h-48 overflow-y-auto", children: _jsx("div", { className: "grid grid-cols-4 gap-2", children: years.map((y) => (_jsx("button", { type: "button", onClick: () => selectYear(y), className: `px-3 py-2 text-xs rounded transition-colors ${y === currentMonth.getFullYear()
                                            ? 'bg-accent text-accent-foreground font-semibold'
                                            : 'hover:bg-border/60 text-muted-foreground'}`, children: y }, y))) }) })), _jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (_jsx("div", { className: "text-xs font-medium text-muted-foreground text-center py-1", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: days.map((date, idx) => {
                                    if (!date) {
                                        return _jsx("div", { className: "h-8" }, idx);
                                    }
                                    const inRange = isInRange(date);
                                    const isStart = isStartDate(date);
                                    const isEnd = isEndDate(date);
                                    const today = isToday(date);
                                    return (_jsx("button", { type: "button", onClick: () => handleDateClick(date), className: `
                      h-8 text-xs rounded transition-colors
                      ${isStart || isEnd
                                            ? 'bg-accent text-accent-foreground font-semibold'
                                            : inRange
                                                ? 'bg-accent-muted text-accent'
                                                : 'hover:bg-muted text-foreground'}
                      ${today && !isStart && !isEnd ? 'ring-1 ring-border' : ''}
                    `, children: date.getDate() }, idx));
                                }) })] }), _jsxs("div", { className: "flex gap-2 pt-2 border-t border-border", children: [_jsx("button", { type: "button", onClick: handleApply, className: "flex-1 px-3 py-2 text-sm bg-accent hover:brightness-110 text-accent-foreground rounded-lg transition-colors font-medium", children: "Apply" }), _jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "px-3 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors", children: "Cancel" })] })] }))] }));
}
