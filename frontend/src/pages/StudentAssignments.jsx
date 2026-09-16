import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  CircleUserRound,
  FileCheck2,
} from "lucide-react";

import api from "../services/api";

const StudentAssignments = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    const fetchAssignments = async () => {
      try {
        const response = await api.get("/assignments/student", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (Array.isArray(data)) {
          setAssignments(data);
        } else {
          setAssignments(data.assignments || []);
        }
      } catch (error) {
        console.error(
          "Assignments error:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/student/dashboard",
    },
    {
      label: "My Subjects",
      icon: BookOpen,
      path: "/student/subjects",
    },
    {
      label: "Attendance",
      icon: ClipboardCheck,
      path: "/student/attendance",
    },
    {
      label: "Assignments",
      icon: FileText,
      path: "/student/assignments",
    },
    {
      label: "Results",
      icon: GraduationCap,
      path: "/student/results",
    },
    {
      label: "Timetable",
      icon: CalendarDays,
      path: "/student/timetable",
    },
    {
      label: "Exam Schedule",
      icon: ClipboardList,
      path: "/student/exams",
    },
    {
      label: "Fees",
      icon: CreditCard,
      path: "/student/fees",
    },
    {
      label: "Notices",
      icon: Bell,
      path: "/student/notices",
    },
    {
      label: "My Profile",
      icon: User,
      path: "/student/profile",
    },
  ];

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatus = (dueDate) => {
    if (!dueDate) return "No deadline";

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const difference = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (difference < 0) {
      return "Overdue";
    }

    if (difference === 0) {
      return "Due Today";
    }

    if (difference <= 3) {
      return "Due Soon";
    }

    return "Upcoming";
  };

  if (!user) return null;

  const overdueCount = assignments.filter(
    (assignment) => getStatus(assignment.dueDate) === "Overdue",
  ).length;

  const dueSoonCount = assignments.filter((assignment) => {
    const status = getStatus(assignment.dueDate);
    return status === "Due Soon" || status === "Due Today";
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900 text-white">
              <span className="text-sm font-bold">TC</span>
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Texas College
              </h1>

              <p className="text-xs text-slate-500">Student Portal</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              const active = item.path === "/student/assignments";

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-blue-900"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-900" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom user */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-900">
              <CircleUserRound size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="text-xs capitalize text-slate-500">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  STUDENT PORTAL
                </p>

                <h2 className="text-lg font-semibold text-slate-900">
                  Assignments
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/student/notices")}
                className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              >
                <Bell size={19} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <button
                onClick={() => navigate("/student/profile")}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {user.role}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          {/* Page heading */}
          <section className="mb-7">
            <p className="mb-1 text-sm font-medium text-blue-800">
              Academic Work
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Assignments
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your assignments, deadlines, subjects and marks.
            </p>
          </section>

          {/* Summary cards */}
          <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              icon={FileText}
              label="Total Assignments"
              value={loading ? "—" : assignments.length}
              description="Published assignments"
              iconClass="bg-blue-50 text-blue-800"
            />

            <SummaryCard
              icon={Clock3}
              label="Due Soon"
              value={loading ? "—" : dueSoonCount}
              description="Due within 3 days"
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              icon={AlertCircle}
              label="Overdue"
              value={loading ? "—" : overdueCount}
              description="Past deadline"
              iconClass="bg-red-50 text-red-700"
            />
          </section>

          {/* Assignment list */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Assignment List
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Your currently published academic assignments
                </p>
              </div>

              {!loading && (
                <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {assignments.length} assignment
                  {assignments.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl border border-slate-200 p-5"
                    >
                      <div className="h-4 w-48 rounded bg-slate-200" />

                      <div className="mt-3 h-3 w-72 rounded bg-slate-200" />

                      <div className="mt-5 h-3 w-32 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const status = getStatus(assignment.dueDate);

                    return (
                      <AssignmentCard
                        key={assignment._id}
                        assignment={assignment}
                        status={status}
                        formatDate={formatDate}
                        onClick={() =>
                          navigate(`/student/assignments/${assignment._id}`)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Texas College · Student Portal
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, description, iconClass }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment, status, formatDate, onClick }) => {
  const statusStyles = {
    Upcoming: "bg-blue-50 text-blue-800 border-blue-100",
    "Due Soon": "bg-amber-50 text-amber-700 border-amber-100",
    "Due Today": "bg-orange-50 text-orange-700 border-orange-100",
    Overdue: "bg-red-50 text-red-700 border-red-100",
    "No deadline": "bg-slate-100 text-slate-600 border-slate-200",
  };

  const StatusIcon =
    status === "Overdue"
      ? AlertCircle
      : status === "Due Today"
        ? Clock3
        : status === "Due Soon"
          ? Clock3
          : CheckCircle2;

  return (
    <div className="group rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Main */}
        <div className="flex min-w-0 gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 sm:flex">
            <FileCheck2 size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold text-slate-900">
                {assignment.title}
              </h4>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  statusStyles[status]
                }`}
              >
                <StatusIcon size={12} />
                {status}
              </span>
            </div>

            {assignment.subject && (
              <p className="mt-1.5 text-xs font-medium text-blue-800">
                {assignment.subject.name}
                {assignment.subject.code && ` · ${assignment.subject.code}`}
              </p>
            )}

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {assignment.description || "No description provided."}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                Due: {formatDate(assignment.dueDate)}
              </span>

              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} />
                Marks: {assignment.totalMarks ?? "—"}
              </span>

              {assignment.teacher && (
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  {assignment.teacher.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <button
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 lg:w-auto"
          >
            View Assignment
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <FileText size={25} />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        No assignments found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        There are currently no published assignments available for your course
        and semester.
      </p>
    </div>
  );
};

export default StudentAssignments;
