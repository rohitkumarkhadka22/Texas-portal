import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, LogOut, User, Settings } from "lucide-react";

const StudentNavbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const userName = user?.name || "Student";

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-[1700px]">
        {/* NAVBAR */}
        <div className="glass-light group flex h-[64px] items-center justify-between rounded-[22px] px-3 sm:px-5">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.025] text-black/50 hover:bg-black hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            {/* LOGO */}
            <Link
              to="/student/dashboard"
              className="group/logo flex items-center gap-3"
            >
              {/* Temporary Logo */}
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] border border-black/10 bg-black text-white shadow-sm">
                <span className="relative text-[10px] font-bold tracking-[0.12em]">
                  TC
                </span>
              </div>

              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold tracking-[-0.02em] text-black">
                  TEXAS COLLEGE
                </p>

                <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.25em] text-black/35">
                  Student Portal
                </p>
              </div>
            </Link>
          </div>

          {/* CENTER NAV */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/student/dashboard"
              className="rounded-full px-4 py-2 text-[11px] font-medium text-black/80 hover:bg-black hover:text-white"
            >
              Overview
            </Link>

            <Link
              to="/student/subjects"
              className="rounded-full px-4 py-2 text-[11px] font-medium text-black/40 hover:bg-black hover:text-white"
            >
              Academics
            </Link>

            <Link
              to="/student/timetable"
              className="rounded-full px-4 py-2 text-[11px] font-medium text-black/40 hover:bg-black hover:text-white"
            >
              Schedule
            </Link>

            <Link
              to="/student/notices"
              className="rounded-full px-4 py-2 text-[11px] font-medium text-black/40 hover:bg-black hover:text-white"
            >
              Campus
            </Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification */}
            <button
              type="button"
              onClick={() => navigate("/student/notices")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.025] text-black/45 hover:bg-black hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={17} />

              <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-black" />
            </button>

            {/* Profile */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.025] py-1 pl-1 pr-2 hover:bg-black hover:text-white sm:gap-3 sm:pr-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {initials}
                </div>

                <div className="hidden text-left md:block">
                  <p className="max-w-[120px] truncate text-xs font-medium text-black/80 group-hover:text-white">
                    {userName}
                  </p>

                  <p className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                    Student
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className={`hidden text-black/30 transition-transform md:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="glass-light absolute right-0 top-[52px] w-[245px] overflow-hidden rounded-[22px]">
                  {/* User */}
                  <div className="border-b border-black/[0.08] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-black/90">
                          {userName}
                        </p>

                        <p className="truncate text-xs text-black/35">
                          {user?.email || "Student account"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/student/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-black/55 hover:bg-black hover:text-white"
                    >
                      <User size={15} />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/student/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-black/55 hover:bg-black hover:text-white"
                    >
                      <Settings size={15} />
                      Account Settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-black/[0.08] p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-black/50 hover:bg-black hover:text-white"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GLASS REFLECTION */}
        <div className="mx-8 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>
    </header>
  );
};

export default StudentNavbar;
