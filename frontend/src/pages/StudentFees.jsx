import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";

import api from "../services/api";

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchFees = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/fees/my-fees");

      const data = response.data || {};

      setSummary({
        totalAmount: Number(data?.summary?.totalAmount || 0),
        totalPaid: Number(data?.summary?.totalPaid || 0),
        totalRemaining: Number(data?.summary?.totalRemaining || 0),
      });

      setFees(Array.isArray(data?.fees) ? data.fees : []);
    } catch (err) {
      console.error("Get student fees error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your fee information right now.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return `NPR ${value.toLocaleString("en-NP")}`;
  };

  const formatDate = (date) => {
    if (!date) return "Due date unavailable";

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

  const getDueState = (dueDate, status) => {
    if (status === "paid") {
      return {
        label: "Paid",
        className: "bg-black text-white",
      };
    }

    if (!dueDate) {
      return {
        label: "No due date",
        className: "bg-black/5 text-black/40",
      };
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return {
        label: "Scheduled",
        className: "bg-black/5 text-black/40",
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const difference = date.getTime() - today.getTime();

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return {
        label: "Overdue",
        className: "bg-black text-white",
      };
    }

    if (days === 0) {
      return {
        label: "Due today",
        className: "bg-black text-white",
      };
    }

    if (days === 1) {
      return {
        label: "Due tomorrow",
        className: "bg-black/10 text-black",
      };
    }

    if (days <= 7) {
      return {
        label: `${days} days left`,
        className: "bg-black/10 text-black",
      };
    }

    return {
      label: "Upcoming",
      className: "bg-black/5 text-black/45",
    };
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "partial":
        return "Partial";
      case "unpaid":
        return "Unpaid";
      default:
        return "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-black text-white";

      case "partial":
        return "bg-black/10 text-black";

      case "unpaid":
        return "bg-black/5 text-black/45";

      default:
        return "bg-black/5 text-black/35";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "paid") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "partial") {
      return <Clock3 size={14} />;
    }

    return <AlertCircle size={14} />;
  };

  const paymentPercentage = useMemo(() => {
    if (!summary.totalAmount) return 0;

    return Math.min(
      100,
      Math.round((summary.totalPaid / summary.totalAmount) * 100),
    );
  }, [summary]);

  const stats = useMemo(() => {
    const paid = fees.filter((fee) => fee.status === "paid").length;

    const partial = fees.filter((fee) => fee.status === "partial").length;

    const unpaid = fees.filter((fee) => fee.status === "unpaid").length;

    const overdue = fees.filter((fee) => {
      if (fee.status === "paid" || !fee.dueDate) {
        return false;
      }

      const due = new Date(fee.dueDate);

      if (Number.isNaN(due.getTime())) {
        return false;
      }

      const today = new Date();

      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      return due < today;
    }).length;

    return {
      paid,
      partial,
      unpaid,
      overdue,
    };
  }, [fees]);

  const filteredFees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return fees.filter((fee) => {
      const title = fee?.title?.toLowerCase() || "";

      const type = fee?.feeType?.toLowerCase() || "";

      const description = fee?.description?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        type.includes(query) ||
        description.includes(query);

      const matchesStatus =
        statusFilter === "all" || fee?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [fees, searchTerm, statusFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-black/5" />

          <div className="h-[280px] animate-pulse rounded-[30px] bg-black/5" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-[24px] bg-black/5"
              />
            ))}
          </div>

          <div className="h-24 animate-pulse rounded-[26px] bg-black/5" />

          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-[28px] bg-black/5"
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
              Fee information unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/45">{error}</p>

            <button
              onClick={() => fetchFees()}
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
              <Wallet size={13} />
              Student finance
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Fees & Payments
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Keep track of your tuition, academic charges, payment progress and
              outstanding balance.
            </p>
          </div>

          <button
            onClick={() => fetchFees(true)}
            disabled={refreshing}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh fees
          </button>
        </div>

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[30px] bg-black px-7 py-8 text-white sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -bottom-32 right-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                <CreditCard size={12} />
                Financial overview
              </div>

              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                Your fees,
                <br />
                clearly organized.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                See exactly what has been paid, what remains, and which payments
                need your attention.
              </p>

              <div className="mt-8 max-w-xl">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                    Payment progress
                  </span>

                  <span className="text-sm font-semibold">
                    {paymentPercentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{
                      width: `${paymentPercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-white/30">
                  <span>Paid {formatCurrency(summary.totalPaid)}</span>

                  <span>Total {formatCurrency(summary.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-start lg:justify-end">
              <div className="flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <div className="text-center">
                  <p className="text-4xl font-semibold tracking-[-0.06em]">
                    {formatCurrency(summary.totalRemaining)}
                  </p>

                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Remaining balance
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
                <Wallet size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Total
              </span>
            </div>

            <p className="text-2xl font-semibold tracking-[-0.05em]">
              {formatCurrency(summary.totalAmount)}
            </p>

            <p className="mt-1 text-xs text-black/40">Total assessed fees</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <CheckCircle2 size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Paid
              </span>
            </div>

            <p className="text-2xl font-semibold tracking-[-0.05em]">
              {formatCurrency(summary.totalPaid)}
            </p>

            <p className="mt-1 text-xs text-black/40">Successfully paid</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <AlertCircle size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Remaining
              </span>
            </div>

            <p className="text-2xl font-semibold tracking-[-0.05em]">
              {formatCurrency(summary.totalRemaining)}
            </p>

            <p className="mt-1 text-xs text-black/40">Outstanding balance</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <FileText size={18} />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30">
                Records
              </span>
            </div>

            <p className="text-3xl font-semibold tracking-[-0.05em]">
              {fees.length}
            </p>

            <p className="mt-1 text-xs text-black/40">Active fee records</p>
          </div>
        </section>

        {/* STATUS OVERVIEW */}
        <section className="mb-7 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[26px] border border-black/10 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
                  Payment status
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  Fee record overview
                </h3>
              </div>

              <CreditCard size={19} className="text-black/25" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-black p-4 text-white">
                <p className="text-2xl font-semibold">{stats.paid}</p>

                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/40">
                  Paid
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-4">
                <p className="text-2xl font-semibold">{stats.partial}</p>

                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-black/35">
                  Partial
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-4">
                <p className="text-2xl font-semibold">{stats.unpaid}</p>

                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-black/35">
                  Unpaid
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-black p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Attention
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  Payment reminders
                </h3>
              </div>

              <AlertCircle size={19} className="text-white/30" />
            </div>

            <div className="mt-6 flex items-end justify-between gap-5">
              <div>
                <p className="text-4xl font-semibold tracking-[-0.06em]">
                  {stats.overdue}
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Overdue fee records
                </p>
              </div>

              <div className="max-w-[220px] text-right text-xs leading-5 text-white/40">
                Review outstanding fees and due dates regularly to keep your
                student account up to date.
              </div>
            </div>
          </div>
        </section>

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
                placeholder="Search fee title, type or description..."
                className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                ["all", "All"],
                ["paid", "Paid"],
                ["partial", "Partial"],
                ["unpaid", "Unpaid"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`cursor-pointer rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    statusFilter === value
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black/45 hover:border-black hover:text-black"
                  }`}
                >
                  {label}
                </button>
              ))}

              {(searchTerm || statusFilter !== "all") && (
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

        {/* FEE RECORDS */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
                Financial records
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                Your fee records
              </h3>
            </div>

            <span className="text-xs text-black/35">
              {filteredFees.length} shown
            </span>
          </div>

          {filteredFees.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
                <Search size={20} className="text-black/35" />
              </div>

              <h4 className="font-semibold">No fee records found</h4>

              <p className="mt-2 text-sm text-black/40">
                Try another search term or change the status filter.
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
              {filteredFees.map((fee, index) => {
                const dueState = getDueState(fee?.dueDate, fee?.status);

                const amount = Number(fee?.amount || 0);

                const paid = Number(fee?.paidAmount || 0);

                const remaining = Number(fee?.remainingAmount ?? amount - paid);

                const progress =
                  amount > 0
                    ? Math.min(100, Math.round((paid / amount) * 100))
                    : 0;

                return (
                  <article
                    key={fee?._id || `${fee?.title}-${index}`}
                    className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.07)]"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-black/10 transition-all duration-300 group-hover:bg-black" />

                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-black/10 bg-[#f7f7f5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-black/45">
                            {fee?.feeType || "Fee"}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${getStatusClass(
                              fee?.status,
                            )}`}
                          >
                            {getStatusIcon(fee?.status)}

                            {getStatusLabel(fee?.status)}
                          </span>
                        </div>

                        <h4 className="mt-4 text-xl font-semibold tracking-tight">
                          {fee?.title || "Fee record"}
                        </h4>

                        {fee?.description && (
                          <p className="mt-2 max-w-lg text-xs leading-5 text-black/40">
                            {fee.description}
                          </p>
                        )}
                      </div>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/5 transition duration-300 group-hover:bg-black group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[#f7f7f5] p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/25">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatCurrency(amount)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f7f7f5] p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/25">
                          Paid
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatCurrency(paid)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black p-4 text-white">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
                          Remaining
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/25">
                          Payment progress
                        </span>

                        <span className="text-[10px] font-semibold">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-black transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-black/40">
                        <Clock3 size={14} />

                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/25">
                            Due date
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-black/65">
                            {formatDate(fee?.dueDate)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${dueState.className}`}
                      >
                        {dueState.label}
                      </span>
                    </div>

                    {fee?.semester && (
                      <div className="mt-4 flex items-center justify-between text-[10px] text-black/30">
                        <span>Academic semester</span>

                        <span className="font-semibold text-black/50">
                          Semester {fee.semester}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER */}
        {fees.length > 0 && (
          <section className="mt-7 rounded-[28px] border border-black/10 bg-white p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <Wallet size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
                    Account summary
                  </p>

                  <h4 className="mt-1 text-base font-semibold">
                    Financial record is up to date.
                  </h4>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-black/40">
                    Review your outstanding balance and due dates regularly.
                    Contact the college finance office if you notice any
                    discrepancy.
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black/45">
                {paymentPercentage}% paid
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentFees;
