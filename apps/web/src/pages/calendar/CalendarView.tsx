/**
 * Calendar View Page
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Demo promotions
const demoPromotions = [
  {
    id: '1',
    code: 'PROMO-2026-001',
    name: 'Q1 Trade Discount',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    status: 'ACTIVE',
    color: '#22c55e',
  },
  {
    id: '2',
    code: 'PROMO-2026-002',
    name: 'Lunar New Year',
    startDate: '2026-01-25',
    endDate: '2026-02-10',
    status: 'ACTIVE',
    color: '#ef4444',
  },
  {
    id: '3',
    code: 'PROMO-2026-003',
    name: 'Valentine Sale',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    status: 'PENDING_APPROVAL',
    color: '#ec4899',
  },
  {
    id: '4',
    code: 'PROMO-2026-004',
    name: 'March Madness',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'DRAFT',
    color: '#3b82f6',
  },
];

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  // Get promotions for a specific date
  const getPromotionsForDate = (date: Date) => {
    return demoPromotions.filter((promo) => {
      const start = parseISO(promo.startDate);
      const end = parseISO(promo.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  // Get promotions for selected date
  const selectedDatePromotions = selectedDate
    ? getPromotionsForDate(selectedDate)
    : [];

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotion Calendar</h1>
          <p className="text-muted-foreground">
            View promotions timeline
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/promotions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Promotion
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
          </CardHeader>
          <CardContent>
            {/* Week day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayPromotions = getPromotionsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors',
                      !isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                      isToday && 'border-primary',
                      isSelected && 'bg-primary/10 border-primary',
                      'hover:bg-muted'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-medium mb-1',
                      isToday && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayPromotions.slice(0, 2).map((promo) => (
                        <div
                          key={promo.id}
                          className="text-xs px-1 py-0.5 rounded truncate"
                          style={{ backgroundColor: promo.color + '20', color: promo.color }}
                        >
                          {promo.code}
                        </div>
                      ))}
                      {dayPromotions.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayPromotions.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDatePromotions.length > 0 ? (
                <div className="space-y-3">
                  {selectedDatePromotions.map((promo) => (
                    <Link
                      key={promo.id}
                      to={`/promotions/${promo.id}`}
                      className="block rounded-lg border p-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: promo.color }}
                        />
                        <div>
                          <p className="font-medium text-sm">{promo.code}</p>
                          <p className="text-xs text-muted-foreground">{promo.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(promo.startDate), 'MMM d')} -{' '}
                            {format(parseISO(promo.endDate), 'MMM d')}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {promo.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No promotions on this date
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click on a date to see promotions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {demoPromotions.map((promo) => (
              <Link
                key={promo.id}
                to={`/promotions/${promo.id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: promo.color }}
                />
                <span>{promo.code}</span>
                <span className="text-muted-foreground">({promo.name})</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
