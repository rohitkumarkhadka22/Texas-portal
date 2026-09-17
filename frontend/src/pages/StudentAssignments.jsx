import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileText,
} from "lucide-react";
import api from "../services/api";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchAssignments();
  }, []);

  const formatDate = (date) => {
    if (!date) return "No due date";

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

  const isOverdue = (date) => {
    if (!date) return false;

    const dueDate = new Date(date);

    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    return dueDate < new Date();
  };

  const getTeacherName = (assignment) => {
    return (
      assignment?.teacher?.name ||
      assignment?.teacher?.user?.name ||
      assignment?.teacher?.fullName ||
      "Instructor not assigned"
    );
  };

  const getSubjectName = (assignment) => {
    return (
      assignment?.subject?.name ||
      assignment?.subject?.title ||
      assignment?.subjectName ||
      assignment?.subject?.code ||
      "Subject"
    );
  };

  const publishedAssignments = assignments.filter(
    (assignment) => assignment?.isPublished !== false,
  );

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-black/30">
            Academic
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-4xl">
            Assignments
          </h1>

          <p className="mt-2 max-w-xl text-[11px] leading-5 text-black/40">
            Keep track of your coursework, deadlines, subjects, and assignment
            requirements.
          </p>
        </div>

        <div className="glass-light flex w-fit items-center gap-3 rounded-[18px] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-black/[0.05]">
            <ClipboardCheck size={16} strokeWidth={1.7} />
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-black/30">
              Available
            </p>

            <p className="mt-0.5 text-sm font-semibold text-black">
              {publishedAssignments.length} Assignments
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Total
              </p>

              <FileText size={15} className="text-black/35" />
            </div>

            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              {publishedAssignments.length}
            </p>

            <p className="mt-1 text-[9px] text-black/35">
              Published assignments
            </p>
          </div>

          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Upcoming
              </p>

              <CalendarDays size={15} className="text-black/35" />
            </div>

            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              {
                publishedAssignments.filter(
                  (assignment) => !isOverdue(assignment?.dueDate),
                ).length
              }
            </p>

            <p className="mt-1 text-[9px] text-black/35">Active deadlines</p>
          </div>

          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Subjects
              </p>

              <BookOpen size={15} className="text-black/35" />
            </div>

            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              {
                new Set(
                  publishedAssignments.map(
                    (assignment) =>
                      assignment?.subject?._id ||
                      assignment?.subject?.code ||
                      assignment?.subjectName ||
                      assignment?.subject,
                  ),
                ).size
              }
            </p>

            <p className="mt-1 text-[9px] text-black/35">With coursework</p>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-[22px] border border-black/[0.06] bg-white/60 p-5"
            >
              <div className="h-10 w-10 rounded-[13px] bg-black/[0.07]" />

              <div className="mt-5 h-4 w-3/4 rounded bg-black/[0.07]" />

              <div className="mt-3 h-3 w-1/2 rounded bg-black/[0.05]" />

              <div className="mt-7 h-3 w-full rounded bg-black/[0.05]" />

              <div className="mt-2 h-3 w-2/3 rounded bg-black/[0.05]" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="glass-light rounded-[24px] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05]">
            <FileText size={20} className="text-black/40" />
          </div>

          <h2 className="mt-4 text-sm font-semibold">
            Unable to load assignments
          </h2>

          <p className="mt-2 text-[10px] leading-5 text-black/40">{error}</p>
        </div>
      )}

      {/* ASSIGNMENTS */}
      {!loading && !error && (
        <div className="glass-light overflow-hidden rounded-[24px]">
          <div className="border-b border-black/[0.07] px-5 py-5 sm:px-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/30">
              Coursework
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Your Assignments
            </h2>
          </div>

          {publishedAssignments.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05]">
                <ClipboardCheck size={20} className="text-black/40" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                No assignments available
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-black/40">
                New assignments published by your instructors will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {publishedAssignments.map((assignment, index) => {
                const overdue = isOverdue(assignment?.dueDate);

                return (
                  <article
                    key={assignment?._id || assignment?.id || index}
                    className="group flex flex-col rounded-[21px] border border-black/[0.07] bg-white/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.14] hover:bg-black hover:text-white hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-black/[0.07] bg-black/[0.035] transition-colors duration-300 group-hover:border-white/10 group-hover:bg-white/10">
                        <FileText
                          size={18}
                          strokeWidth={1.6}
                          className="text-black/60 group-hover:text-white"
                        />
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.13em] ${
                          overdue
                            ? "border-black/[0.10] bg-black/[0.05] text-black/55 group-hover:border-white/10 group-hover:bg-white/10 group-hover:text-white/60"
                            : "border-black/[0.07] bg-black/[0.025] text-black/40 group-hover:border-white/10 group-hover:bg-white/10 group-hover:text-white/50"
                        }`}
                      >
                        {overdue ? "Overdue" : "Active"}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3 className="mt-6 line-clamp-2 text-base font-semibold tracking-[-0.025em]">
                      {assignment?.title || "Untitled Assignment"}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="mt-2 line-clamp-3 text-[10px] leading-5 text-black/40 group-hover:text-white/50">
                      {assignment?.description ||
                        "No description provided for this assignment."}
                    </p>

                    {/* SUBJECT */}
                    <div className="mt-5 flex items-center gap-2">
                      <BookOpen
                        size={13}
                        className="shrink-0 text-black/35 group-hover:text-white/40"
                      />

                      <span className="truncate text-[9px] font-medium text-black/55 group-hover:text-white/60">
                        {getSubjectName(assignment)}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-[13px] border border-black/[0.06] bg-black/[0.025] p-3 group-hover:border-white/10 group-hover:bg-white/[0.06]">
                        <p className="text-[8px] uppercase tracking-[0.14em] text-black/30 group-hover:text-white/35">
                          Due date
                        </p>

                        <p className="mt-1 text-[10px] font-semibold">
                          {formatDate(assignment?.dueDate)}
                        </p>
                      </div>

                      <div className="rounded-[13px] border border-black/[0.06] bg-black/[0.025] p-3 group-hover:border-white/10 group-hover:bg-white/[0.06]">
                        <p className="text-[8px] uppercase tracking-[0.14em] text-black/30 group-hover:text-white/35">
                          Marks
                        </p>

                        <p className="mt-1 text-[10px] font-semibold">
                          {assignment?.totalMarks ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-auto pt-5">
                      <div className="flex items-center justify-between border-t border-black/[0.06] pt-4 group-hover:border-white/10">
                        <div className="min-w-0">
                          <p className="text-[8px] uppercase tracking-[0.14em] text-black/30 group-hover:text-white/35">
                            Instructor
                          </p>

                          <p className="mt-1 truncate text-[9px] font-medium text-black/60 group-hover:text-white/65">
                            {getTeacherName(assignment)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white/60 text-black/50 transition-all group-hover:border-white/15 group-hover:bg-white/10 group-hover:text-white"
                          title="View assignment"
                        >
                          <ArrowUpRight size={14} strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default StudentAssignments;
