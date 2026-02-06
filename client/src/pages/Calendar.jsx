import { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch appointments
    const { data: appointments } = useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const { data } = await api.get('/appointments');
            return data.data;
        }
    });

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks = [];
    let daysInWeek = [];

    days.forEach((day, i) => {
        if (i % 7 === 0 && daysInWeek.length) {
            weeks.push(daysInWeek);
            daysInWeek = [];
        }
        daysInWeek.push(day);
    });
    if (daysInWeek.length) weeks.push(daysInWeek);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-md border shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[120px] text-center font-medium">
                            {format(currentMonth, "MMMM yyyy")}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Appointment
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="grid grid-cols-7 border-b bg-muted/40 text-center py-3 text-sm font-medium text-muted-foreground">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-7 auto-rows-[120px]">
                        {days.map((day, dayIdx) => {
                            const dayAppointments = appointments?.filter(apt =>
                                isSameDay(new Date(apt.scheduled_date), day)
                            ) || [];

                            return (
                                <div
                                    key={day.toString()}
                                    className={`border-b border-r p-2 relative ${!isSameMonth(day, monthStart) ? "bg-muted/10 text-muted-foreground" : "bg-white"
                                        }`}
                                >
                                    <span className={`text-sm font-medium block mb-1 ${isSameDay(day, new Date()) ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center -ml-1.5" : ""
                                        }`}>
                                        {format(day, dateFormat)}
                                    </span>

                                    <div className="space-y-1">
                                        {dayAppointments.map(apt => (
                                            <div key={apt.id} className="text-xs truncate bg-blue-100 text-blue-800 rounded px-1 py-0.5 cursor-pointer hover:bg-blue-200">
                                                {apt.scheduled_time} - {apt.lead_name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
