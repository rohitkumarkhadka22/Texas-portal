import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Clock3,
  CreditCard,
  Bell,
  User,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

const StudentSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSidebarOpen(false);
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `
    group flex items-center justify-between rounded-[15px]
    border px-3.5 py-3
    text-[11px] font-medium
    transition-all duration-200
    ${
      isActive
        ? "border-black bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
        : "border-transparent text-black/45 hover:border-black hover:bg-black hover:text-white"
    }
    `;

  const iconClass = ({ isActive }) =>
    `
    transition-transform duration-200
    group-hover:scale-105
    ${isActive ? "text-white" : "text-black/35 group-hover:text-white"}
    `;

  const closeMobile = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={closeMobile}
          className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          left-3
          top-[90px]
          bottom-3
          z-[60]
          w-[260px]
          transform
          transition-transform
          duration-300
          lg:left-5
          lg:top-[90px]
          lg:bottom-5
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"}
        `}
      >
        <div className="glass-light flex h-full flex-col overflow-hidden rounded-[26px] p-3">
          {/* MOBILE HEADER */}
          <div className="mb-2 flex items-center justify-between px-2 py-2 lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                Navigation
              </p>
            </div>

            <button
              type="button"
              onClick={closeMobile}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.025] text-black/45 hover:bg-black hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* BRAND */}
          <div className="mb-4 hidden px-3 pt-2 lg:block">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/30">
              Student Portal
            </p>

            <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.04em] text-black">
              Your Campus
            </h2>
          </div>

          {/* NAVIGATION */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-1">
            {/* MAIN */}
            <div className="mb-5">
              <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-black/25">
                Main
              </p>

              <nav className="space-y-1">
                <NavLink
                  to="/student/dashboard"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3">
                        <LayoutDashboard
                          size={16}
                          className={iconClass({ isActive })}
                        />

                        <span>Dashboard</span>
                      </span>

                      <ChevronRight
                        size={13}
                        className={`transition-transform ${
                          isActive
                            ? "translate-x-0 text-white"
                            : "text-black/15 group-hover:translate-x-0.5 group-hover:text-white"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </nav>
            </div>

            {/* LEARNING */}
            <div className="mb-5">
              <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-black/25">
                Learning
              </p>

              <nav className="space-y-1">
                <NavLink
                  to="/student/subjects"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <BookOpen size={16} className={iconClass({ isActive })} />
                      <span>Subjects</span>
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/student/attendance"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <ClipboardCheck
                        size={16}
                        className={iconClass({ isActive })}
                      />
                      <span>Attendance</span>
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/student/assignments"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <FileText size={16} className={iconClass({ isActive })} />
                      <span>Assignments</span>
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/student/results"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <GraduationCap
                        size={16}
                        className={iconClass({ isActive })}
                      />
                      <span>Results</span>
                    </span>
                  )}
                </NavLink>
              </nav>
            </div>

            {/* CAMPUS */}
            <div className="mb-5">
              <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-black/25">
                Campus
              </p>

              <nav className="space-y-1">
                <NavLink
                  to="/student/timetable"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <Clock3 size={16} className={iconClass({ isActive })} />
                      <span>Timetable</span>
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/student/exams"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <CalendarDays
                        size={16}
                        className={iconClass({ isActive })}
                      />
                      <span>Examinations</span>
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/student/fees"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <CreditCard
                        size={16}
                        className={iconClass({ isActive })}
                      />
                      <span>Fees & Payments</span>
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/student/notices"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <Bell size={16} className={iconClass({ isActive })} />
                      <span>Notices</span>
                    </span>
                  )}
                </NavLink>
              </nav>
            </div>

            {/* ACCOUNT */}
            <div>
              <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-black/25">
                Account
              </p>

              <nav className="space-y-1">
                <NavLink
                  to="/student/profile"
                  onClick={closeMobile}
                  className={navItemClass}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-3">
                      <User size={16} className={iconClass({ isActive })} />
                      <span>My Profile</span>
                    </span>
                  )}
                </NavLink>
              </nav>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="mt-3 border-t border-black/[0.07] pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-[15px] border border-transparent px-3.5 py-3 text-[11px] font-medium text-black/40 hover:border-black hover:bg-black hover:text-white"
            >
              <LogOut
                size={16}
                className="text-black/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
              />

              <span>Sign Out</span>
            </button>

            <div className="mt-3 px-3 pb-1">
              <p className="text-[8px] leading-4 text-black/25">
                Texas College
              </p>

              <p className="text-[7px] uppercase tracking-[0.18em] text-black/20">
                Student Experience
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
