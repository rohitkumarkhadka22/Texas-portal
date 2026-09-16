import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, User, X } from "lucide-react";

const StudentNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setProfileOpen(false);

    navigate("/login");
  };

  const goTo = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  const studentName = user?.name || "Student";
  const studentEmail = user?.email || "Student Account";
  const initial = studentName.charAt(0).toUpperCase();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-[68px] border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            LEFT — MOBILE MENU + COLLEGE BRAND
        ===================================================== */}

        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}

          <button
            type="button"
            onClick={() => setSidebarOpen?.(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#123b63] lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* College Brand */}

          <button
            type="button"
            onClick={() => goTo("/student/dashboard")}
            className="flex items-center gap-3"
          >
            {/* TC Logo */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#123b63] text-xs font-bold tracking-wide text-white">
              TC
            </div>

            {/* College Name */}

            <div className="hidden text-left sm:block">
              <p className="text-[15px] font-semibold leading-none tracking-[-0.01em] text-slate-800">
                Texas College
              </p>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                Student Portal
              </p>
            </div>
          </button>
        </div>

        {/* =====================================================
            CENTER — GLOBAL COLLEGE NAVIGATION
        ===================================================== */}

        <nav className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center lg:flex">
          {/* Home */}

          <button
            type="button"
            onClick={() => goTo("/student/dashboard")}
            className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-600 transition hover:border-[#123b63] hover:text-[#123b63]"
          >
            Home
          </button>

          {/* Academics */}

          <button
            type="button"
            onClick={() => goTo("/student/subjects")}
            className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-600 transition hover:border-[#123b63] hover:text-[#123b63]"
          >
            Academics
          </button>

          {/* Campus */}

          <button
            type="button"
            className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-600 transition hover:border-[#123b63] hover:text-[#123b63]"
          >
            Campus
          </button>

          {/* Support */}

          <button
            type="button"
            className="flex h-full items-center border-b-2 border-transparent px-5 text-[13px] font-medium text-slate-600 transition hover:border-[#123b63] hover:text-[#123b63]"
          >
            Support
          </button>
        </nav>

        {/* =====================================================
            RIGHT — NOTIFICATION + PROFILE
        ===================================================== */}

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification */}

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#123b63]"
            title="Notifications"
          >
            <Bell size={19} />

            {/* Notification Indicator */}

            <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {/* Divider */}

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-md px-1.5 py-1.5 transition hover:bg-slate-50"
            >
              {/* Avatar */}

              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-sm font-semibold text-[#123b63]">
                {initial}
              </div>

              {/* Student Name */}

              <div className="hidden text-left md:block">
                <p className="max-w-[135px] truncate text-[13px] font-semibold text-slate-700">
                  {studentName}
                </p>

                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Student
                </p>
              </div>

              {/* Dropdown Arrow */}

              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {profileOpen && (
              <>
                {/* Click outside */}

                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-[-1] h-screen w-screen cursor-default"
                />

                {/* Dropdown */}

                <div className="absolute right-0 top-[50px] z-50 w-[255px] overflow-hidden border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
                  {/* User Information */}

                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-sm font-semibold text-[#123b63]">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {studentName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {studentEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* My Profile */}

                  <button
                    type="button"
                    onClick={() => goTo("/student/profile")}
                    className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-slate-600 transition hover:bg-slate-50 hover:text-[#123b63]"
                  >
                    <User size={16} />

                    <span>My Profile</span>
                  </button>

                  {/* Sign Out */}

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={16} />

                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
