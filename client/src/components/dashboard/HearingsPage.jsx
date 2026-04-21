import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  Loader2,
  MapPin,
  Clock,
  User,
  ChevronRight,
  Info,
} from "lucide-react";
import { getCases } from "../../services/caseManagementService";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enIN from "date-fns/locale/en-IN";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-theme.css"; // We'll create this

const locales = {
  "en-IN": enIN,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };
  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const viewNamesGroup = [
    { view: 'month', label: 'Month' },
    // { view: 'week', label: 'Week' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-2">
      <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
        <button
          onClick={goToBack}
          className="px-4 py-2 text-xs font-bold rounded-xl transition-all hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
        >
          Previous
        </button>
        <button
          onClick={goToNext}
          className="px-6 py-2 text-xs font-bold rounded-xl transition-all bg-gold text-black shadow-lg shadow-gold/20 scale-105 active:scale-95 cursor-pointer"
        >
          Next
        </button>
      </div>

      <div className="text-lg sm:text-xl font-bold bg-linear-to-r from-gold via-gold-dark to-gold bg-clip-text text-transparent drop-shadow-sm font-inter">
        {toolbar.label}
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
        {viewNamesGroup.map((v) => (
          <button
            key={v.view}
            onClick={() => toolbar.onView(v.view)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${toolbar.view === v.view
              ? 'bg-white dark:bg-gray-700 text-gold shadow-md scale-105'
              : 'text-gray-500 hover:text-gold hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const HearingsPage = () => {
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'calendar'
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchHearings = async () => {
      try {
        // Fetch all cases to extract hearing dates (we might want a specific hearings endpoint in the future)
        const response = await getCases(1, 100);
        if (response.success) {
          const allCases = response.data.cases;
          const casesWithHearings = allCases.filter((c) => c.hearingDate);

          // Sort logic: Upcoming hearings first (asc), then past hearings (desc)
          const now = new Date();
          const processedHearings = casesWithHearings.sort((a, b) => {
            const dateA = new Date(a.hearingDate);
            const dateB = new Date(b.hearingDate);

            const isUpcomingA = dateA >= now;
            const isUpcomingB = dateB >= now;

            if (isUpcomingA && !isUpcomingB) return -1;
            if (!isUpcomingA && isUpcomingB) return 1;

            if (isUpcomingA && isUpcomingB) {
              return dateA - dateB; // Upcoming: nearest first
            } else {
              return dateB - dateA; // Past: most recent first
            }
          });

          setHearings(processedHearings);
        }
      } catch (error) {
        console.error("Fetch hearings error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHearings();
  }, []);

  const calendarEvents = hearings.map((h) => ({
    id: h._id,
    title: h.title,
    start: new Date(h.hearingDate),
    end: new Date(new Date(h.hearingDate).getTime() + 60 * 60 * 1000), // Default 1 hour
    resource: h,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-bold font-inter"
            style={{ color: "var(--text-primary)" }}
          >
            Court Hearings
          </h1>
          <p
            className="mt-1 text-sm font-inter"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage and track all scheduled judicial appearances
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${viewMode === "card"
              ? "bg-white dark:bg-gray-700 shadow-sm text-gold scale-105"
              : "text-gray-500 hover:text-gold"
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Card View</span>
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${viewMode === "calendar"
              ? "bg-white dark:bg-gray-700 shadow-sm text-gold scale-105"
              : "text-gray-500 hover:text-gold"
              }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hearings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <CalendarIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
              <p className="text-lg font-semibold text-gray-500">
                No hearings scheduled yet
              </p>
            </div>
          ) : (
            hearings.map((h) => {
              const date = new Date(h.hearingDate);
              const isPast = date < new Date();
              return (
                <div
                  key={h._id}
                  className={`group relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isPast
                    ? "opacity-75 grayscale-[0.3]"
                    : "bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl"
                    }`}
                  style={{ borderColor: "var(--border-color)" }}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPast
                        ? "bg-gray-100 text-gray-500"
                        : "bg-gold/10 text-gold animate-pulse"
                        }`}
                    >
                      {isPast ? "Completed" : "Upcoming"}
                    </span>
                  </div>

                  <div className="flex-1 mt-5">
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`p-3 rounded-2xl ${isPast ? "bg-gray-200 text-gray-400" : "bg-gold text-white shadow-lg shadow-gold/20"}`}
                      >
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3
                          className="font-bold text-lg line-clamp-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {h.title}
                        </h3>
                        <p className="text-xs font-semibold text-gold uppercase tracking-tighter">
                          {h.caseNumber}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div
                        className="flex items-center text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Clock className="w-4 h-4 mr-2 text-gold/60" />
                        <span>{format(date, "PPP p")}</span>
                      </div>
                      <div
                        className="flex items-center text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-gold/60" />
                        <span className="truncate">
                          Cuttack District Court, Room 5A
                        </span>
                      </div>
                      <div
                        className="flex items-center text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <User className="w-4 h-4 mr-2 text-gold/60" />
                        <span className="truncate">
                          Client: {h.client?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-[10px] font-bold">A</div>
                                            ))}
                                        </div>
                                        <button className="flex items-center text-sm font-bold text-gold hover:underline">
                                            Details <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div> */}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div
          className="p-6 rounded-3xl shadow-2xl border overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            height: "700px",
          }}
        >
          <Calendar
            localizer={localizer}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month"]}
            components={{
              toolbar: CustomToolbar,
            }}
            eventPropGetter={(event) => ({
              className: "gold-calendar-event",
              style: {
                backgroundColor: "var(--gold)",
                borderRadius: "8px",
                border: "none",
                color: "black",
                fontWeight: "bold",
              },
            })}
          />
        </div>
      )}
    </div>
  );
};

export default HearingsPage;
