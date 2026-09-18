import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Flame,
  ArrowUpRight,
  Activity,
  Target,
} from "lucide-react";
import api from "../services/api";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/attendance/my-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAttendance(response.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);

      setError(
        err.response?.data?.message || "Unable to load your attendance.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const summary = useMemo(() => {
    const data = attendance?.summary || attendance || {};

    const present =
      Number(data.present ?? data.presentCount ?? data.totalPresent ?? 0) || 0;

    const absent =
      Number(data.absent ?? data.absentCount ?? data.totalAbsent ?? 0) || 0;

    const late =
      Number(data.late ?? data.lateCount ?? data.totalLate ?? 0) || 0;

    const totalClasses =
      Number(data.totalClasses ?? data.total ?? present + absent + late) || 0;

    let percentage = Number(
      data.attendancePercentage ?? data.percentage ?? data.attendance ?? 0,
    );

    if (percentage <= 1 && percentage > 0) {
      percentage *= 100;
    }

    percentage = Math.round(percentage);

    return {
      present,
      absent,
      late,
      totalClasses,
      percentage,
    };
  }, [attendance]);

  const subjects = useMemo(() => {
    const possibleData =
      attendance?.subjects ||
      attendance?.subjectAttendance ||
      attendance?.data ||
      [];

    return Array.isArray(possibleData) ? possibleData : [];
  }, [attendance]);

  const getSubjectName = (item) => {
    return (
      item.subject?.name ||
      item.subjectName ||
      item.name ||
      item.subject?.code ||
      item.code ||
      "Subject"
    );
  };

  const getSubjectCode = (item) => {
    return item.subject?.code || item.code || "—";
  };

  const getPercentage = (item) => {
    let percentage = Number(
      item.attendancePercentage ?? item.percentage ?? item.attendance ?? 0,
    );

    if (percentage <= 1 && percentage > 0) {
      percentage *= 100;
    }

    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  const getStatus = (percentage) => {
    if (percentage >= 85) {
      return {
        label: "Excellent",
        text: "text-black",
        bg: "bg-black/[0.05]",
      };
    }

    if (percentage >= 75) {
      return {
        label: "Good",
        text: "text-black/65",
        bg: "bg-black/[0.04]",
      };
    }

    return {
      label: "Attention",
      text: "text-black/45",
      bg: "bg-black/[0.06]",
    };
  };

  const status = getStatus(summary.percentage);

  const attendanceRate =
    summary.totalClasses > 0
      ? Math.round((summary.present / summary.totalClasses) * 100)
      : summary.percentage;

  return (
    <section className="space-y-7 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
            <Activity size={13} />
            Academic Performance
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            Attendance
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
            Keep track of your class attendance and stay on top of your academic
            progress.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAttendance}
          className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium text-black/65 shadow-sm transition-all duration-200 hover:border-black hover:bg-black hover:text-white"
        >
          <RefreshCw
            size={14}
            className="transition-transform duration-500 group-hover:rotate-180"
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_15px_45px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
              <AlertCircle size={17} className="text-black/60" />
            </div>

            <div>
              <p className="text-sm font-semibold text-black">
                Something went wrong
              </p>

              <p className="mt-1 text-xs text-black/45">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAttendance}
            className="cursor-pointer rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-black/80"
          >
            Try Again
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-[260px] animate-pulse rounded-[30px] bg-black/[0.05]" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[24px] bg-black/[0.05]"
              />
            ))}
          </div>

          <div className="h-72 animate-pulse rounded-[28px] bg-black/[0.05]" />
        </div>
      ) : (
        <>
          {/* HERO ATTENDANCE CARD */}
          <div className="relative overflow-hidden rounded-[30px] bg-black p-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.14)] sm:p-8">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-8 top-8 h-32 w-32 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-white/[0.03]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  <Target size={13} />
                  Overall Attendance
                </div>

                <h2 className="mt-4 max-w-lg text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                  Your attendance is{" "}
                  <span className="text-white/55">
                    {status.label.toLowerCase()}.
                  </span>
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
                  Attend your upcoming classes regularly to maintain a healthy
                  academic attendance record.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[11px] text-white/65">
                    {summary.totalClasses} total classes
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[11px] text-white/65">
                    {summary.present} present
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[11px] text-white/65">
                    {summary.absent} absent
                  </div>
                </div>
              </div>

              {/* CIRCLE */}
              <div className="flex justify-start lg:justify-end">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-white/10 sm:h-48 sm:w-48">
                  <div
                    className="absolute inset-[-10px] rounded-full"
                    style={{
                      background: `conic-gradient(white ${summary.percentage * 3.6}deg, transparent 0deg)`,
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                    }}
                  />

                  <div className="text-center">
                    <p className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                      {summary.percentage}%
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
                      Attendance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <TrendingUp size={17} className="text-black/60" />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-black/20 transition-all duration-200 group-hover:text-black"
                />
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-black/35">
                Attendance
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {summary.percentage}%
              </p>

              <p className="mt-1 text-[11px] text-black/35">
                Overall percentage
              </p>
            </div>

            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <CheckCircle2 size={17} className="text-black/60" />
                </div>

                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/45">
                  Present
                </span>
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-black/35">
                Classes Attended
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {summary.present}
              </p>

              <p className="mt-1 text-[11px] text-black/35">Classes attended</p>
            </div>

            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <XCircle size={17} className="text-black/60" />
                </div>

                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/45">
                  Absent
                </span>
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-black/35">
                Missed Classes
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {summary.absent}
              </p>

              <p className="mt-1 text-[11px] text-black/35">Classes missed</p>
            </div>

            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <Clock3 size={17} className="text-black/60" />
                </div>

                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/45">
                  Late
                </span>
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-black/35">
                Late Arrivals
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {summary.late}
              </p>

              <p className="mt-1 text-[11px] text-black/35">Late attendance</p>
            </div>
          </div>

          {/* PERFORMANCE + STREAK */}
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            {/* PERFORMANCE */}
            <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_15px_50px_rgba(0,0,0,0.04)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                    Attendance Health
                  </p>

                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                    Overall performance
                  </h3>
                </div>

                <div
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${status.bg} ${status.text}`}
                >
                  {status.label}
                </div>
              </div>

              <div className="mt-7">
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-xs text-black/40">
                    Current attendance
                  </span>

                  <span className="text-sm font-semibold">
                    {summary.percentage}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-700"
                    style={{
                      width: `${summary.percentage}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-black/25">
                  <span>0%</span>
                  <span>75% target</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] bg-black/[0.035] p-4">
                  <p className="text-[9px] uppercase tracking-wider text-black/30">
                    Present Rate
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {attendanceRate}%
                  </p>
                </div>

                <div className="rounded-[18px] bg-black/[0.035] p-4">
                  <p className="text-[9px] uppercase tracking-wider text-black/30">
                    Total Classes
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {summary.totalClasses}
                  </p>
                </div>

                <div className="rounded-[18px] bg-black/[0.035] p-4">
                  <p className="text-[9px] uppercase tracking-wider text-black/30">
                    Late Arrivals
                  </p>

                  <p className="mt-2 text-lg font-semibold">{summary.late}</p>
                </div>
              </div>
            </div>

            {/* STREAK */}
            <div className="relative overflow-hidden rounded-[28px] bg-black p-6 text-white shadow-[0_15px_50px_rgba(0,0,0,0.1)] sm:p-7">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/[0.08]">
                  <Flame size={19} />
                </div>

                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Attendance Streak
                </p>

                <p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
                  {summary.present > 0 ? summary.present : 0}
                </p>

                <p className="mt-1 text-sm text-white/40">classes attended</p>

                <div className="mt-7 flex items-center gap-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full ${
                        index < Math.min(summary.present, 7)
                          ? "bg-white"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-3 text-[10px] text-white/30">
                  Keep showing up consistently.
                </p>
              </div>
            </div>
          </div>

          {/* SUBJECT ATTENDANCE */}
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_15px_50px_rgba(0,0,0,0.04)] sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                  Subject Breakdown
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  Attendance by subject
                </h3>
              </div>

              <p className="text-xs text-black/35">
                {subjects.length}{" "}
                {subjects.length === 1 ? "subject" : "subjects"} tracked
              </p>
            </div>

            {subjects.length > 0 ? (
              <div className="mt-6 grid gap-3">
                {subjects.map((item, index) => {
                  const percentage = getPercentage(item);
                  const subjectStatus = getStatus(percentage);

                  return (
                    <div
                      key={item._id || item.subject?._id || index}
                      className="group rounded-[22px] border border-black/[0.08] p-4 transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-black/[0.05] transition-colors group-hover:bg-white/[0.08]">
                            <CalendarCheck
                              size={17}
                              className="text-black/55 group-hover:text-white"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {getSubjectName(item)}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-wider text-black/30 group-hover:text-white/35">
                              {getSubjectCode(item)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:min-w-[300px]">
                          <div className="flex-1">
                            <div className="mb-2 flex justify-between text-[10px]">
                              <span className="text-black/35 group-hover:text-white/35">
                                Progress
                              </span>

                              <span className="font-semibold">
                                {percentage}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-black/[0.06] group-hover:bg-white/10">
                              <div
                                className="h-full rounded-full bg-black transition-all duration-500 group-hover:bg-white"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div
                            className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold ${subjectStatus.bg} ${subjectStatus.text} group-hover:bg-white/[0.08] group-hover:text-white`}
                          >
                            {subjectStatus.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border border-dashed border-black/10 bg-black/[0.02] px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05]">
                  <CalendarCheck size={19} className="text-black/35" />
                </div>

                <h4 className="mt-4 text-sm font-semibold">
                  No subject attendance yet
                </h4>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-black/40">
                  Subject-wise attendance will appear here once attendance
                  records are available.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default StudentAttendance;
