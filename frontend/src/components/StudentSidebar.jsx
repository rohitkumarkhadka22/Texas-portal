import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Receipt,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activePage = "",
}) => {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);

    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const isActive = (page) => activePage === page;

  const baseItem =
    "flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-[13px] font-medium transition";

  const activeItem =
    "border-[#123b63] bg-slate-50 text-[#123b63]";

  const inactiveItem =
    "border-transparent text-slate-600 hover:bg-slate-50 hover:text-[#123b63]";

  return (
    <>
      {/* Mobile Overlay */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed left-0 top-[68px] z-40
          h-[calc(100vh-68px)]
          w-[250px]
          border-r border-slate-200
          bg-white
          transition-transform duration-200
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Mobile Header */}

        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap
              size={18}
              className="text-[#123b63]"
            />

            <span className="text-sm font-semibold text-slate-700">
              Student Menu
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}

        <div className="h-[calc(100%-56px)] overflow-y-auto px-3 py-5 lg:h-full">

          {/* ============================================
              ACADEMICS
          ============================================ */}

          <div className="mb-6">

            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Academics
            </p>

            {/* Dashboard */}

            <button
              type="button"
              onClick={() => goTo("/student/dashboard")}
              className={`${baseItem} ${
                isActive("dashboard")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <LayoutDashboard size={17} />

              <span>Dashboard</span>
            </button>

            {/* My Subjects */}

            <button
              type="button"
              onClick={() => goTo("/student/subjects")}
              className={`${baseItem} ${
                isActive("subjects")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <BookOpen size={17} />

              <span>My Subjects</span>
            </button>

          </div>


          {/* ============================================
              LEARNING
          ============================================ */}

          <div className="mb-6">

            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Learning
            </p>

            {/* Attendance */}

            <button
              type="button"
              onClick={() => goTo("/student/attendance")}
              className={`${baseItem} ${
                isActive("attendance")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <ClipboardCheck size={17} />

              <span>Attendance</span>
            </button>

            {/* Assignments */}

            <button
              type="button"
              onClick={() => goTo("/student/assignments")}
              className={`${baseItem} ${
                isActive("assignments")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <ClipboardList size={17} />

              <span>Assignments</span>
            </button>

            {/* Results */}

            <button
              type="button"
              onClick={() => goTo("/student/results")}
              className={`${baseItem} ${
                isActive("results")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <FileText size={17} />

              <span>Results</span>
            </button>

          </div>


          {/* ============================================
              ACADEMIC SERVICES
          ============================================ */}

          <div className="mb-6">

            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Academic Services
            </p>

            {/* Timetable */}

            <button
              type="button"
              onClick={() => goTo("/student/timetable")}
              className={`${baseItem} ${
                isActive("timetable")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <CalendarDays size={17} />

              <span>Timetable</span>
            </button>

            {/* Exam Schedule */}

            <button
              type="button"
              onClick={() => goTo("/student/exams")}
              className={`${baseItem} ${
                isActive("exams")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <GraduationCap size={17} />

              <span>Exam Schedule</span>
            </button>

            {/* Fees */}

            <button
              type="button"
              onClick={() => goTo("/student/fees")}
              className={`${baseItem} ${
                isActive("fees")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <Receipt size={17} />

              <span>Fees</span>
            </button>

          </div>


          {/* ============================================
              ACCOUNT
          ============================================ */}

          <div className="mb-6">

            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Account
            </p>

            {/* Notices */}

            <button
              type="button"
              onClick={() => goTo("/student/notices")}
              className={`${baseItem} ${
                isActive("notices")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <FileText size={17} />

              <span>Notices</span>
            </button>

            {/* My Profile */}

            <button
              type="button"
              onClick={() => goTo("/student/profile")}
              className={`${baseItem} ${
                isActive("profile")
                  ? activeItem
                  : inactiveItem
              }`}
            >
              <User size={17} />

              <span>My Profile</span>
            </button>

          </div>


          {/* Divider */}

          <div className="my-4 border-t border-slate-100" />


          {/* Sign Out */}

          <button
            type="button"
            onClick={logout}
            className={`${baseItem} border-transparent text-slate-500 hover:bg-red-50 hover:text-red-600`}
          >
            <LogOut size={17} />

            <span>Sign Out</span>
          </button>

        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;