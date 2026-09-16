import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  User,
  X,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

const StudentSubjectDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(location.state?.subject || null);
  const [loading, setLoading] = useState(!location.state?.subject);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid stored user:", error);
      }
    }

    if (!subject) {
      fetchSubject();
    }
  }, [id]);

  const fetchSubject = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/subjects/my-subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const foundSubject = response.data.subjects?.find(
        (item) => item._id === id,
      );

      setSubject(foundSubject || null);
    } catch (error) {
      console.error("Failed to fetch subject:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeMenus = () => {
    setProfileOpen(false);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9]">
        <div className="flex h-[68px] items-center border-b border-slate-200 bg-white px-6">
          <div className="h-9 w-9 animate-pulse bg-slate-200" />
        </div>

        <div className="mx-auto max-w-[1250px] px-6 py-10">
          <div className="h-6 w-64 animate-pulse bg-slate-200" />
          <div className="mt-3 h-4 w-96 animate-pulse bg-slate-100" />
          <div className="mt-8 h-40 animate-pulse bg-white" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-[#f6f7f9]">
        <header className="flex h-[68px] items-center border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#123b63] text-xs font-bold text-white">
              TC
            </div>

            <div>
              <p className="text-[15px] font-semibold text-slate-800">
                Texas College
              </p>

              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Student Portal
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[700px] px-6 py-20 text-center">
          <BookOpen className="mx-auto text-slate-300" size={40} />

          <h1 className="mt-5 text-xl font-semibold text-slate-800">
            Subject not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The subject could not be loaded.
          </p>

          <button
            onClick={() => navigate("/student/subjects")}
            className="mt-6 bg-[#123b63] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0e3152]"
          >
            Back to My Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#1d2733]">
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[68px] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* BRAND */}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#123b63] lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              onClick={() => navigate("/student/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center bg-[#123b63] text-xs font-bold tracking-wide text-white">
                TC
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-[15px] font-semibold leading-none text-slate-800">
                  Texas College
                </p>

                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Student Portal
                </p>
              </div>
            </button>
          </div>

          {/* GLOBAL NAVIGATION */}

          <nav className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center lg:flex">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="flex h-full items-center border-b-2 border-[#123b63] px-5 text-[13px] font-medium text-[#123b63]"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/student/subjects")}
              className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-500 transition hover:text-[#123b63]"
            >
              Academics
            </button>

            <button className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-500 transition hover:text-[#123b63]">
              Campus
            </button>

            <button className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-500 transition hover:text-[#123b63]">
              Support
            </button>
          </nav>

          {/* RIGHT */}

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification */}

            <button
              className="relative flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#123b63]"
              title="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            {/* PROFILE */}

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center bg-slate-100 text-sm font-semibold text-[#123b63]">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>

                <div className="hidden text-left md:block">
                  <p className="max-w-[130px] truncate text-[13px] font-semibold text-slate-700">
                    {user?.name || "Student"}
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Student
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* PROFILE MENU */}

              {profileOpen && (
                <div className="absolute right-0 top-[50px] z-50 w-[250px] overflow-hidden border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-sm font-semibold text-[#123b63]">
                        {user?.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user?.name || "Student"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {user?.email || "Student account"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/student/profile");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-slate-600 transition hover:bg-slate-50 hover:text-[#123b63]"
                  >
                    <User size={16} />
                    My Profile
                  </button>

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed left-0 top-[68px] z-40
          h-[calc(100vh-68px)]
          w-[235px]
          border-r border-slate-200
          bg-white
          transition-transform duration-200
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {/* ACADEMICS */}

            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
              ACADEMICS
            </p>

            <SidebarItem
              icon={<BookOpen size={17} />}
              label="Dashboard"
              onClick={() => {
                closeMenus();
                navigate("/student/dashboard");
              }}
            />

            <SidebarItem
              icon={<GraduationCap size={17} />}
              label="My Subjects"
              active
              onClick={() => {
                closeMenus();
                navigate("/student/subjects");
              }}
            />

            {/* LEARNING */}

            <p className="mt-7 px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
              LEARNING
            </p>

            <SidebarItem
              icon={<CalendarDays size={17} />}
              label="Attendance"
              onClick={() => {
                closeMenus();
                navigate("/student/attendance");
              }}
            />

            <SidebarItem
              icon={<ClipboardList size={17} />}
              label="Assignments"
              onClick={() => {
                closeMenus();
                navigate("/student/assignments");
              }}
            />

            <SidebarItem
              icon={<FileText size={17} />}
              label="Results"
              onClick={() => {
                closeMenus();
                navigate("/student/results");
              }}
            />

            {/* ACADEMIC */}

            <p className="mt-7 px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
              ACADEMIC
            </p>

            <SidebarItem
              icon={<Clock3 size={17} />}
              label="Timetable"
              onClick={() => {
                closeMenus();
                navigate("/student/timetable");
              }}
            />

            <SidebarItem
              icon={<CalendarDays size={17} />}
              label="Exam Schedule"
              onClick={() => {
                closeMenus();
                navigate("/student/exams");
              }}
            />

            <SidebarItem
              icon={<FileText size={17} />}
              label="Fees"
              onClick={() => {
                closeMenus();
                navigate("/student/fees");
              }}
            />

            <SidebarItem
              icon={<Bell size={17} />}
              label="Notices"
              onClick={() => {
                closeMenus();
                navigate("/student/notices");
              }}
            />
          </nav>

          {/* ACCOUNT */}

          <div className="border-t border-slate-200 p-3">
            <SidebarItem
              icon={<User size={17} />}
              label="My Profile"
              onClick={() => {
                closeMenus();
                navigate("/student/profile");
              }}
            />

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-[68px] z-30 bg-slate-900/20 lg:hidden"
        />
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="pt-[68px] lg:pl-[235px]">
        <div className="mx-auto max-w-[1350px] px-5 py-7 lg:px-8">
          {/* BREADCRUMB */}

          <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => navigate("/student/subjects")}
              className="transition hover:text-[#123b63]"
            >
              My Subjects
            </button>

            <span className="text-slate-300">/</span>

            <span className="text-slate-700">{subject.code}</span>
          </div>

          {/* =================================================
              SUBJECT HEADER
          ================================================= */}

          <section className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-7">
              <div className="flex flex-col justify-between gap-5 md:flex-row">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#123b63]">
                      {subject.code}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                    <span className="text-xs text-slate-500">
                      Semester {subject.semester}
                    </span>
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                    {subject.name}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {subject.description ||
                      "Course information, learning materials, assignments and academic resources for this subject."}
                  </p>
                </div>

                <div className="flex shrink-0 items-start">
                  <span className="border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                    Active Course
                  </span>
                </div>
              </div>
            </div>

            {/* SUBJECT INFORMATION */}

            <div className="grid grid-cols-2 md:grid-cols-4">
              <MetaItem label="Course Code" value={subject.code} />

              <MetaItem label="Credits" value={subject.creditHours || "—"} />

              <MetaItem
                label="Semester"
                value={`Semester ${subject.semester}`}
              />

              <MetaItem
                label="Instructor"
                value={subject.teacher?.name || "Not assigned"}
              />
            </div>
          </section>

          {/* =================================================
              COURSE NAVIGATION
          ================================================= */}

          <div className="mt-6 border-b border-slate-200 bg-white">
            <div className="flex overflow-x-auto">
              {[
                ["overview", "Overview"],
                ["course", "Course"],
                ["tasks", "Tasks"],
                ["resources", "Resources"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    whitespace-nowrap border-b-2 px-5 py-4 text-sm font-medium transition
                    ${
                      activeTab === key
                        ? "border-[#123b63] text-[#123b63]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENT */}

          {activeTab === "overview" && <Overview subject={subject} />}

          {activeTab === "course" && <CourseContent />}

          {activeTab === "tasks" && <TasksContent navigate={navigate} />}

          {activeTab === "resources" && <ResourcesContent />}
        </div>
      </main>
    </div>
  );
};

/* ============================================================
   OVERVIEW
============================================================ */

const Overview = ({ subject }) => {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
      <div className="space-y-6">
        {/* COURSE PROGRESS */}

        <section className="border border-slate-200 bg-white">
          <SectionHeader title="Course Progress" />

          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold text-[#123b63]">38%</p>

                <p className="mt-1 text-xs text-slate-500">Course completion</p>
              </div>

              <span className="text-xs text-slate-500">Week 4 of 12</span>
            </div>

            <div className="mt-5 h-2 bg-slate-100">
              <div className="h-full bg-[#123b63]" style={{ width: "38%" }} />
            </div>
          </div>
        </section>

        {/* CONTINUE LEARNING */}

        <section className="border border-slate-200 bg-white">
          <SectionHeader title="Continue Learning" />

          <div className="flex flex-col justify-between gap-5 px-5 py-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#edf3f8] text-[#123b63]">
                <BookOpen size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-500">Week 04</p>

                <h3 className="mt-1 text-sm font-semibold text-slate-800">
                  Stacks and Queues
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Lecture notes · Practice questions
                </p>
              </div>
            </div>

            <button className="flex items-center gap-2 text-xs font-medium text-[#123b63] hover:underline">
              Continue
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* LEARNING OBJECTIVES */}

        <section className="border border-slate-200 bg-white">
          <SectionHeader title="Learning Objectives" />

          <div className="px-5 py-4">
            <Objective text="Understand fundamental data structures and their applications." />

            <Objective text="Analyze algorithms using time and space complexity." />

            <Objective text="Implement common data structures using programming techniques." />

            <Objective text="Apply appropriate algorithms to solve computational problems." />
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}

      <div className="space-y-6">
        {/* NEXT CLASS */}

        <section className="border border-slate-200 bg-white">
          <SectionHeader title="Next Class" />

          <div className="p-5">
            <p className="text-xs text-slate-500">Thursday · 10:00 AM</p>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              Stacks and Queues
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Room 302 · Texas College
            </p>
          </div>
        </section>

        {/* ASSESSMENT */}

        <section className="border border-slate-200 bg-white">
          <SectionHeader title="Assessment" />

          <div>
            <AssessmentRow label="Assignments" value="20%" />

            <AssessmentRow label="Attendance" value="10%" />

            <AssessmentRow label="Pre-Board" value="30%" />

            <AssessmentRow label="Final Examination" value="40%" />
          </div>
        </section>

        {/* COURSE INFORMATION */}

        <section className="border border-slate-200 bg-white">
          <SectionHeader title="Course Information" />

          <div className="p-5 text-xs leading-6 text-slate-500">
            <p>
              This workspace contains the learning materials, weekly modules,
              tasks and academic resources for this course.
            </p>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p>
                <span className="text-slate-400">Course:</span>{" "}
                {subject.course || "Bachelor of Information Technology"}
              </p>

              <p>
                <span className="text-slate-400">Credits:</span>{" "}
                {subject.creditHours || "—"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ============================================================
   COURSE CONTENT
============================================================ */

const CourseContent = () => {
  const weeks = [
    {
      week: "Week 01",
      title: "Introduction to Data Structures",
      status: "completed",
      items: "3 materials",
    },
    {
      week: "Week 02",
      title: "Arrays and Linked Lists",
      status: "completed",
      items: "4 materials",
    },
    {
      week: "Week 03",
      title: "Stacks and Queues",
      status: "completed",
      items: "3 materials",
    },
    {
      week: "Week 04",
      title: "Trees and Binary Trees",
      status: "current",
      items: "2 materials",
    },
    {
      week: "Week 05",
      title: "Graphs",
      status: "locked",
      items: "Coming soon",
    },
    {
      week: "Week 06",
      title: "Sorting Algorithms",
      status: "locked",
      items: "Coming soon",
    },
    {
      week: "Week 07",
      title: "Searching Algorithms",
      status: "locked",
      items: "Coming soon",
    },
    {
      week: "Week 08",
      title: "Hashing",
      status: "locked",
      items: "Coming soon",
    },
  ];

  return (
    <section className="mt-6 border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-sm font-semibold text-slate-800">Course Roadmap</h2>

        <p className="mt-1 text-xs text-slate-500">
          Follow the weekly course structure and learning materials.
        </p>
      </div>

      <div>
        {weeks.map((item) => (
          <div
            key={item.week}
            className={`
              flex items-center gap-4 border-b border-slate-100 px-5 py-5
              last:border-b-0
              ${
                item.status === "current"
                  ? "bg-[#f8fafc]"
                  : "hover:bg-[#fafafa]"
              }
            `}
          >
            {/* STATUS */}

            <div className="shrink-0">
              {item.status === "completed" && (
                <CheckCircle2 size={20} className="text-green-600" />
              )}

              {item.status === "current" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#123b63]">
                  <div className="h-2 w-2 rounded-full bg-[#123b63]" />
                </div>
              )}

              {item.status === "locked" && (
                <Circle size={20} className="text-slate-300" />
              )}
            </div>

            {/* WEEK */}

            <div className="hidden w-16 text-xs font-medium text-slate-400 sm:block">
              {item.week}
            </div>

            {/* CONTENT */}

            <div className="flex-1">
              <h3
                className={`
                  text-sm font-medium
                  ${
                    item.status === "locked"
                      ? "text-slate-400"
                      : "text-slate-800"
                  }
                `}
              >
                {item.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">{item.items}</p>
            </div>

            {/* ACTION */}

            {item.status === "current" && (
              <button className="text-xs font-medium text-[#123b63] hover:underline">
                Open
              </button>
            )}

            {item.status === "completed" && (
              <span className="text-xs text-green-600">Completed</span>
            )}

            {item.status === "locked" && (
              <span className="text-xs text-slate-400">Locked</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ============================================================
   TASKS
============================================================ */

const TasksContent = ({ navigate }) => {
  const tasks = [
    {
      title: "Data Structures Assignment",
      type: "Assignment",
      due: "September 20, 2026",
      marks: "20 marks",
      status: "Pending",
    },
    {
      title: "Stack Implementation",
      type: "Practical",
      due: "September 23, 2026",
      marks: "10 marks",
      status: "Pending",
    },
    {
      title: "Linked List Practice",
      type: "Practice",
      due: "Completed",
      marks: "—",
      status: "Completed",
    },
  ];

  return (
    <section className="mt-6 border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-sm font-semibold text-slate-800">Course Tasks</h2>

        <p className="mt-1 text-xs text-slate-500">
          Assignments and activities related to this course.
        </p>
      </div>

      {tasks.map((task) => (
        <div
          key={task.title}
          className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 md:flex-row md:items-center"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-50 text-[#123b63]">
            <ClipboardList size={17} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">{task.title}</p>

            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{task.type}</span>
              <span>•</span>
              <span>{task.due}</span>
              <span>•</span>
              <span>{task.marks}</span>
            </div>
          </div>

          <span
            className={`
              text-xs font-medium
              ${
                task.status === "Completed"
                  ? "text-green-600"
                  : "text-amber-600"
              }
            `}
          >
            {task.status}
          </span>

          <button
            onClick={() => navigate("/student/assignments")}
            className="text-xs font-medium text-[#123b63] hover:underline"
          >
            View
          </button>
        </div>
      ))}
    </section>
  );
};

/* ============================================================
   RESOURCES
============================================================ */

const ResourcesContent = () => {
  const resources = [
    {
      title: "Course Syllabus",
      type: "PDF",
      size: "245 KB",
    },
    {
      title: "Lecture Notes — Week 01",
      type: "PDF",
      size: "1.2 MB",
    },
    {
      title: "Lecture Notes — Week 02",
      type: "PDF",
      size: "980 KB",
    },
    {
      title: "Practice Questions",
      type: "PDF",
      size: "420 KB",
    },
    {
      title: "Recommended Reading",
      type: "Document",
      size: "180 KB",
    },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* RESOURCES */}

      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <h2 className="text-sm font-semibold text-slate-800">
            Course Resources
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Study materials and documents for this course.
          </p>
        </div>

        {resources.map((resource) => (
          <div
            key={resource.title}
            className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-[#fafafa]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-50 text-[#123b63]">
              <FileText size={17} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">
                {resource.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {resource.type} · {resource.size}
              </p>
            </div>

            <button
              className="text-slate-400 transition hover:text-[#123b63]"
              title="Download"
            >
              <Download size={17} />
            </button>
          </div>
        ))}
      </section>

      {/* PAST PAPERS */}

      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <h2 className="text-sm font-semibold text-slate-800">
            Past Examination Papers
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Official examination papers will appear here when uploaded.
          </p>
        </div>

        <div className="px-5 py-10 text-center">
          <FileText size={30} className="mx-auto text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            No official papers uploaded yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Pre-Board and Final examination papers will be available here.
          </p>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
   REUSABLE UI COMPONENTS
============================================================ */

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex w-full items-center gap-3 px-3 py-2.5 text-sm transition
      ${
        active
          ? "bg-[#edf3f8] font-medium text-[#123b63]"
          : "text-slate-600 hover:bg-slate-50 hover:text-[#123b63]"
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const SectionHeader = ({ title }) => (
  <div className="border-b border-slate-200 px-5 py-4">
    <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
  </div>
);

const MetaItem = ({ label, value }) => (
  <div className="border-r border-slate-200 px-5 py-4 last:border-r-0">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1.5 truncate text-sm font-medium text-slate-700">
      {value}
    </p>
  </div>
);

const Objective = ({ text }) => (
  <div className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0">
    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#123b63]" />

    <p className="text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

const AssessmentRow = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 last:border-b-0">
    <span className="text-xs text-slate-600">{label}</span>

    <span className="text-xs font-medium text-slate-800">{value}</span>
  </div>
);

export default StudentSubjectDetails;
