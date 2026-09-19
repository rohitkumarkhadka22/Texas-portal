import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import api from "../services/api";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getToday = () => {
    return DAYS[new Date().getDay()];
  };

  const [today] = useState(getToday());

  const fetchTimetable = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/timetable/student");

      const data = response.data || {};

      setTimetables(Array.isArray(data.timetables) ? data.timetables : []);
    } catch (err) {
      console.error("Get student timetable error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your timetable right now.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const normalizeDay = (day) => {
    if (!day) return "";

    const value = String(day).trim().toLowerCase();

    const match = DAYS.find((item) => item.toLowerCase() === value);

    return match || day;
  };

  const parseTime = (time) => {
    if (!time) return 0;

    const value = String(time).trim();

    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

    if (!match) return 0;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    }

    if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const value = String(time).trim();

    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

    if (!match) return value;

    let hours = Number(match[1]);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();

    if (meridiem) {
      return `${hours}:${minutes} ${meridiem}`;
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  };

  const getDuration = (start, end) => {
    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);

    if (!startMinutes || !endMinutes || endMinutes <= startMinutes) {
      return null;
    }

    const minutes = endMinutes - startMinutes;

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (!remaining) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remaining} min`;
  };

  const sortedTimetables = useMemo(() => {
    return [...timetables].sort((a, b) => {
      const dayA = DAYS.indexOf(normalizeDay(a?.day));
      const dayB = DAYS.indexOf(normalizeDay(b?.day));

      if (dayA !== dayB) {
        return dayA - dayB;
      }

      return parseTime(a?.startTime) - parseTime(b?.startTime);
    });
  }, [timetables]);

  const filteredTimetables = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sortedTimetables.filter((item) => {
      const day = normalizeDay(item?.day).toLowerCase();

      const subjectName = item?.subject?.name?.toLowerCase() || "";

      const subjectCode = item?.subject?.code?.toLowerCase() || "";

      const teacherName = item?.teacher?.name?.toLowerCase() || "";

      const room = item?.room?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        day.includes(query) ||
        subjectName.includes(query) ||
        subjectCode.includes(query) ||
        teacherName.includes(query) ||
        room.includes(query);

      const matchesDay =
        selectedDay === "all" || normalizeDay(item?.day) === selectedDay;

      return matchesSearch && matchesDay;
    });
  }, [sortedTimetables, searchTerm, selectedDay]);

  const todayClasses = useMemo(() => {
    return sortedTimetables.filter((item) => normalizeDay(item?.day) === today);
  }, [sortedTimetables, today]);

  const nextClass = useMemo(() => {
    if (!todayClasses.length) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      todayClasses.find(
        (item) => parseTime(item?.startTime) >= currentMinutes,
      ) || null
    );
  }, [todayClasses]);

  const totalHours = useMemo(() => {
    const totalMinutes = sortedTimetables.reduce((sum, item) => {
      const start = parseTime(item?.startTime);
      const end = parseTime(item?.endTime);

      if (!start || !end || end <= start) return sum;

      return sum + (end - start);
    }, 0);

    return (totalMinutes / 60).toFixed(1);
  }, [sortedTimetables]);

  const activeDays = useMemo(() => {
    return new Set(sortedTimetables.map((item) => normalizeDay(item?.day)))
      .size;
  }, [sortedTimetables]);

  const groupedByDay = useMemo(() => {
    const groups = {};

    DAYS.forEach((day) => {
      groups[day] = [];
    });

    filteredTimetables.forEach((item) => {
      const day = normalizeDay(item?.day);

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(item);
    });

    Object.keys(groups).forEach((day) => {
      groups[day].sort(
        (a, b) => parseTime(a?.startTime) - parseTime(b?.startTime),
      );
    });

    return groups;
  }, [filteredTimetables]);

  const resetFilters = () => {
    setSelectedDay("all");
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-black/5" />

          <div className="h-[250px] animate-pulse rounded-[30px] bg-black/5" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-[24px] bg-black/5"
              />
            ))}
          </div>

          <div className="h-[450px] animate-pulse rounded-[28px] bg-black/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-[1500px] items-center justify-center">
          <div className="w-full max-w-lg rounded-[30px] border border-black/10 bg-white p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
              <XCircle size={24} />
            </div>

            <h2 className="text-xl font-semibold tracking-tight">
              Timetable unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/45">{error}</p>

            <button
              onClick={() => fetchTimetable()}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/35">
              <CalendarDays size={13} />
              Weekly academic schedule
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Timetable
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Your complete weekly class schedule, organized by day, time,
              subject and classroom.
            </p>
          </div>

          <button
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh timetable
          </button>
        </div>

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[30px] bg-black px-7 py-8 text-white sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                <CalendarDays size={12} />
                {today} schedule
              </div>

              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                Know where you need
                <br />
                to be next.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                Keep your classes, rooms and faculty schedule within reach
                throughout the academic week.
              </p>

              {nextClass && (
                <div className="mt-7 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                    <Clock3 size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                      Next class
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold">
                      {nextClass?.subject?.name || "Upcoming class"}
                    </p>

                    <p className="mt-0.5 text-[11px] text-white/40">
                      {formatTime(nextClass?.startTime)} ·{" "}
                      {nextClass?.room ? `Room ${nextClass.room}` : "Room TBA"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-start lg:justify-end">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <div className="absolute inset-4 rounded-full border border-white/10" />

                <div className="text-center">
                  <p className="text-5xl font-semibold tracking-[-0.06em]">
                    {todayClasses.length}
                  </p>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Today's classes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <BookOpen size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Classes
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {sortedTimetables.length}
            </p>

            <p className="mt-1 text-xs text-black/40">Classes this week</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <CalendarDays size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Days
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {activeDays}
            </p>

            <p className="mt-1 text-xs text-black/40">Active class days</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <Clock3 size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Duration
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {totalHours}
              <span className="text-lg text-black/25">h</span>
            </p>

            <p className="mt-1 text-xs text-black/40">Scheduled class time</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <CheckCircle2 size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Today
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {todayClasses.length}
            </p>

            <p className="mt-1 text-xs text-black/40">
              Classes scheduled today
            </p>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="mb-6 rounded-[26px] border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject, teacher, room or day..."
                className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedDay("all")}
                className={`shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  selectedDay === "all"
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                }`}
              >
                All days
              </button>

              {DAYS.map((day) => {
                const hasClasses = sortedTimetables.some(
                  (item) => normalizeDay(item?.day) === day,
                );

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                      selectedDay === day
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                    }`}
                  >
                    {day.slice(0, 3)}
                    {day === today && " · Today"}
                    {!hasClasses && <span className="ml-1 opacity-40">—</span>}
                  </button>
                );
              })}

              {(searchTerm || selectedDay !== "all") && (
                <button
                  onClick={resetFilters}
                  className="shrink-0 cursor-pointer rounded-full px-3 py-2.5 text-xs font-semibold text-black/40 transition hover:bg-black/5 hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* WEEKLY SCHEDULE */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
                Weekly schedule
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                Your classes
              </h3>
            </div>

            <span className="text-xs text-black/35">
              {filteredTimetables.length} class
              {filteredTimetables.length !== 1 ? "es" : ""}
            </span>
          </div>

          {filteredTimetables.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
                <Search size={20} className="text-black/35" />
              </div>

              <h4 className="font-semibold">No classes found</h4>

              <p className="mt-2 text-sm text-black/40">
                Try another search term or select a different day.
              </p>

              <button
                onClick={resetFilters}
                className="mt-5 cursor-pointer rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS.map((day) => {
                const classes = groupedByDay[day] || [];

                if (!classes.length) return null;

                const isToday = day === today;

                return (
                  <div key={day}>
                    {/* DAY HEADER */}
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isToday
                            ? "bg-black text-white"
                            : "bg-white text-black"
                        } border border-black/10`}
                      >
                        <span className="text-xs font-bold">
                          {day.slice(0, 2).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">{day}</h4>

                          {isToday && (
                            <span className="rounded-full bg-black px-2 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-white">
                              Today
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-black/35">
                          {classes.length} class
                          {classes.length !== 1 ? "es" : ""}
                          {" · "}
                          {classes[0]?.section
                            ? `Section ${classes[0].section}`
                            : "Your schedule"}
                        </p>
                      </div>
                    </div>

                    {/* CLASS LIST */}
                    <div className="space-y-3">
                      {classes.map((item, index) => {
                        const duration = getDuration(
                          item?.startTime,
                          item?.endTime,
                        );

                        return (
                          <article
                            key={
                              item?._id ||
                              `${item?.subject?.code}-${item?.startTime}-${index}`
                            }
                            className={`group relative overflow-hidden rounded-[26px] border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/25 hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] ${
                              isToday ? "border-black/15" : "border-black/10"
                            }`}
                          >
                            <div
                              className={`absolute left-0 top-0 h-full w-1 ${
                                isToday ? "bg-black" : "bg-black/10"
                              } transition-all duration-300 group-hover:w-1.5`}
                            />

                            <div className="grid gap-6 lg:grid-cols-[170px_1fr_auto] lg:items-center">
                              {/* TIME */}
                              <div className="pl-2 lg:border-r lg:border-black/5 lg:pr-6">
                                <div className="flex items-center gap-2 text-black/35">
                                  <Clock3 size={13} />

                                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                                    Class time
                                  </span>
                                </div>

                                <p className="mt-2 text-lg font-semibold tracking-tight">
                                  {formatTime(item?.startTime)}
                                </p>

                                <p className="mt-0.5 text-xs text-black/35">
                                  to {formatTime(item?.endTime)}
                                </p>

                                {duration && (
                                  <span className="mt-2 inline-flex rounded-full bg-black/5 px-2.5 py-1 text-[9px] font-semibold text-black/40">
                                    {duration}
                                  </span>
                                )}
                              </div>

                              {/* SUBJECT */}
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white">
                                    {item?.subject?.code || "SUBJECT"}
                                  </span>

                                  {item?.room && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[9px] font-semibold text-black/40">
                                      <MapPin size={10} />
                                      {item.room}
                                    </span>
                                  )}
                                </div>

                                <h5 className="mt-3 text-lg font-semibold tracking-tight">
                                  {item?.subject?.name || "Unknown subject"}
                                </h5>

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/5">
                                      <UserRound size={13} />
                                    </div>

                                    <span className="text-xs text-black/45">
                                      {item?.teacher?.name || "Faculty"}
                                    </span>
                                  </div>

                                  {item?.subject?.creditHours && (
                                    <span className="text-[10px] text-black/30">
                                      {item.subject.creditHours} credit hours
                                    </span>
                                  )}

                                  {item?.section && (
                                    <span className="text-[10px] text-black/30">
                                      Section {item.section}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* ACTION */}
                              <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-4 lg:block lg:border-t-0 lg:pt-0 lg:text-right">
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                                    Semester
                                  </p>

                                  <p className="mt-1 text-xs font-semibold">
                                    {item?.subject?.semester || "—"}
                                  </p>
                                </div>

                                <div className="mt-0 lg:mt-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 transition duration-300 group-hover:bg-black group-hover:text-white">
                                    <ArrowUpRight size={16} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* WEEKLY FOOTER */}
        {sortedTimetables.length > 0 && (
          <section className="mt-7 rounded-[28px] border border-black/10 bg-white p-6 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
                    Weekly overview
                  </p>

                  <h4 className="mt-1 text-base font-semibold">
                    {sortedTimetables.length} scheduled classes across{" "}
                    {activeDays} day
                    {activeDays !== 1 ? "s" : ""}.
                  </h4>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-black/40">
                    Use your weekly schedule to plan study sessions, travel time
                    and preparation between classes.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const count = sortedTimetables.filter(
                    (item) => normalizeDay(item?.day) === day,
                  ).length;

                  if (!count) return null;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`cursor-pointer rounded-full border px-3 py-2 text-[10px] font-semibold transition ${
                        selectedDay === day
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                      }`}
                    >
                      {day.slice(0, 3)} · {count}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentTimetable;
