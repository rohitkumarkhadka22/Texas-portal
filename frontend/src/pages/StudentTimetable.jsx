import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  BookOpen,
  UserRound,
  Loader2,
} from "lucide-react";

import api from "../services/api";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/timetable/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.timetable)
          ? data.timetable
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setTimetable(list);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your timetable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  /* =========================================
     HELPERS
  ========================================= */

  const getDay = (item) => {
    return item?.day || item?.dayOfWeek || item?.weekday || "Schedule";
  };

  const getSubject = (item) => {
    if (typeof item?.subject === "string") {
      return item.subject;
    }

    return item?.subject?.name || item?.subjectName || item?.name || "Class";
  };

  const getSubjectCode = (item) => {
    if (typeof item?.subject === "object") {
      return item?.subject?.code || "";
    }

    return item?.subjectCode || "";
  };

  const getTeacher = (item) => {
    if (typeof item?.teacher === "string") {
      return item.teacher;
    }

    return (
      item?.teacher?.name || item?.teacherName || item?.instructor || "Faculty"
    );
  };

  const getRoom = (item) => {
    return (
      item?.room || item?.roomNumber || item?.classroom || item?.location || "—"
    );
  };

  const getStartTime = (item) => {
    return (
      item?.startTime || item?.start || item?.from || item?.time?.start || ""
    );
  };

  const getEndTime = (item) => {
    return item?.endTime || item?.end || item?.to || item?.time?.end || "";
  };

  const getTime = (item) => {
    const start = getStartTime(item);
    const end = getEndTime(item);

    if (start && end) {
      return `${start} — ${end}`;
    }

    return item?.time || "Time not set";
  };

  /* =========================================
     DAY ORDER
  ========================================= */

  const dayOrder = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const groupedTimetable = useMemo(() => {
    const groups = {};

    timetable.forEach((item) => {
      const day = getDay(item);

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(item);
    });

    return Object.entries(groups).sort(
      ([dayA], [dayB]) =>
        (dayOrder[String(dayA).toLowerCase()] ?? 99) -
        (dayOrder[String(dayB).toLowerCase()] ?? 99),
    );
  }, [timetable]);

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <section className="min-h-[70vh]">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-black/[0.08] bg-white/70 px-5 py-3 shadow-sm backdrop-blur-xl">
            <Loader2 size={15} className="animate-spin text-black/60" />

            <span className="text-[11px] font-medium text-black/50">
              Loading your timetable...
            </span>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <section className="py-8">
        <div className="rounded-[28px] border border-black/[0.08] bg-white/70 p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.05]">
            <CalendarDays size={20} className="text-black/50" />
          </div>

          <h2 className="mt-5 text-lg font-semibold tracking-[-0.03em]">
            Timetable unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-black/40">
            {error}
          </p>

          <button
            onClick={fetchTimetable}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-[10px] font-semibold text-white transition hover:opacity-80"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 py-6">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.08] bg-white shadow-sm">
              <CalendarDays size={15} />
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/30">
              Weekly Schedule
            </span>
          </div>

          <h1 className="text-[30px] font-semibold tracking-[-0.055em] sm:text-[38px]">
            Timetable
          </h1>

          <p className="mt-2 max-w-xl text-[11px] leading-5 text-black/40">
            Your weekly class schedule, subjects, faculty, and classroom
            information.
          </p>
        </div>

        <button
          onClick={fetchTimetable}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-4 py-2.5 text-[10px] font-semibold text-black/60 shadow-sm backdrop-blur-xl transition hover:bg-black/[0.04] hover:text-black"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* =========================================
          QUICK INFO
      ========================================= */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Classes
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {timetable.length}
          </p>

          <p className="mt-1 text-[9px] text-black/35">Weekly classes</p>
        </div>

        <div className="rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Days
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {groupedTimetable.length}
          </p>

          <p className="mt-1 text-[9px] text-black/35">Active class days</p>
        </div>

        <div className="col-span-2 rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl sm:col-span-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Format
          </p>

          <p className="mt-3 text-lg font-semibold tracking-[-0.04em]">
            Weekly
          </p>

          <p className="mt-1 text-[9px] text-black/35">Semester schedule</p>
        </div>
      </div>

      {/* =========================================
          EMPTY STATE
      ========================================= */}

      {timetable.length === 0 ? (
        <div className="rounded-[28px] border border-black/[0.08] bg-white/60 p-12 text-center shadow-sm backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.05]">
            <CalendarDays size={21} className="text-black/45" />
          </div>

          <h3 className="mt-5 text-base font-semibold">
            No timetable available
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-black/35">
            Your class timetable has not been published yet.
          </p>
        </div>
      ) : (
        /* =========================================
           DAYS
        ========================================= */

        <div className="space-y-6">
          {groupedTimetable.map(([day, classes]) => (
            <div key={day}>
              {/* DAY HEADER */}

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                    <CalendarDays size={15} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold tracking-[-0.02em]">
                      {day}
                    </h2>

                    <p className="text-[8px] uppercase tracking-[0.15em] text-black/30">
                      {classes.length}{" "}
                      {classes.length === 1 ? "class" : "classes"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CLASSES */}

              <div className="grid gap-3 lg:grid-cols-2">
                {classes.map((item, index) => (
                  <div
                    key={item?._id || item?.id || index}
                    className="group rounded-[26px] border border-black/[0.08] bg-white/65 p-5 shadow-[0_15px_55px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white hover:shadow-[0_25px_70px_rgba(0,0,0,0.15)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.05] transition-colors group-hover:bg-white/10">
                          <BookOpen
                            size={16}
                            className="text-black/60 group-hover:text-white"
                          />
                        </div>

                        <div>
                          <p className="text-[12px] font-semibold tracking-[-0.02em]">
                            {getSubject(item)}
                          </p>

                          {getSubjectCode(item) && (
                            <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.16em] text-black/30 group-hover:text-white/40">
                              {getSubjectCode(item)}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="rounded-full bg-black/[0.05] px-2.5 py-1.5 text-[8px] font-semibold text-black/45 group-hover:bg-white/10 group-hover:text-white/60">
                        Class {index + 1}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-2xl bg-black/[0.035] p-3 group-hover:bg-white/[0.07]">
                        <div className="flex items-center gap-2">
                          <Clock3 size={12} />

                          <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-black/30 group-hover:text-white/40">
                            Time
                          </span>
                        </div>

                        <p className="mt-2 text-[9px] font-semibold">
                          {getTime(item)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black/[0.035] p-3 group-hover:bg-white/[0.07]">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} />

                          <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-black/30 group-hover:text-white/40">
                            Room
                          </span>
                        </div>

                        <p className="mt-2 text-[9px] font-semibold">
                          {getRoom(item)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black/[0.035] p-3 group-hover:bg-white/[0.07]">
                        <div className="flex items-center gap-2">
                          <UserRound size={12} />

                          <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-black/30 group-hover:text-white/40">
                            Faculty
                          </span>
                        </div>

                        <p className="mt-2 truncate text-[9px] font-semibold">
                          {getTeacher(item)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StudentTimetable;
