import ballerina/time;

// Date range helpers for the daily/weekly/monthly totals and the current-month
// category spend, all expressed as inclusive 'YYYY-MM-DD' string bounds so they
// compare directly against the TEXT expense_date column.

type DateRange record {|
    string startDate;
    string endDate;
|};

function pad2(int n) returns string {
    if n < 10 {
        return "0" + n.toString();
    }
    return n.toString();
}

function formatDate(int year, int month, int day) returns string {
    return year.toString() + "-" + pad2(month) + "-" + pad2(day);
}

function todayParts() returns [int, int, int]|error {
    time:Civil nowCivil = time:utcToCivil(time:utcNow());
    return [nowCivil.year, nowCivil.month, nowCivil.day];
}

// Shifts a calendar date by deltaDays (may be negative) using UTC midnight
// arithmetic, returning the resulting [year, month, day].
function shiftDate(int year, int month, int day, int deltaDays) returns [int, int, int]|error {
    time:Civil civil = {year: year, month: month, day: day, hour: 0, minute: 0, second: 0,
        utcOffset: {hours: 0, minutes: 0}};
    time:Utc utc = check time:utcFromCivil(civil);
    time:Utc shifted = time:utcAddSeconds(utc, <decimal>deltaDays * 86400);
    time:Civil shiftedCivil = time:utcToCivil(shifted);
    return [shiftedCivil.year, shiftedCivil.month, shiftedCivil.day];
}

function dayOfWeekOffset(int year, int month, int day) returns int {
    time:DayOfWeek dow = time:dayOfWeek({year: year, month: month, day: day, hour: 0, minute: 0, second: 0});
    if dow == time:SUNDAY {
        return 0;
    }
    if dow == time:MONDAY {
        return 1;
    }
    if dow == time:TUESDAY {
        return 2;
    }
    if dow == time:WEDNESDAY {
        return 3;
    }
    if dow == time:THURSDAY {
        return 4;
    }
    if dow == time:FRIDAY {
        return 5;
    }
    return 6;
}

function currentMonthRange() returns DateRange|error {
    [int, int, int] [year, month, _] = check todayParts();
    string startDate = formatDate(year, month, 1);
    int nextMonth = month == 12 ? 1 : month + 1;
    int nextMonthYear = month == 12 ? year + 1 : year;
    [int, int, int] lastDay = check shiftDate(nextMonthYear, nextMonth, 1, -1);
    string endDate = formatDate(lastDay[0], lastDay[1], lastDay[2]);
    return {startDate, endDate};
}

function currentWeekRange() returns DateRange|error {
    [int, int, int] [year, month, day] = check todayParts();
    int offset = dayOfWeekOffset(year, month, day);
    [int, int, int] weekStart = check shiftDate(year, month, day, -offset);
    [int, int, int] weekEnd = check shiftDate(weekStart[0], weekStart[1], weekStart[2], 6);
    return {startDate: formatDate(weekStart[0], weekStart[1], weekStart[2]),
        endDate: formatDate(weekEnd[0], weekEnd[1], weekEnd[2])};
}

function currentDayRange() returns DateRange|error {
    [int, int, int] [year, month, day] = check todayParts();
    string todayStr = formatDate(year, month, day);
    return {startDate: todayStr, endDate: todayStr};
}

function rangeForPeriod(string period) returns DateRange|error? {
    if period == "daily" {
        return check currentDayRange();
    }
    if period == "weekly" {
        return check currentWeekRange();
    }
    if period == "monthly" {
        return check currentMonthRange();
    }
    return ();
}
