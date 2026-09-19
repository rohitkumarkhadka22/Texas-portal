import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import api from "../services/api";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [examFilter, setExamFilter] = useState("all");

  const fetchResults = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/results/my-results");

      const data = response.data || {};

      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error("Get student results error:", err);

      setError(
        err.response?.data?.message || "Unable to load your results right now.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getPercentage = (result) => {
    const obtained = Number(result?.marksObtained) || 0;
    const total = Number(result?.totalMarks) || 0;

    if (!total) return 0;

    return Math.round((obtained / total) * 100);
  };

  const getGradeValue = (grade) => {
    const gradeMap = {
      "A+": 4.0,
      A: 3.7,
      "B+": 3.3,
      B: 3.0,
      "C+": 2.7,
      C: 2.3,
      F: 0,
    };

    return gradeMap[grade] ?? 0;
  };

  const getGradeClass = (grade) => {
    if (grade === "A+" || grade === "A") {
      return "bg-black text-white border-black";
    }

    if (grade === "B+" || grade === "B") {
      return "bg-white text-black border-black/15";
    }

    if (grade === "C+" || grade === "C") {
      return "bg-black/[0.05] text-black border-black/10";
    }

    return "bg-white text-black/45 border-black/10";
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 90) return "Exceptional";
    if (percentage >= 80) return "Excellent";
    if (percentage >= 70) return "Strong";
    if (percentage >= 60) return "Good";
    if (percentage >= 50) return "Developing";
    if (percentage >= 40) return "Needs improvement";

    return "At risk";
  };

  const filteredResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return results.filter((result) => {
      const subjectName = result?.subject?.name?.toLowerCase() || "";
      const subjectCode = result?.subject?.code?.toLowerCase() || "";
      const examType = result?.examType?.toLowerCase() || "";
      const grade = result?.grade?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        subjectName.includes(query) ||
        subjectCode.includes(query) ||
        examType.includes(query) ||
        grade.includes(query);

      const matchesExam =
        examFilter === "all" || result?.examType?.toLowerCase() === examFilter;

      return matchesSearch && matchesExam;
    });
  }, [results, searchTerm, examFilter]);

  const overallStats = useMemo(() => {
    if (!results.length) {
      return {
        obtained: 0,
        total: 0,
        percentage: 0,
        averageGradePoint: 0,
        passed: 0,
        failed: 0,
      };
    }

    const obtained = results.reduce(
      (sum, item) => sum + (Number(item?.marksObtained) || 0),
      0,
    );

    const total = results.reduce(
      (sum, item) => sum + (Number(item?.totalMarks) || 0),
      0,
    );

    const percentage = total ? Math.round((obtained / total) * 100) : 0;

    const gradePoints = results.map((item) => getGradeValue(item?.grade));

    const averageGradePoint =
      gradePoints.length > 0
        ? (
            gradePoints.reduce((sum, point) => sum + point, 0) /
            gradePoints.length
          ).toFixed(2)
        : "0.00";

    const passed = results.filter((item) => item?.grade !== "F").length;

    const failed = results.filter((item) => item?.grade === "F").length;

    return {
      obtained,
      total,
      percentage,
      averageGradePoint,
      passed,
      failed,
    };
  }, [results]);

  const examSummary = useMemo(() => {
    const preBoard = results.filter((item) => item?.examType === "pre-board");

    const final = results.filter((item) => item?.examType === "final");

    const calculateAverage = (items) => {
      if (!items.length) return 0;

      const obtained = items.reduce(
        (sum, item) => sum + (Number(item?.marksObtained) || 0),
        0,
      );

      const total = items.reduce(
        (sum, item) => sum + (Number(item?.totalMarks) || 0),
        0,
      );

      return total ? Math.round((obtained / total) * 100) : 0;
    };

    return {
      preBoard: {
        count: preBoard.length,
        percentage: calculateAverage(preBoard),
      },
      final: {
        count: final.length,
        percentage: calculateAverage(final),
      },
    };
  }, [results]);

  const subjectResults = useMemo(() => {
    const map = new Map();

    results.forEach((result) => {
      const subjectId =
        result?.subject?._id || result?.subject?.code || result?.subject?.name;

      if (!subjectId) return;

      if (!map.has(subjectId)) {
        map.set(subjectId, {
          subject: result.subject,
          results: [],
        });
      }

      map.get(subjectId).results.push(result);
    });

    return Array.from(map.values());
  }, [results]);

  const resetFilters = () => {
    setSearchTerm("");
    setExamFilter("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-black/5" />

          <div className="h-[260px] animate-pulse rounded-[28px] bg-black/5" />

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
                className="h-60 animate-pulse rounded-[26px] bg-black/5"
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
              Results unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/45">{error}</p>

            <button
              onClick={() => fetchResults()}
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
              <GraduationCap size={13} />
              Academic performance
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Results
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Track your academic performance, grades, marks and examination
              progress from one place.
            </p>
          </div>

          <button
            onClick={() => fetchResults(true)}
            disabled={refreshing}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh results
          </button>
        </div>

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[30px] bg-black px-7 py-8 text-white sm:px-9 sm:py-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-8 top-8 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                <Sparkles size={12} />
                Academic record
              </div>

              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                Your progress,
                <br />
                measured clearly.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                Review your marks across examinations, understand your grades
                and keep track of your academic progress.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs text-white/65">
                  {results.length} result
                  {results.length !== 1 ? "s" : ""}
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs text-white/65">
                  {overallStats.passed} passed
                </div>

                {overallStats.failed > 0 && (
                  <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs text-white/65">
                    {overallStats.failed} needs attention
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-start lg:justify-end">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <div className="absolute inset-4 rounded-full border border-white/10" />

                <div className="text-center">
                  <p className="text-5xl font-semibold tracking-[-0.06em]">
                    {overallStats.percentage}%
                  </p>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Overall score
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
                <Target size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Marks
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {overallStats.obtained}
              <span className="text-lg text-black/25">
                {" "}
                / {overallStats.total}
              </span>
            </p>

            <p className="mt-1 text-xs text-black/40">Total marks obtained</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <Award size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                GPA
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {overallStats.averageGradePoint}
            </p>

            <p className="mt-1 text-xs text-black/40">Average grade point</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <CheckCircle2 size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Passed
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {overallStats.passed}
            </p>

            <p className="mt-1 text-xs text-black/40">Successful results</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <TrendingUp size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Performance
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {getPerformanceLabel(overallStats.percentage)}
            </p>

            <p className="mt-1 text-xs text-black/40">Current academic level</p>
          </div>
        </section>

        {/* EXAM SUMMARY */}
        <section className="mb-7 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] border border-black/10 bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
                  Examination overview
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  Exam performance
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <BarChart3 size={17} />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Pre-board</p>
                    <p className="text-xs text-black/35">
                      {examSummary.preBoard.count} result
                      {examSummary.preBoard.count !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    {examSummary.preBoard.percentage}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        examSummary.preBoard.percentage,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Final examination</p>
                    <p className="text-xs text-black/35">
                      {examSummary.final.count} result
                      {examSummary.final.count !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    {examSummary.final.percentage}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-700"
                    style={{
                      width: `${Math.min(examSummary.final.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
                  Academic snapshot
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  Current standing
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <GraduationCap size={17} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f7f7f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                  Subjects
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {subjectResults.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                  Results
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {results.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                  Passed
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {overallStats.passed}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                  Attention
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {overallStats.failed}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER BAR */}
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
                placeholder="Search subject, code or grade..."
                className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "All results", value: "all" },
                { label: "Pre-board", value: "pre-board" },
                { label: "Final", value: "final" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setExamFilter(filter.value)}
                  className={`cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    examFilter === filter.value
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                  }`}
                >
                  {filter.label}
                </button>
              ))}

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

        {/* RESULTS */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
                Detailed record
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                Subject results
              </h3>
            </div>

            <span className="text-xs text-black/35">
              {filteredResults.length} shown
            </span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
                <Search size={20} className="text-black/35" />
              </div>

              <h4 className="font-semibold">No results found</h4>

              <p className="mt-2 text-sm text-black/40">
                Try another search term or change the examination filter.
              </p>

              <button
                onClick={resetFilters}
                className="mt-5 cursor-pointer rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredResults.map((result, index) => {
                const percentage = getPercentage(result);
                const grade = result?.grade || "—";
                const examType = result?.examType || "";

                return (
                  <article
                    key={
                      result?._id ||
                      `${result?.subject?.code}-${examType}-${index}`
                    }
                    className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.07)]"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100" />

                    <div className="flex items-start justify-between gap-5">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                          <BookOpen size={19} />
                        </div>

                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-black/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                              {result?.subject?.code || "SUBJECT"}
                            </span>

                            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                              {examType === "pre-board" ? "Pre-board" : "Final"}
                            </span>
                          </div>

                          <h4 className="truncate text-base font-semibold tracking-tight">
                            {result?.subject?.name || "Unknown subject"}
                          </h4>

                          <p className="mt-1 text-xs text-black/35">
                            Semester {result?.subject?.semester || "—"} ·{" "}
                            {result?.subject?.creditHours || "—"} credit hours
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold ${getGradeClass(
                          grade,
                        )}`}
                      >
                        {grade}
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-5">
                      <div>
                        <div className="mb-2 flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-semibold tracking-[-0.05em]">
                              {result?.marksObtained ?? 0}
                              <span className="text-lg text-black/25">
                                {" "}
                                / {result?.totalMarks ?? 0}
                              </span>
                            </p>

                            <p className="mt-1 text-xs text-black/35">
                              Marks obtained
                            </p>
                          </div>

                          <span className="text-sm font-semibold">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-black/5">
                          <div
                            className="h-full rounded-full bg-black transition-all duration-700"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f7f5]">
                        <ChevronRight
                          size={18}
                          className="text-black/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-black"
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 border-t border-black/5 pt-5 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5">
                          <FileText size={15} />
                        </div>

                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                            Examination
                          </p>

                          <p className="mt-0.5 text-xs font-medium">
                            {examType === "pre-board"
                              ? "Pre-board"
                              : "Final examination"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5">
                          <Clock3 size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                            Evaluated by
                          </p>

                          <p className="mt-0.5 truncate text-xs font-medium">
                            {result?.teacher?.name || "Faculty"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {result?.remarks && (
                      <div className="mt-5 rounded-2xl bg-[#f7f7f5] px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/25">
                          Faculty remarks
                        </p>

                        <p className="mt-1 text-xs leading-5 text-black/55">
                          {result.remarks}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER INSIGHT */}
        {results.length > 0 && (
          <section className="mt-7 overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
                    Performance insight
                  </p>

                  <h4 className="mt-1 text-base font-semibold">
                    {overallStats.percentage >= 80
                      ? "Your results show strong academic progress."
                      : overallStats.percentage >= 60
                        ? "Your results show steady academic progress."
                        : "Keep building consistency across your subjects."}
                  </h4>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-black/40">
                    Continue reviewing individual subject performance to
                    understand where your marks are strongest and where
                    additional preparation may help.
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black/55">
                GPA {overallStats.averageGradePoint}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
