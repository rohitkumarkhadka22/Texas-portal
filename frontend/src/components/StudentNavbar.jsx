import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User,
  ArrowUpRight,
} from "lucide-react";
import collegeLogo from "../assets/images/college-logo.png";

const StudentNavbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);

  /* =========================================
     LOAD USER
  ========================================= */

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Invalid user data:", error);
        }
      }
    };

    loadUser();

    window.addEventListener("profileUpdated", loadUser);

    return () => {
      window.removeEventListener("profileUpdated", loadUser);
    };
  }, []);

  /* =========================================
     PROFILE IMAGE URL
  ========================================= */

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `http://localhost:5001${imagePath}`;
  };

  /* =========================================
     HIDE NAVBAR ON SCROLL
  ========================================= */

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setNavbarVisible(true);
      } else if (currentScrollY > lastScrollY + 4) {
        setNavbarVisible(false);
        setProfileOpen(false);
      } else if (currentScrollY < lastScrollY - 4) {
        setNavbarVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================
     CLOSE DROPDOWN OUTSIDE
  ========================================= */

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

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================================
     LOGO → DASHBOARD
  ========================================= */

  const handleLogoClick = (event) => {
    event.preventDefault();

    setProfileOpen(false);

    if (location.pathname === "/student/dashboard") {
      window.location.reload();
      return;
    }

    navigate("/student/dashboard");

    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  /* =========================================
     USER DATA
  ========================================= */

  const userName = user?.name || "Student";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    relative cursor-pointer rounded-full px-4 py-2
    text-[11px] font-medium
    transition-all duration-300
    ${
      isActive(path)
        ? `
          border border-black/[0.08]
          bg-black/[0.055]
          text-black
          shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
        `
        : `
          border border-transparent
          text-black/40
          hover:border-black/[0.06]
          hover:bg-black/[0.035]
          hover:text-black
        `
    }
  `;

  return (
    <header
      className={`
        fixed left-0 right-0 top-0 z-50
        px-3 pt-3 sm:px-5
        transition-transform
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${navbarVisible ? "translate-y-0" : "-translate-y-[115%]"}
      `}
    >
      <div className="mx-auto max-w-[1700px]">
        {/* =========================================
            MAIN NAVBAR
        ========================================= */}

        <div
          className="
            relative flex h-[64px] items-center justify-between
            rounded-[22px]
            border border-black/[0.08]
            bg-white/[0.72]
            px-3
            shadow-[0_18px_60px_rgba(0,0,0,0.07)]
            backdrop-blur-[30px]
            backdrop-saturate-[170%]
            sm:px-5
          "
        >
          {/* =========================================
              LIQUID GLASS REFLECTIONS
          ========================================= */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
            <div
              className="
                absolute left-[8%] top-0
                h-px w-[35%]
                bg-gradient-to-r
                from-transparent
                via-white
                to-transparent
                opacity-90
              "
            />

            <div
              className="
                absolute -left-20 -top-24
                h-44 w-72
                rounded-full
                bg-white/80
                blur-3xl
              "
            />

            <div
              className="
                absolute -right-20 -top-16
                h-36 w-60
                rounded-full
                bg-white/70
                blur-3xl
              "
            />

            <div
              className="
                absolute bottom-0 left-[15%]
                h-px w-[70%]
                bg-gradient-to-r
                from-transparent
                via-black/[0.06]
                to-transparent
              "
            />
          </div>

          {/* =========================================
              LEFT
          ========================================= */}

          <div className="relative z-10 flex items-center">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                mr-3 flex h-10 w-10
                cursor-pointer
                items-center justify-center
                rounded-full
                border border-black/[0.08]
                bg-black/[0.025]
                text-black/50
                backdrop-blur-xl
                transition-all duration-300
                hover:bg-black/[0.06]
                hover:text-black
                lg:hidden
              "
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            {/* LOGO */}

            <button
              type="button"
              onClick={handleLogoClick}
              className="
                flex h-11
                cursor-pointer
                items-center justify-center
                rounded-full
                transition-all duration-300
                hover:scale-[1.04]
                focus:outline-none
              "
              aria-label="Go to dashboard"
            >
              <img
                src={collegeLogo}
                alt="Texas College"
                className="
                  h-11 w-auto
                  object-contain
                  drop-shadow-[0_3px_10px_rgba(0,0,0,0.10)]
                "
              />
            </button>
          </div>

          {/* =========================================
              CENTER NAVIGATION
          ========================================= */}

          <nav className="relative z-10 hidden items-center gap-1 lg:flex">
            <Link
              to="/student/dashboard"
              className={navLinkClass("/student/dashboard")}
            >
              Overview
            </Link>

            <Link
              to="/student/subjects"
              className={navLinkClass("/student/subjects")}
            >
              Academics
            </Link>

            <Link
              to="/student/timetable"
              className={navLinkClass("/student/timetable")}
            >
              Schedule
            </Link>

            <Link
              to="/student/notices"
              className={navLinkClass("/student/notices")}
            >
              Campus
            </Link>
          </nav>

          {/* =========================================
              RIGHT SIDE
          ========================================= */}

          <div className="relative z-10 flex items-center gap-2 sm:gap-3">
            {/* NOTIFICATION */}

            <button
              type="button"
              onClick={() => navigate("/student/notices")}
              className="
                relative flex h-10 w-10
                cursor-pointer
                items-center justify-center
                rounded-full
                border border-black/[0.08]
                bg-black/[0.025]
                text-black/45
                backdrop-blur-xl
                transition-all duration-300
                hover:bg-black/[0.055]
                hover:text-black
              "
              aria-label="Notifications"
            >
              <Bell size={17} />

              <span
                className="
                  absolute right-[9px] top-[8px]
                  h-1.5 w-1.5
                  rounded-full
                  bg-black
                  shadow-[0_0_7px_rgba(0,0,0,0.25)]
                "
              />
            </button>

            {/* =========================================
                PROFILE DROPDOWN
            ========================================= */}

            <div ref={dropdownRef} className="relative">
              {/* PROFILE BUTTON */}

              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="
                  flex cursor-pointer
                  items-center gap-2
                  rounded-full
                  border border-black/[0.08]
                  bg-black/[0.025]
                  py-1 pl-1 pr-2
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:bg-black/[0.055]
                  sm:gap-3 sm:pr-3
                "
              >
                {/* PROFILE IMAGE */}

                {user?.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={userName}
                    className="
                      h-8 w-8
                      shrink-0
                      rounded-full
                      border border-black/[0.08]
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-8 w-8
                      shrink-0
                      items-center justify-center
                      rounded-full
                      bg-black
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    {initials}
                  </div>
                )}

                {/* NAME */}

                <div className="hidden text-left md:block">
                  <p
                    className="
                      max-w-[120px]
                      truncate
                      text-xs
                      font-medium
                      text-black/80
                    "
                  >
                    {userName}
                  </p>

                  <p
                    className="
                      text-[8px]
                      uppercase
                      tracking-[0.16em]
                      text-black/30
                    "
                  >
                    Student
                  </p>
                </div>

                {/* CHEVRON */}

                <ChevronDown
                  size={14}
                  className={`
                    hidden
                    text-black/30
                    transition-transform
                    duration-300
                    md:block
                    ${profileOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* =========================================
                  DROPDOWN MENU
              ========================================= */}

              {profileOpen && (
                <div
                  className="
                    absolute right-0 top-[58px] z-[100]
                    w-[285px]
                    overflow-hidden
                    rounded-[22px]
                    border border-black/[0.08]
                    bg-white/[0.94]
                    shadow-[0_25px_70px_rgba(0,0,0,0.16)]
                    backdrop-blur-[30px]
                    backdrop-saturate-[170%]
                  "
                >
                  {/* TOP REFLECTION */}

                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="
                        absolute -left-10 -top-10
                        h-32 w-40
                        rounded-full
                        bg-white
                        opacity-80
                        blur-3xl
                      "
                    />
                  </div>

                  {/* =====================================
                      PROFILE INFORMATION
                  ===================================== */}

                  <div
                    className="
                      relative
                      border-b border-black/[0.07]
                      px-4 py-4
                    "
                  >
                    <div className="flex items-center gap-3">
                      {/* LARGE PROFILE IMAGE */}

                      {user?.profileImage ? (
                        <img
                          src={getImageUrl(user.profileImage)}
                          alt={userName}
                          className="
                            h-14 w-14
                            shrink-0
                            rounded-[17px]
                            border border-black/[0.08]
                            object-cover
                            shadow-[0_8px_25px_rgba(0,0,0,0.08)]
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex h-14 w-14
                            shrink-0
                            items-center justify-center
                            rounded-[17px]
                            bg-black
                            text-base
                            font-bold
                            text-white
                          "
                        >
                          {initials}
                        </div>
                      )}

                      {/* USER DETAILS */}

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            tracking-[-0.02em]
                            text-black/90
                          "
                        >
                          {userName}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-[10px]
                            text-black/40
                          "
                        >
                          {user?.email || "Student account"}
                        </p>

                        <div
                          className="
                            mt-2 inline-flex
                            rounded-full
                            border border-black/[0.07]
                            bg-black/[0.025]
                            px-2 py-1
                          "
                        >
                          <span
                            className="
                              text-[7px]
                              font-semibold
                              uppercase
                              tracking-[0.16em]
                              text-black/40
                            "
                          >
                            Student
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =====================================
                      PROFILE ACTION
                  ===================================== */}

                  <div className="relative p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/student/profile");
                      }}
                      className="
                        group
                        flex w-full
                        cursor-pointer
                        items-center justify-between
                        rounded-[16px]
                        border border-black/[0.07]
                        bg-black/[0.025]
                        px-3.5 py-3
                        transition-all duration-200
                        hover:border-black
                        hover:bg-black
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex h-9 w-9
                            items-center justify-center
                            rounded-[12px]
                            bg-black
                            text-white
                            transition-all duration-200
                            group-hover:bg-white
                            group-hover:text-black
                          "
                        >
                          <User size={15} />
                        </div>

                        <div className="text-left">
                          <p
                            className="
                              text-[11px]
                              font-semibold
                              text-black/80
                              transition-colors
                              group-hover:text-white
                            "
                          >
                            View Profile
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[8px]
                              uppercase
                              tracking-[0.12em]
                              text-black/30
                              transition-colors
                              group-hover:text-white/50
                            "
                          >
                            Personal & academic details
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight
                        size={14}
                        className="
                          text-black/25
                          transition-all duration-200
                          group-hover:-translate-y-0.5
                          group-hover:translate-x-0.5
                          group-hover:text-white/70
                        "
                      />
                    </button>
                  </div>

                  {/* =====================================
                      SIGN OUT
                  ===================================== */}

                  <div
                    className="
                      relative
                      border-t border-black/[0.07]
                      p-2
                    "
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        group
                        flex w-full
                        cursor-pointer
                        items-center gap-3
                        rounded-[14px]
                        border border-transparent
                        px-3 py-2.5
                        text-xs
                        text-black/50
                        transition-all duration-200
                        hover:border-black
                        hover:bg-black
                        hover:text-white
                      "
                    >
                      <LogOut
                        size={15}
                        className="
                          transition-colors duration-200
                          group-hover:text-white
                        "
                      />

                      <span
                        className="
                          transition-colors duration-200
                          group-hover:text-white
                        "
                      >
                        Sign Out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBTLE REFLECTION */}

        <div
          className="
            pointer-events-none
            mx-8 h-px
            bg-gradient-to-r
            from-transparent
            via-black/[0.08]
            to-transparent
          "
        />
      </div>
    </header>
  );
};

export default StudentNavbar;
