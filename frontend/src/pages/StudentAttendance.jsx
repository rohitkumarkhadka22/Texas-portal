import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";

const StudentAttendance = () => {
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [summaryResponse, attendanceResponse] = await Promise.all([
          api.get("/attendance/my-summary", config),
          api.get("/attendance/my-attendance", config),
        ]);

        const summaryData = summaryResponse.data;
        const attendanceData = attendanceResponse.data;

        setSummary(
          summaryData?.summary || summaryData?.data || summaryData || null,
        );

        setAttendance(
          Array.isArray(attendanceData)
            ? attendanceData
            : attendanceData?.attendance || attendanceData?.data || [],
        );
      } catch (err) {
        console.error("Failed to fetch attendance:", err);

        setError(
          err.response?.data?.message || "Unable to load your attendance.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getNumber = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !Number.isNaN(Number(value))
      ) {
        return Number(value);
      }
    }

    return 0;
  };

  const totalClasses = getNumber(
    summary?.totalClasses,
    summary?.total,
    summary?.classes,
  );

  const present = getNumber(summary?.present, summary?.presentClasses);

  const absent = getNumber(summary?.absent, summary?.absentClasses);

  const late = getNumber(summary?.late, summary?.lateClasses);

  const calculatedPercentage =
    totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(1) : "0.0";

  const percentage = getNumber(
    summary?.attendancePercentage,
    summary?.percentage,
    summary?.attendanceRate,
    calculatedPercentage,
  );

  const getStatus = (record) => {
    const status = String(record?.status || "").toLowerCase();

    if (status === "present" || status === "p" || record?.isPresent === true) {
      return "Present";
    }

    if (status === "late" || status === "l") {
      return "Late";
    }

    return "Absent";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-black/30">
          Academic
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-4xl">
          Attendance
        </h1>

        <p className="mt-2 max-w-xl text-[11px] leading-5 text-black/40">
          Track your class attendance, presence, absences, and overall
          attendance percentage.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[20px] border border-black/[0.06] bg-white/60 p-5"
              >
                <div className="h-8 w-8 rounded-[11px] bg-black/[0.07]" />
                <div className="mt-5 h-6 w-16 rounded bg-black/[0.07]" />
                <div className="mt-2 h-3 w-24 rounded bg-black/[0.05]" />
              </div>
            ))}
          </div>

          <div className="animate-pulse rounded-[24px] border border-black/[0.06] bg-white/60 p-6">
            <div className="h-5 w-40 rounded bg-black/[0.07]" />
            <div className="mt-6 h-3 w-full rounded bg-black/[0.05]" />
            <div className="mt-4 h-3 w-3/4 rounded bg-black/[0.05]" />
          </div>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="glass-light rounded-[24px] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05]">
            <CalendarCheck size={20} className="text-black/40" />
          </div>

          <h2 className="mt-4 text-sm font-semibold">
            Unable to load attendance
          </h2>

          <p className="mt-2 text-[10px] leading-5 text-black/40">{error}</p>
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* TOTAL */}
            <div className="glass-light rounded-[20px] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                  Total
                </p>

                <CalendarCheck size={15} className="text-black/35" />
              </div>

              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                {totalClasses}
              </p>

              <p className="mt-1 text-[9px] text-black/35">Classes</p>
            </div>

            {/* PRESENT */}
            <div className="glass-light rounded-[20px] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                  Present
                </p>

                <CheckCircle2 size={15} className="text-black/35" />
              </div>

              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                {present}
              </p>

              <p className="mt-1 text-[9px] text-black/35">Attended</p>
            </div>

            {/* ABSENT */}
            <div className="glass-light rounded-[20px] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                  Absent
                </p>

                <XCircle size={15} className="text-black/35" />
              </div>

              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                {absent}
              </p>

              <p className="mt-1 text-[9px] text-black/35">Missed</p>
            </div>

            {/* LATE */}
            <div className="glass-light rounded-[20px] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                  Late
                </p>

                <Clock3 size={15} className="text-black/35" />
              </div>

              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                {late}
              </p>

              <p className="mt-1 text-[9px] text-black/35">Late arrivals</p>
            </div>
          </div>

          {/* OVERALL ATTENDANCE */}
          <div className="glass-light rounded-[24px] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/30">
                  Overall Attendance
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {percentage.toFixed(1)}%
                </h2>

                <p className="mt-1 text-[10px] text-black/40">
                  Based on your recorded classes
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-black text-white">
                <TrendingUp size={21} strokeWidth={1.6} />
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mt-6">
              <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-black transition-all duration-700"
                  style={{
                    width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-[8px] uppercase tracking-[0.15em] text-black/25">
                  0%
                </span>

                <span className="text-[8px] uppercase tracking-[0.15em] text-black/25">
                  100%
                </span>
              </div>
            </div>
          </div>

          {/* ATTENDANCE HISTORY */}
          <div className="glass-light overflow-hidden rounded-[24px]">
            <div className="border-b border-black/[0.07] px-5 py-5 sm:px-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/30">
                Records
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                Attendance History
              </h2>
            </div>

            {attendance.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05]">
                  <CalendarCheck size={20} className="text-black/40" />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  No attendance records
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-black/40">
                  Your attendance records will appear here once classes are
                  marked.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-black/[0.06]">
                      <th className="px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30 sm:px-6">
                        Date
                      </th>

                      <th className="px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                        Subject
                      </th>

                      <th className="px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                        Status
                      </th>

                      <th className="px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                        Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((record, index) => {
                      const status = getStatus(record);

                      return (
                        <tr
                          key={record?._id || record?.id || index}
                          className="border-b border-black/[0.05] last:border-0"
                        >
                          <td className="px-5 py-4 text-[10px] font-medium sm:px-6">
                            {formatDate(
                              record?.date ||
                                record?.attendanceDate ||
                                record?.createdAt,
                            )}
                          </td>

                          <td className="px-5 py-4 text-[10px] text-black/65">
                            {record?.subject?.name ||
                              record?.subject?.title ||
                              record?.subjectName ||
                              record?.subject?.code ||
                              "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] ${
                                status === "Present"
                                  ? "border-black/[0.10] bg-black/[0.05] text-black"
                                  : status === "Late"
                                    ? "border-black/[0.10] bg-black/[0.035] text-black/65"
                                    : "border-black/[0.08] bg-black/[0.02] text-black/45"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-[10px] text-black/40">
                            {record?.remarks || record?.note || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default StudentAttendance;
