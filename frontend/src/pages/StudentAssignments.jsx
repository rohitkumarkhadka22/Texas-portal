import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import api from "../services/api";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/assignments/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setAssignments(
        Array.isArray(data) ? data : data.assignments || data.data || [],
      );
    } catch (err) {
      console.error("Failed to fetch assignments:", err);

      setError(
        err.response?.data?.message || "Unable to load your assignments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getDueDate = (assignment) => {
    return assignment.dueDate ? new Date(assignment.dueDate) : null;
  };

  const getDeadlineInfo = (assignment) => {
    const dueDate = getDueDate(assignment);

    if (!dueDate || Number.isNaN(dueDate.getTime())) {
      return {
        label: "No deadline",
        type: "normal",
        days: null,
      };
    }

    const now = new Date();

    const difference = dueDate.getTime() - now.getTime();

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (difference < 0) {
      return {
        label: "Overdue",
        type: "overdue",
        days,
      };
    }

    if (days === 0) {
      return {
        label: "Due today",
        type: "today",
        days,
      };
    }

    if (days === 1) {
      return {
        label: "Due tomorrow",
        type: "tomorrow",
        days,
      };
    }

    if (days <= 3) {
      return {
        label: `${days} days left`,
        type: "soon",
        days,
      };
    }

    return {
      label: `${days} days left`,
      type: "normal",
      days,
    };
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const title = assignment.title || "";
      const description = assignment.description || "";
      const subject = assignment.subject?.name || assignment.subjectName || "";
      const code = assignment.subject?.code || "";
      const teacher =
        assignment.teacher?.name || assignment.teacher?.email || "";

      const matchesSearch =
        !query ||
        `${title} ${description} ${subject} ${code} ${teacher}`
          .toLowerCase()
          .includes(query);

      const deadline = getDeadlineInfo(assignment);

      let matchesFilter = true;

      if (filter === "urgent") {
        matchesFilter =
          deadline.type === "today" ||
          deadline.type === "tomorrow" ||
          deadline.type === "soon";
      }

      if (filter === "overdue") {
        matchesFilter = deadline.type === "overdue";
      }

      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  const totalAssignments = assignments.length;

  const overdueCount = assignments.filter(
    (assignment) => getDeadlineInfo(assignment).type === "overdue",
  ).length;

  const urgentCount = assignments.filter((assignment) => {
    const type = getDeadlineInfo(assignment).type;

    return type === "today" || type === "tomorrow" || type === "soon";
  }).length;

  const upcomingCount = totalAssignments - overdueCount;

  return (
    <section className="space-y-7 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
            <Sparkles size={13} />
            Academic Workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Assignments
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
            Stay organized, keep track of deadlines, and never miss an academic
            task.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAssignments}
          className="group flex w-fit cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium text-black/60 shadow-sm transition-all duration-200 hover:border-black hover:bg-black hover:text-white"
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
        <div className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05]">
              <FileText size={17} className="text-black/55" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Unable to load assignments
              </p>

              <p className="mt-1 text-xs text-black/40">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAssignments}
            className="cursor-pointer rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-black/80"
          >
            Try Again
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-52 animate-pulse rounded-[30px] bg-black/[0.05]" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[24px] bg-black/[0.05]"
              />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-[28px] bg-black/[0.05]"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* TOP FEATURE */}
          <div className="relative overflow-hidden rounded-[30px] bg-black p-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.13)] sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-16 top-10 h-24 w-24 rounded-full border border-white/[0.06]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35">
                  <Flame size={13} />
                  Stay ahead
                </div>

                <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  Your academic tasks,
                  <span className="text-white/45"> all in one place.</span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                  Review upcoming work, check deadlines, and keep your semester
                  moving forward.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.06] px-5 py-4">
                  <p className="text-2xl font-semibold">{totalAssignments}</p>

                  <p className="mt-1 text-[9px] uppercase tracking-wider text-white/30">
                    Total
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-white/[0.06] px-5 py-4">
                  <p className="text-2xl font-semibold">{urgentCount}</p>

                  <p className="mt-1 text-[9px] uppercase tracking-wider text-white/30">
                    Urgent
                  </p>
                </div>

                <div className="col-span-2 rounded-[20px] border border-white/10 bg-white/[0.06] px-5 py-4 sm:col-span-1">
                  <p className="text-2xl font-semibold">{upcomingCount}</p>

                  <p className="mt-1 text-[9px] uppercase tracking-wider text-white/30">
                    Upcoming
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <FileText size={17} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-black/20 transition group-hover:text-black"
                />
              </div>

              <p className="mt-5 text-[10px] uppercase tracking-[0.17em] text-black/35">
                Assignments
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {totalAssignments}
              </p>

              <p className="mt-1 text-[11px] text-black/35">Total assigned</p>
            </div>

            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <Clock3 size={17} />
                </div>

                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/45">
                  Soon
                </span>
              </div>

              <p className="mt-5 text-[10px] uppercase tracking-[0.17em] text-black/35">
                Urgent
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {urgentCount}
              </p>

              <p className="mt-1 text-[11px] text-black/35">
                Due within 3 days
              </p>
            </div>

            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <CalendarDays size={17} />
                </div>

                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/45">
                  Active
                </span>
              </div>

              <p className="mt-5 text-[10px] uppercase tracking-[0.17em] text-black/35">
                Upcoming
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {upcomingCount}
              </p>

              <p className="mt-1 text-[11px] text-black/35">Not overdue</p>
            </div>

            <div className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/[0.05]">
                  <CheckCircle2 size={17} />
                </div>

                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/45">
                  Status
                </span>
              </div>

              <p className="mt-5 text-[10px] uppercase tracking-[0.17em] text-black/35">
                Overdue
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {overdueCount}
              </p>

              <p className="mt-1 text-[11px] text-black/35">Need attention</p>
            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex flex-col gap-3 rounded-[24px] border border-black/10 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.03)] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
              <Search size={17} className="shrink-0 text-black/30" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments, subjects or teachers..."
                className="w-full bg-transparent py-2 text-xs text-black outline-none placeholder:text-black/25"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {[
                ["all", "All"],
                ["urgent", "Urgent"],
                ["overdue", "Overdue"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[10px] font-semibold transition-all ${
                    filter === value
                      ? "bg-black text-white"
                      : "bg-black/[0.04] text-black/45 hover:bg-black hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ASSIGNMENT LIST */}
          {filteredAssignments.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredAssignments.map((assignment, index) => {
                const deadline = getDeadlineInfo(assignment);

                const subjectName =
                  assignment.subject?.name ||
                  assignment.subjectName ||
                  "Subject";

                const subjectCode = assignment.subject?.code || "—";

                const teacherName =
                  assignment.teacher?.name ||
                  assignment.teacher?.email ||
                  "Teacher";

                return (
                  <article
                    key={assignment._id || index}
                    className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_15px_50px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-[0_20px_55px_rgba(0,0,0,0.08)]"
                  >
                    {/* Top line */}
                    <div className="absolute left-0 top-0 h-1 w-full bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-black/[0.05] transition-all duration-300 group-hover:bg-black group-hover:text-white">
                          <BookOpen size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                            {subjectCode}
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-lg font-semibold tracking-[-0.035em]">
                            {assignment.title || "Untitled Assignment"}
                          </h3>
                        </div>
                      </div>

                      <div
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold ${
                          deadline.type === "overdue"
                            ? "bg-black text-white"
                            : deadline.type === "today" ||
                                deadline.type === "tomorrow"
                              ? "bg-black/[0.09] text-black"
                              : "bg-black/[0.04] text-black/50"
                        }`}
                      >
                        {deadline.label}
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-2 text-xs leading-5 text-black/45">
                      {assignment.description ||
                        "No description provided for this assignment."}
                    </p>

                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[17px] bg-black/[0.035] p-3.5">
                        <div className="flex items-center gap-2 text-black/30">
                          <UserRound size={13} />

                          <span className="text-[9px] uppercase tracking-wider">
                            Teacher
                          </span>
                        </div>

                        <p className="mt-2 truncate text-xs font-medium text-black/70">
                          {teacherName}
                        </p>
                      </div>

                      <div className="rounded-[17px] bg-black/[0.035] p-3.5">
                        <div className="flex items-center gap-2 text-black/30">
                          <CalendarDays size={13} />

                          <span className="text-[9px] uppercase tracking-wider">
                            Due date
                          </span>
                        </div>

                        <p className="mt-2 text-xs font-medium text-black/70">
                          {formatDate(getDueDate(assignment))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.16em] text-black/30">
                          Total marks
                        </span>

                        <p className="mt-1 text-sm font-semibold">
                          {assignment.totalMarks ?? "—"}
                        </p>
                      </div>

                      {assignment.attachment ? (
                        <div className="flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-2 text-[9px] font-semibold text-black/50">
                          <FileText size={12} />
                          Attachment
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[9px] text-black/25">
                          <CheckCircle2 size={12} />
                          No attachment
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-black/10 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-black/[0.05]">
                <Search size={20} className="text-black/30" />
              </div>

              <h3 className="mt-5 text-base font-semibold">
                No assignments found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">
                Try changing your search or selecting another assignment filter.
              </p>

              {(search || filter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="mt-5 cursor-pointer rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-black/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default StudentAssignments;
