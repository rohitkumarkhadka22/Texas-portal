import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  Layers3,
  Search,
  Copy,
  Check,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/subjects/my-subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setSubjects(
        Array.isArray(data) ? data : data.subjects || data.data || [],
      );
    } catch (err) {
      console.error("Failed to fetch subjects:", err);

      setError(err.response?.data?.message || "Unable to load your subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const totalCredits = subjects.reduce(
    (total, subject) =>
      total + Number(subject.creditHours || subject.credits || 0),
    0,
  );

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter((subject) => {
      const teacher =
        subject.teacher?.name ||
        subject.teacher?.user?.name ||
        subject.teacher?.fullName ||
        "";

      return `${subject.name || ""} ${
        subject.code || ""
      } ${subject.course || ""} ${teacher}`
        .toLowerCase()
        .includes(query);
    });
  }, [subjects, search]);

  const getTeacherName = (subject) => {
    return (
      subject.teacher?.name ||
      subject.teacher?.user?.name ||
      subject.teacher?.fullName ||
      "Not assigned"
    );
  };

  const copyCode = async (code) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1500);
    } catch (err) {
      console.error("Failed to copy subject code:", err);
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-black/30">
            Academic
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-4xl">
            My Subjects
          </h1>

          <p className="mt-2 max-w-xl text-[11px] leading-5 text-black/40">
            View your enrolled subjects, course details, credits, and academic
            information.
          </p>
        </div>

        <div className="glass-light flex w-fit items-center gap-3 rounded-[18px] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-black/[0.05]">
            <BookOpen size={16} strokeWidth={1.7} />
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-black/30">
              Enrolled
            </p>

            <p className="mt-0.5 text-sm font-semibold text-black">
              {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      {!loading && !error && subjects.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[320px]">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="
                h-11 w-full
                rounded-[15px]
                border border-black/[0.08]
                bg-white/50
                pl-10 pr-4
                text-[11px]
                text-black
                outline-none
                transition-all duration-200
                placeholder:text-black/25
                focus:border-black/20
                focus:bg-white
              "
            />
          </div>

          <p className="text-[9px] uppercase tracking-[0.18em] text-black/30">
            Showing {filteredSubjects.length} of {subjects.length}
          </p>
        </div>
      )}

      {/* STATS */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Subjects
              </p>

              <BookOpen size={15} className="text-black/35" />
            </div>

            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              {subjects.length}
            </p>
          </div>

          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Credits
              </p>

              <Layers3 size={15} className="text-black/35" />
            </div>

            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              {totalCredits}
            </p>
          </div>

          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Semester
              </p>

              <GraduationCap size={15} className="text-black/35" />
            </div>

            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              {subjects[0]?.semester ? `S${subjects[0].semester}` : "—"}
            </p>
          </div>

          <div className="glass-light rounded-[20px] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                Course
              </p>

              <Clock3 size={15} className="text-black/35" />
            </div>

            <p className="mt-5 truncate text-sm font-semibold tracking-[-0.02em]">
              {subjects[0]?.course || "BIT"}
            </p>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="glass-light overflow-hidden rounded-[24px]">
        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/30">
              Current Semester
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Enrolled Courses
            </h2>
          </div>

          {!loading && !error && filteredSubjects.length > 0 && (
            <span className="hidden rounded-full bg-black/[0.04] px-3 py-1.5 text-[9px] font-medium text-black/40 sm:block">
              {filteredSubjects.length} courses
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[20px] border border-black/[0.06] bg-black/[0.025] p-5"
              >
                <div className="h-10 w-10 rounded-[13px] bg-black/[0.07]" />

                <div className="mt-5 h-4 w-3/4 rounded bg-black/[0.07]" />

                <div className="mt-3 h-3 w-1/2 rounded bg-black/[0.05]" />

                <div className="mt-7 h-3 w-full rounded bg-black/[0.05]" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="p-6">
            <div className="rounded-[18px] border border-black/[0.08] bg-black/[0.025] p-7 text-center">
              <p className="text-sm font-medium text-black">
                Unable to load subjects
              </p>

              <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-black/40">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchSubjects}
                className="
                  mt-5
                  inline-flex
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-[12px]
                  bg-black
                  px-4
                  py-2.5
                  text-[10px]
                  font-medium
                  text-white
                  transition-all duration-200
                  hover:bg-black/80
                "
              >
                <RefreshCw size={13} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredSubjects.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05]">
              <BookOpen size={20} className="text-black/40" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
              {search ? "No matching subjects" : "No subjects found"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-black/40">
              {search
                ? "Try searching with a different subject name, code, or instructor."
                : "Your enrolled subjects will appear here once they are assigned to your academic profile."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 cursor-pointer text-[10px] font-medium text-black underline underline-offset-4"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* SUBJECTS */}
        {!loading && !error && filteredSubjects.length > 0 && (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject, index) => {
              const teacherName = getTeacherName(subject);

              return (
                <article
                  key={subject._id || subject.id || index}
                  className="
                      group
                      relative
                      rounded-[20px]
                      border border-black/[0.07]
                      bg-white/55
                      p-5
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:border-black/[0.14]
                      hover:bg-black
                      hover:text-white
                      hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)]
                    "
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-black/[0.07] bg-black/[0.035] transition-colors duration-300 group-hover:border-white/10 group-hover:bg-white/10">
                      <BookOpen
                        size={18}
                        strokeWidth={1.6}
                        className="text-black/60 group-hover:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="rounded-full border border-black/[0.07] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-black/40 group-hover:border-white/10 group-hover:text-white/50">
                        {subject.code || "SUBJECT"}
                      </span>

                      {subject.code && (
                        <button
                          type="button"
                          onClick={() => copyCode(subject.code)}
                          className="
                              flex
                              h-7 w-7
                              cursor-pointer
                              items-center
                              justify-center
                              rounded-full
                              text-black/25
                              transition-all duration-200
                              hover:bg-black/[0.05]
                              hover:text-black
                              group-hover:text-white/40
                              group-hover:hover:bg-white/10
                              group-hover:hover:text-white
                            "
                          title="Copy subject code"
                        >
                          {copiedCode === subject.code ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* NAME */}
                  <h3 className="mt-6 line-clamp-2 text-base font-semibold tracking-[-0.025em]">
                    {subject.name || "Unnamed Subject"}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="mt-2 line-clamp-3 text-[10px] leading-5 text-black/40 group-hover:text-white/50">
                    {subject.description ||
                      "Academic subject information and course details."}
                  </p>

                  {/* INFO */}
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="rounded-[13px] border border-black/[0.06] bg-black/[0.025] p-3 group-hover:border-white/10 group-hover:bg-white/[0.06]">
                      <p className="text-[8px] uppercase tracking-[0.15em] text-black/30 group-hover:text-white/35">
                        Credits
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {subject.creditHours || subject.credits || "—"}
                      </p>
                    </div>

                    <div className="rounded-[13px] border border-black/[0.06] bg-black/[0.025] p-3 group-hover:border-white/10 group-hover:bg-white/[0.06]">
                      <p className="text-[8px] uppercase tracking-[0.15em] text-black/30 group-hover:text-white/35">
                        Semester
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {subject.semester
                          ? `Semester ${subject.semester}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* TEACHER */}
                  <div className="mt-3 border-t border-black/[0.06] pt-4 group-hover:border-white/10">
                    <p className="text-[8px] uppercase tracking-[0.15em] text-black/30 group-hover:text-white/35">
                      Instructor
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="truncate text-[10px] font-medium">
                        {teacherName}
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="
                            shrink-0
                            text-black/20
                            transition-all duration-300
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:text-white/70
                          "
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentSubjects;
