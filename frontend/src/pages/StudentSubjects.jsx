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
  CircleUserRound,
} from "lucide-react";

import api from "../services/api";

const StudentSubjects = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
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
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await api.get("/subjects/my-subjects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          setSubjects(data.subjects || []);
        }
      } catch (error) {
        console.error("Subjects error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const openSubject = (subject) => {
    navigate(`/student/subjects/${subject._id}`, {
      state: { subject },
    });
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

  if (!user) return null;

  const semester =
    subjects.length > 0 && subjects[0].semester
      ? `Semester ${subjects[0].semester}`
      : "Current Semester";

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-[72px] items-center border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center bg-[#123b6d] text-xs font-bold text-white">
            TC
          </div>

          <div className="ml-3">
            <p className="text-sm font-semibold text-slate-900">
              Texas College
            </p>

            <p className="text-[11px] text-slate-500">Student Portal</p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-slate-400 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Portal
          </p>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === "/student/subjects";

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-[13px] transition ${
                    active
                      ? "border-[#123b6d] bg-slate-50 font-semibold text-[#123b6d]"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2 : 1.7} />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* USER */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123b6d] text-xs font-semibold text-white">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {user.name}
              </p>

              <p className="text-[11px] capitalize text-slate-500">
                {user.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-2 px-1 text-xs text-slate-500 hover:text-red-600"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="lg:pl-[250px]">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200 bg-white">
          <div className="flex h-full items-center justify-between px-5 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-600 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Student Portal
                </p>

                <h1 className="text-[17px] font-semibold text-slate-900">
                  My Subjects
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/student/notices")}
                className="relative text-slate-500 hover:text-slate-900"
              >
                <Bell size={19} />

                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#123b6d]" />
              </button>

              <div className="hidden h-7 w-px bg-slate-200 sm:block" />

              <button
                onClick={() => navigate("/student/profile")}
                className="hidden items-center gap-2 sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <CircleUserRound size={18} />
                </div>

                <div className="text-left">
                  <p className="max-w-[140px] truncate text-xs font-semibold text-slate-800">
                    {user.name}
                  </p>

                  <p className="text-[10px] capitalize text-slate-500">
                    {user.role}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="mx-auto max-w-[1200px] px-5 py-7 lg:px-8">
          {/* BREADCRUMB */}
          <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
            <span>Home</span>
            <ChevronRight size={12} />
            <span className="text-slate-700">My Subjects</span>
          </div>

          {/* PAGE INTRO */}
          <section className="mb-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#123b6d]">
                  Academic Year
                </p>

                <h2 className="text-[27px] font-semibold tracking-tight text-slate-900">
                  My Subjects
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Your enrolled courses for the current academic semester.
                  Select a course to access its learning materials, assignments
                  and examination resources.
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs text-slate-400">Current Semester</p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {semester}
                </p>
              </div>
            </div>
          </section>

          {/* COURSE AREA */}
          <section>
            <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Enrolled Courses
                </h3>
              </div>

              {!loading && (
                <p className="text-xs text-slate-400">
                  {subjects.length} course
                  {subjects.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {loading ? (
              <LoadingCourses />
            ) : subjects.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="border-t border-slate-200">
                {subjects.map((subject, index) => (
                  <CourseRow
                    key={subject._id}
                    subject={subject}
                    number={index + 1}
                    onOpen={openSubject}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ACADEMIC NOTE */}
          {!loading && subjects.length > 0 && (
            <div className="mt-8 border-l-2 border-[#123b6d] bg-white px-5 py-4">
              <p className="text-xs font-semibold text-slate-800">
                Course workspace
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Open any course to view its weekly learning content,
                assignments, resources, syllabus and examination information.
              </p>
            </div>
          )}

          {/* FOOTER */}
          <footer className="mt-12 border-t border-slate-200 py-6">
            <div className="flex flex-col justify-between gap-2 text-[11px] text-slate-400 sm:flex-row">
              <p>© {new Date().getFullYear()} Texas College</p>

              <p>Student Portal</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

/* COURSE ROW */

const CourseRow = ({ subject, number, onOpen }) => {
  const teacher =
    typeof subject.teacher === "string"
      ? subject.teacher
      : subject.teacher?.name;

  return (
    <button
      type="button"
      onClick={() => onOpen(subject)}
      className="group flex w-full flex-col border-b border-slate-200 bg-white px-5 py-5 text-left transition hover:bg-slate-[50] md:flex-row md:items-center"
    >
      {/* NUMBER */}
      <div className="mb-3 w-12 shrink-0 md:mb-0">
        <span className="text-xs font-medium tabular-nums text-slate-400">
          {String(number).padStart(2, "0")}
        </span>
      </div>

      {/* COURSE INFO */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="text-[15px] font-semibold text-slate-900 group-hover:text-[#123b6d]">
            {subject.name || "Unnamed Subject"}
          </h4>

          {subject.code && (
            <span className="text-[11px] font-medium text-slate-400">
              {subject.code}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
          {subject.course && <span>{subject.course}</span>}

          {subject.semester && <span>Semester {subject.semester}</span>}

          {subject.creditHours !== undefined && (
            <span>{subject.creditHours} Credit Hours</span>
          )}

          {teacher && <span>{teacher}</span>}
        </div>
      </div>

      {/* PROGRESS */}
      <div className="mt-4 w-full md:mt-0 md:w-[220px] md:px-6">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            Course progress
          </span>

          <span className="text-[11px] font-semibold text-slate-600">
            {subject.progress ?? 0}%
          </span>
        </div>

        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-[#123b6d]"
            style={{
              width: `${subject.progress ?? 0}%`,
            }}
          />
        </div>
      </div>

      {/* ACTION */}
      <div className="mt-4 flex items-center justify-between md:mt-0 md:w-[110px]">
        <span className="text-xs font-medium text-[#123b6d]">Continue</span>

        <ChevronRight
          size={16}
          className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#123b6d]"
        />
      </div>
    </button>
  );
};

/* LOADING */

const LoadingCourses = () => {
  return (
    <div className="border-t border-slate-200">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center border-b border-slate-200 bg-white px-5 py-6"
        >
          <div className="h-3 w-5 bg-slate-200" />

          <div className="ml-7 flex-1">
            <div className="h-4 w-64 bg-slate-200" />

            <div className="mt-3 h-3 w-96 max-w-full bg-slate-100" />
          </div>

          <div className="hidden w-48 md:block">
            <div className="h-1 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

/* EMPTY */

const EmptyState = () => {
  return (
    <div className="border-t border-slate-200 bg-white px-5 py-16 text-center">
      <BookOpen
        size={28}
        strokeWidth={1.4}
        className="mx-auto text-slate-300"
      />

      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        No subjects available
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
        No courses have been assigned to your account for the current semester.
      </p>
    </div>
  );
};

export default StudentSubjects;
