import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  XCircle,
} from "lucide-react";

import api from "../services/api";

const StudentExaminations = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [examFilter, setExamFilter] = useState("all");

  const fetchExams = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/exams/student");

      const data = response.data || {};

      setExams(Array.isArray(data.examSchedules) ? data.examSchedules : []);
    } catch (err) {
      console.error("Get student examinations error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your examination schedule right now.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const formatDate = (date) => {
    if (!date) return "Date TBA";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const shortDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  const getDuration = (start, end, duration) => {
    if (duration) {
      return `${duration} min`;
    }

    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);

    if (!startMinutes || !endMinutes || endMinutes <= startMinutes) {
      return "—";
    }

    return `${endMinutes - startMinutes} min`;
  };

  const getExamTypeLabel = (type) => {
    if (!type) return "Examination";

    return String(type)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getExamTypeClass = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("final") || value.includes("board")) {
      return "bg-black text-white border-black";
    }

    return "bg-white text-black border-black/15";
  };

  const getExamStatus = (date) => {
    if (!date) {
      return {
        label: "Date TBA",
        className: "bg-black/5 text-black/40",
      };
    }

    const examDate = new Date(date);

    if (Number.isNaN(examDate.getTime())) {
      return {
        label: "Scheduled",
        className: "bg-black/5 text-black/45",
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const difference = examDate.getTime() - today.getTime();

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return {
        label: "Completed",
        className: "bg-black/5 text-black/35",
      };
    }

    if (days === 0) {
      return {
        label: "Today",
        className: "bg-black text-white",
      };
    }

    if (days === 1) {
      return {
        label: "Tomorrow",
        className: "bg-black text-white",
      };
    }

    if (days <= 7) {
      return {
        label: `${days} days`,
        className: "bg-black text-white",
      };
    }

    return {
      label: "Upcoming",
      className: "bg-black/5 text-black/45",
    };
  };

  const filteredExams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...exams]
      .filter((exam) => {
        const subjectName = exam?.subject?.name?.toLowerCase() || "";

        const subjectCode = exam?.subject?.code?.toLowerCase() || "";

        const examType = exam?.examType?.toLowerCase() || "";

        const room = exam?.room?.toLowerCase() || "";

        const section = exam?.section?.toLowerCase() || "";

        const matchesSearch =
          !query ||
          subjectName.includes(query) ||
          subjectCode.includes(query) ||
          examType.includes(query) ||
          room.includes(query) ||
          section.includes(query);

        const matchesFilter =
          examFilter === "all" || exam?.examType?.toLowerCase() === examFilter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = new Date(a?.examDate).getTime();
        const dateB = new Date(b?.examDate).getTime();

        if (!Number.isNaN(dateA) && !Number.isNaN(dateB) && dateA !== dateB) {
          return dateA - dateB;
        }

        return parseTime(a?.startTime) - parseTime(b?.startTime);
      });
  }, [exams, searchTerm, examFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = exams.filter((exam) => {
      if (!exam?.examDate) return false;

      const date = new Date(exam.examDate);

      if (Number.isNaN(date.getTime())) return false;

      date.setHours(0, 0, 0, 0);

      return date >= now;
    });

    const today = exams.filter((exam) => {
      if (!exam?.examDate) return false;

      const date = new Date(exam.examDate);

      if (Number.isNaN(date.getTime())) return false;

      date.setHours(0, 0, 0, 0);

      return date.getTime() === now.getTime();
    });

    const completed = exams.filter((exam) => {
      if (!exam?.examDate) return false;

      const date = new Date(exam.examDate);

      if (Number.isNaN(date.getTime())) return false;

      date.setHours(0, 0, 0, 0);

      return date < now;
    });

    const uniqueSubjects = new Set(
      exams.map((exam) => exam?.subject?.code).filter(Boolean),
    ).size;

    return {
      total: exams.length,
      upcoming: upcoming.length,
      today: today.length,
      completed: completed.length,
      subjects: uniqueSubjects,
    };
  }, [exams]);

  const nextExam = useMemo(() => {
    const now = new Date();

    const upcoming = exams
      .filter((exam) => {
        if (!exam?.examDate) return false;

        const date = new Date(exam.examDate);

        if (Number.isNaN(date.getTime())) return false;

        date.setHours(0, parseTime(exam?.startTime), 0, 0);

        return date.getTime() >= now.getTime();
      })
      .sort((a, b) => {
        const dateA = new Date(a.examDate);
        const dateB = new Date(b.examDate);

        dateA.setHours(0, parseTime(a?.startTime), 0, 0);

        dateB.setHours(0, parseTime(b?.startTime), 0, 0);

        return dateA.getTime() - dateB.getTime();
      });

    return upcoming[0] || null;
  }, [exams]);

  const resetFilters = () => {
    setSearchTerm("");
    setExamFilter("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="h-10 w-52 animate-pulse rounded-xl bg-black/5" />

          <div className="h-[270px] animate-pulse rounded-[30px] bg-black/5" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-[24px] bg-black/5"
              />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-[28px] bg-black/5"
              />
            ))}
          </div>
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
              Examination schedule unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/45">{error}</p>

            <button
              onClick={() => fetchExams()}
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
              Examination center
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Examinations
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Stay ahead of your examination schedule with dates, timings, rooms
              and important instructions.
            </p>
          </div>

          <button
            onClick={() => fetchExams(true)}
            disabled={refreshing}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh schedule
          </button>
        </div>

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[30px] bg-black px-7 py-8 text-white sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -bottom-32 right-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                <Timer size={12} />
                Examination schedule
              </div>

              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                Prepare with clarity.
                <br />
                Arrive with confidence.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                Your examination schedule is organized with everything you need
                before entering the exam room.
              </p>

              {nextExam && (
                <div className="mt-7 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                    <AlertCircle size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                      Next examination
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold">
                      {nextExam?.subject?.name || "Upcoming examination"}
                    </p>

                    <p className="mt-0.5 text-[11px] text-white/40">
                      {shortDate(nextExam?.examDate)} ·{" "}
                      {formatTime(nextExam?.startTime)}
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
                    {stats.upcoming}
                  </p>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Upcoming exams
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
                <FileText size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Exams
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-black/40">
              Total scheduled examinations
            </p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <Clock3 size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Upcoming
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {stats.upcoming}
            </p>

            <p className="mt-1 text-xs text-black/40">Examinations remaining</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <CheckCircle2 size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Completed
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {stats.completed}
            </p>

            <p className="mt-1 text-xs text-black/40">Examinations completed</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <BookOpen size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Subjects
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {stats.subjects}
            </p>

            <p className="mt-1 text-xs text-black/40">
              Subjects with examinations
            </p>
          </div>
        </section>

        {/* TODAY ALERT */}
        {stats.today > 0 && (
          <section className="mb-6 rounded-[26px] border border-black/10 bg-black p-5 text-white sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                  <AlertCircle size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Today
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    You have {stats.today} examination
                    {stats.today !== 1 ? "s" : ""} today.
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Check your room, reporting time and examination instructions
                    before leaving for campus.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExamFilter("all")}
                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white hover:text-black"
              >
                View schedule
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        )}

        {/* FILTER */}
        <section className="mb-6 rounded-[26px] border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject, code, room or exam type..."
                className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setExamFilter("all")}
                className={`cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  examFilter === "all"
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                }`}
              >
                All exams
              </button>

              <button
                onClick={() => setExamFilter("pre-board")}
                className={`cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  examFilter === "pre-board"
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                }`}
              >
                Pre-board
              </button>

              <button
                onClick={() => setExamFilter("final")}
                className={`cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  examFilter === "final"
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                }`}
              >
                Final
              </button>

              {(searchTerm || examFilter !== "all") && (
                <button
                  onClick={resetFilters}
                  className="cursor-pointer rounded-full px-3 py-2.5 text-xs font-semibold text-black/40 transition hover:bg-black/5 hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* EXAM LIST */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
                Examination calendar
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                Scheduled examinations
              </h3>
            </div>

            <span className="text-xs text-black/35">
              {filteredExams.length} shown
            </span>
          </div>

          {filteredExams.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
                <Search size={20} className="text-black/35" />
              </div>

              <h4 className="font-semibold">No examinations found</h4>

              <p className="mt-2 text-sm text-black/40">
                Try another search term or change the exam filter.
              </p>

              <button
                onClick={resetFilters}
                className="mt-5 cursor-pointer rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExams.map((exam, index) => {
                const status = getExamStatus(exam?.examDate);

                return (
                  <article
                    key={
                      exam?._id ||
                      `${exam?.subject?.code}-${exam?.examDate}-${index}`
                    }
                    className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.07)]"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-black/10 transition-all duration-300 group-hover:w-1.5 group-hover:bg-black" />

                    <div className="grid gap-6 lg:grid-cols-[230px_1fr_auto] lg:items-center">
                      {/* DATE */}
                      <div className="pl-2 lg:border-r lg:border-black/5 lg:pr-7">
                        <div className="flex items-center gap-2 text-black/30">
                          <CalendarDays size={13} />

                          <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                            Exam date
                          </span>
                        </div>

                        <p className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                          {shortDate(exam?.examDate)}
                        </p>

                        <p className="mt-1 text-xs text-black/35">
                          {formatDate(exam?.examDate).split(",")[0]}
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* SUBJECT */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${getExamTypeClass(
                              exam?.examType,
                            )}`}
                          >
                            {getExamTypeLabel(exam?.examType)}
                          </span>

                          {exam?.section && (
                            <span className="rounded-full bg-black/5 px-2.5 py-1 text-[9px] font-semibold text-black/40">
                              Section {exam.section}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-3 text-xl font-semibold tracking-tight">
                          {exam?.subject?.name || "Unknown subject"}
                        </h4>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/50">
                            <BookOpen size={13} />
                            {exam?.subject?.code || "Subject code unavailable"}
                          </span>

                          {exam?.room && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-black/40">
                              <MapPin size={13} />
                              Room {exam.room}
                            </span>
                          )}

                          {exam?.subject?.semester && (
                            <span className="text-xs text-black/30">
                              Semester {exam.subject.semester}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f7f5] p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                              <Clock3 size={15} />
                            </div>

                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/25">
                                Time
                              </p>

                              <p className="mt-0.5 text-xs font-semibold">
                                {formatTime(exam?.startTime)} —{" "}
                                {formatTime(exam?.endTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f7f5] p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                              <Timer size={15} />
                            </div>

                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/25">
                                Duration
                              </p>

                              <p className="mt-0.5 text-xs font-semibold">
                                {getDuration(
                                  exam?.startTime,
                                  exam?.endTime,
                                  exam?.duration,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SIDE */}
                      <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-5 lg:block lg:border-t-0 lg:pt-0 lg:text-right">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                            Venue
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {exam?.room ? `Room ${exam.room}` : "TBA"}
                          </p>
                        </div>

                        <div className="mt-0 flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 transition duration-300 group-hover:bg-black group-hover:text-white lg:ml-auto lg:mt-5">
                          <ArrowUpRight size={17} />
                        </div>
                      </div>
                    </div>

                    {exam?.instructions && (
                      <div className="mt-6 flex gap-3 rounded-2xl border border-black/5 bg-[#f7f7f5] p-4">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                          <FileText size={14} />
                        </div>

                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                            Examination instructions
                          </p>

                          <p className="mt-1 text-xs leading-5 text-black/50">
                            {exam.instructions}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER */}
        {exams.length > 0 && (
          <section className="mt-7 rounded-[28px] border border-black/10 bg-white p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
                    Exam preparation
                  </p>

                  <h4 className="mt-1 text-base font-semibold">
                    Your examination schedule is up to date.
                  </h4>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-black/40">
                    Check the schedule regularly for any published changes and
                    arrive prepared with enough time before your examination
                    begins.
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black/45">
                {stats.upcoming} upcoming
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentExaminations;
