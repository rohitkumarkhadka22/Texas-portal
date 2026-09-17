import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Loader2,
  RefreshCw,
  Trophy,
} from "lucide-react";

import api from "../services/api";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [activeType, setActiveType] = useState("final");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/results/my-results", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      const resultList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setResults(resultList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your results. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  /* =========================================
     HELPERS
  ========================================= */

  const getResultType = (result) => {
    const value = String(
      result?.resultType ||
        result?.type ||
        result?.examType ||
        result?.assessmentType ||
        "",
    ).toLowerCase();

    if (value.includes("pre") || value.includes("board")) {
      return "preboard";
    }

    return "final";
  };

  const getSemester = (result) => {
    return (
      result?.semester ??
      result?.semesterNumber ??
      result?.term ??
      result?.academicSemester ??
      null
    );
  };

  const getSubjectName = (result) => {
    if (typeof result?.subject === "string") {
      return result.subject;
    }

    return (
      result?.subject?.name || result?.subjectName || result?.name || "Subject"
    );
  };

  const getSubjectCode = (result) => {
    if (typeof result?.subject === "object") {
      return result?.subject?.code || "";
    }

    return result?.subjectCode || "";
  };

  const getMarks = (result) => {
    return (
      result?.marks ??
      result?.obtainedMarks ??
      result?.score ??
      result?.obtained ??
      null
    );
  };

  const getTotalMarks = (result) => {
    return (
      result?.totalMarks ?? result?.maximumMarks ?? result?.maxMarks ?? 100
    );
  };

  const getPercentage = (result) => {
    if (result?.percentage !== undefined && result?.percentage !== null) {
      return Number(result.percentage);
    }

    const marks = Number(getMarks(result));
    const total = Number(getTotalMarks(result));

    if (!Number.isNaN(marks) && total > 0) {
      return (marks / total) * 100;
    }

    return null;
  };

  const getGrade = (result) => {
    if (result?.grade) {
      return result.grade;
    }

    const percentage = getPercentage(result);

    if (percentage === null) return "—";

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";

    return "F";
  };

  const getCredits = (result) => {
    return (
      result?.creditHours ??
      result?.credits ??
      result?.subject?.creditHours ??
      "—"
    );
  };

  const getDate = (result) => {
    const date =
      result?.examDate ||
      result?.date ||
      result?.publishedAt ||
      result?.createdAt;

    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /* =========================================
     FILTERING
  ========================================= */

  const finalResults = useMemo(
    () => results.filter((result) => getResultType(result) === "final"),
    [results],
  );

  const preBoardResults = useMemo(
    () => results.filter((result) => getResultType(result) === "preboard"),
    [results],
  );

  const activeResults = activeType === "final" ? finalResults : preBoardResults;

  const semesters = useMemo(() => {
    const values = activeResults
      .map(getSemester)
      .filter((value) => value !== null && value !== undefined);

    return [...new Set(values)].sort((a, b) => Number(a) - Number(b));
  }, [activeResults]);

  const filteredResults = useMemo(() => {
    if (selectedSemester === "all") {
      return activeResults;
    }

    return activeResults.filter(
      (result) => String(getSemester(result)) === String(selectedSemester),
    );
  }, [activeResults, selectedSemester]);

  /* =========================================
     SUMMARY
  ========================================= */

  const averagePercentage = useMemo(() => {
    if (!filteredResults.length) return null;

    const percentages = filteredResults
      .map(getPercentage)
      .filter((value) => value !== null && !Number.isNaN(value));

    if (!percentages.length) return null;

    return (
      percentages.reduce((sum, value) => sum + value, 0) / percentages.length
    );
  }, [filteredResults]);

  const totalCredits = useMemo(() => {
    return filteredResults.reduce((sum, result) => {
      const credits = Number(getCredits(result));

      return Number.isNaN(credits) ? sum : sum + credits;
    }, 0);
  }, [filteredResults]);

  const passedSubjects = filteredResults.filter(
    (result) => getGrade(result) !== "F",
  ).length;

  /* =========================================
     CHANGE TYPE
  ========================================= */

  const handleTypeChange = (type) => {
    setActiveType(type);
    setSelectedSemester("all");
  };

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
              Loading your results...
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
            <Award size={20} className="text-black/60" />
          </div>

          <h2 className="mt-5 text-lg font-semibold tracking-[-0.03em]">
            Results unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-black/40">
            {error}
          </p>

          <button
            onClick={fetchResults}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/[0.10] bg-black px-4 py-2.5 text-[10px] font-semibold text-white transition hover:opacity-80"
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

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.08] bg-white shadow-sm">
              <GraduationCap size={15} />
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/30">
              Academic Records
            </span>
          </div>

          <h1 className="text-[30px] font-semibold tracking-[-0.055em] sm:text-[38px]">
            Results
          </h1>

          <p className="mt-2 max-w-xl text-[11px] leading-5 text-black/40">
            View your pre-board performance and semester-wise final academic
            results.
          </p>
        </div>

        <button
          onClick={fetchResults}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-4 py-2.5 text-[10px] font-semibold text-black/60 shadow-sm backdrop-blur-xl transition hover:bg-black/[0.04] hover:text-black"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* =========================================
          RESULT TYPE SWITCHER
      ========================================= */}

      <div className="rounded-[24px] border border-black/[0.08] bg-white/65 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.05)] backdrop-blur-2xl">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleTypeChange("preboard")}
            className={`group flex items-center justify-between rounded-[18px] px-4 py-3.5 text-left transition-all ${
              activeType === "preboard"
                ? "bg-black text-white shadow-lg"
                : "text-black/50 hover:bg-black/[0.04] hover:text-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  activeType === "preboard" ? "bg-white/10" : "bg-black/[0.05]"
                }`}
              >
                <BookOpen size={14} />
              </div>

              <div>
                <p className="text-[11px] font-semibold">Pre-Board Results</p>

                <p
                  className={`mt-0.5 text-[8px] ${
                    activeType === "preboard"
                      ? "text-white/45"
                      : "text-black/30"
                  }`}
                >
                  Internal examination
                </p>
              </div>
            </div>

            <ChevronRight size={14} />
          </button>

          <button
            onClick={() => handleTypeChange("final")}
            className={`group flex items-center justify-between rounded-[18px] px-4 py-3.5 text-left transition-all ${
              activeType === "final"
                ? "bg-black text-white shadow-lg"
                : "text-black/50 hover:bg-black/[0.04] hover:text-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  activeType === "final" ? "bg-white/10" : "bg-black/[0.05]"
                }`}
              >
                <Trophy size={14} />
              </div>

              <div>
                <p className="text-[11px] font-semibold">Final Results</p>

                <p
                  className={`mt-0.5 text-[8px] ${
                    activeType === "final" ? "text-white/45" : "text-black/30"
                  }`}
                >
                  Semester academic result
                </p>
              </div>
            </div>

            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* =========================================
          SEMESTER FILTER
      ========================================= */}

      {activeType === "final" && semesters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
            Semester
          </span>

          <button
            onClick={() => setSelectedSemester("all")}
            className={`rounded-full border px-3.5 py-2 text-[9px] font-semibold transition ${
              selectedSemester === "all"
                ? "border-black bg-black text-white"
                : "border-black/[0.08] bg-white/70 text-black/45 hover:bg-black/[0.04] hover:text-black"
            }`}
          >
            All
          </button>

          {semesters.map((semester) => (
            <button
              key={semester}
              onClick={() => setSelectedSemester(semester)}
              className={`rounded-full border px-3.5 py-2 text-[9px] font-semibold transition ${
                String(selectedSemester) === String(semester)
                  ? "border-black bg-black text-white"
                  : "border-black/[0.08] bg-white/70 text-black/45 hover:bg-black/[0.04] hover:text-black"
              }`}
            >
              Semester {semester}
            </button>
          ))}
        </div>
      )}

      {/* =========================================
          SUMMARY
      ========================================= */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Subjects
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {filteredResults.length}
          </p>

          <p className="mt-1 text-[9px] text-black/35">Recorded subjects</p>
        </div>

        <div className="rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Average
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {averagePercentage !== null
              ? `${averagePercentage.toFixed(1)}%`
              : "—"}
          </p>

          <p className="mt-1 text-[9px] text-black/35">Overall percentage</p>
        </div>

        <div className="rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Credits
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {totalCredits || "—"}
          </p>

          <p className="mt-1 text-[9px] text-black/35">Total credit hours</p>
        </div>

        <div className="rounded-[22px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-black/30">
            Passed
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {passedSubjects}
            <span className="ml-1 text-sm font-medium text-black/25">
              / {filteredResults.length}
            </span>
          </p>

          <p className="mt-1 text-[9px] text-black/35">Subjects passed</p>
        </div>
      </div>

      {/* =========================================
          RESULT CONTENT
      ========================================= */}

      {filteredResults.length === 0 ? (
        <div className="rounded-[28px] border border-black/[0.08] bg-white/60 p-12 text-center shadow-sm backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.05]">
            {activeType === "final" ? (
              <Trophy size={21} className="text-black/50" />
            ) : (
              <BookOpen size={21} className="text-black/50" />
            )}
          </div>

          <h3 className="mt-5 text-base font-semibold tracking-[-0.02em]">
            No results available
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-black/35">
            {activeType === "final"
              ? "Your semester final result has not been published yet."
              : "No pre-board result has been published yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* RESULT TITLE */}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
                {activeType === "final"
                  ? "Final Academic Result"
                  : "Internal Assessment"}
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                {activeType === "final"
                  ? selectedSemester === "all"
                    ? "Semester Results"
                    : `Semester ${selectedSemester}`
                  : "Pre-Board Results"}
              </h2>
            </div>

            <span className="rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-black/35">
              {filteredResults.length} Subjects
            </span>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-hidden rounded-[28px] border border-black/[0.08] bg-white/65 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-2xl md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.07]">
                    <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                      Subject
                    </th>

                    <th className="px-4 py-4 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                      Credits
                    </th>

                    <th className="px-4 py-4 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                      Marks
                    </th>

                    <th className="px-4 py-4 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                      Percentage
                    </th>

                    <th className="px-4 py-4 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                      Grade
                    </th>

                    <th className="px-6 py-4 text-right text-[8px] font-semibold uppercase tracking-[0.18em] text-black/30">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResults.map((result, index) => {
                    const marks = getMarks(result);
                    const total = getTotalMarks(result);
                    const percentage = getPercentage(result);
                    const grade = getGrade(result);

                    return (
                      <tr
                        key={result?._id || result?.id || index}
                        className="group border-b border-black/[0.06] last:border-b-0 transition-colors hover:bg-black/[0.025]"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-[11px] font-semibold text-black">
                              {getSubjectName(result)}
                            </p>

                            {getSubjectCode(result) && (
                              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-black/30">
                                {getSubjectCode(result)}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-5 text-center text-[10px] font-medium text-black/55">
                          {getCredits(result)}
                        </td>

                        <td className="px-4 py-5 text-center">
                          <span className="text-[11px] font-semibold">
                            {marks ?? "—"}
                          </span>

                          <span className="text-[9px] text-black/30">
                            {" "}
                            / {total}
                          </span>
                        </td>

                        <td className="px-4 py-5 text-center text-[10px] font-semibold">
                          {percentage !== null
                            ? `${percentage.toFixed(1)}%`
                            : "—"}
                        </td>

                        <td className="px-4 py-5 text-center">
                          <span
                            className={`inline-flex min-w-[36px] justify-center rounded-full px-2.5 py-1 text-[9px] font-bold ${
                              grade === "F"
                                ? "bg-black/[0.08] text-black/50"
                                : "bg-black text-white"
                            }`}
                          >
                            {grade}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right text-[9px] text-black/40">
                          {getDate(result)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}

          <div className="space-y-3 md:hidden">
            {filteredResults.map((result, index) => {
              const marks = getMarks(result);
              const total = getTotalMarks(result);
              const percentage = getPercentage(result);
              const grade = getGrade(result);

              return (
                <div
                  key={result?._id || result?.id || index}
                  className="rounded-[24px] border border-black/[0.08] bg-white/65 p-5 shadow-sm backdrop-blur-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-semibold">
                        {getSubjectName(result)}
                      </p>

                      {getSubjectCode(result) && (
                        <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.15em] text-black/30">
                          {getSubjectCode(result)}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-black px-3 py-1.5 text-[9px] font-bold text-white">
                      {grade}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-black/[0.035] p-3">
                      <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-black/30">
                        Marks
                      </p>

                      <p className="mt-1.5 text-[11px] font-semibold">
                        {marks ?? "—"}
                        <span className="text-black/25"> / {total}</span>
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/[0.035] p-3">
                      <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-black/30">
                        Score
                      </p>

                      <p className="mt-1.5 text-[11px] font-semibold">
                        {percentage !== null
                          ? `${percentage.toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/[0.035] p-3">
                      <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-black/30">
                        Credits
                      </p>

                      <p className="mt-1.5 text-[11px] font-semibold">
                        {getCredits(result)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[8px] text-black/35">
                    <CalendarDays size={12} />
                    {getDate(result)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentResults;
