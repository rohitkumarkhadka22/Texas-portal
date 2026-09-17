import {
  ArrowUpRight,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  MoreHorizontal,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse logged-in user:", error);
      }
    }
  }, []);

  const userName = user?.name || "Student";

  const firstName = userName.split(" ")[0];

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const classes = [
    {
      time: "10:00 AM",
      period: "01",
      subject: "Database Management System",
      code: "DBMS301",
      type: "Lecture",
      room: "Room 204",
      duration: "90 min",
    },
    {
      time: "01:00 PM",
      period: "02",
      subject: "Web Technology",
      code: "WBT302",
      type: "Practical",
      room: "Computer Lab 01",
      duration: "90 min",
    },
  ];

  const assignments = [
    {
      title: "Database Design Assignment",
      subject: "DBMS301",
      due: "Sep 25",
      status: "Pending",
    },
    {
      title: "Web Technology Project",
      subject: "WBT302",
      due: "Sep 28",
      status: "Submitted",
    },
    {
      title: "Software Engineering Report",
      subject: "SWE303",
      due: "Oct 02",
      status: "Pending",
    },
  ];

  const quickActions = [
    {
      title: "My Subjects",
      description: "View enrolled subjects",
      icon: BookOpenIcon,
      path: "/student/subjects",
    },
    {
      title: "Attendance",
      description: "Check your attendance",
      icon: CheckCircle2,
      path: "/student/attendance",
    },
    {
      title: "Assignments",
      description: "Track your coursework",
      icon: FileText,
      path: "/student/assignments",
    },
    {
      title: "Results",
      description: "View academic results",
      icon: GraduationCap,
      path: "/student/results",
    },
  ];

  return (
    <div className="relative space-y-5">
      {/* HERO */}
      <section className="group relative overflow-hidden rounded-[30px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.07)]">
        <img
          src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1800&q=85"
          alt="College campus"
          className="
            absolute inset-0 h-full w-full
            object-cover
            grayscale-[25%]
            transition duration-700
            group-hover:scale-[1.02]
          "
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />

        <div className="relative flex min-h-[430px] flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white backdrop-blur-xl">
              <Sparkles size={13} />

              <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                Student Experience
              </span>
            </div>

            <div className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl sm:block">
              Tuesday · September 15
            </div>
          </div>

          <div className="max-w-[850px]">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-white/55">
              Welcome back, {firstName}
            </p>

            <h1 className="max-w-[780px] text-[44px] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-[58px] lg:text-[76px]">
              Your campus.
              <br />
              Your progress.
            </h1>

            <p className="mt-6 max-w-[550px] text-sm leading-6 text-white/65 sm:text-[15px]">
              Everything you need for your academic day, brought together in one
              simple student space.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] text-white/75 backdrop-blur-xl">
                <MapPin size={12} />
                Kathmandu, Nepal
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] text-white/75 backdrop-blur-xl">
                <GraduationCap size={12} />
                BIT · Semester 3
              </div>
            </div>

            <button
              type="button"
              className="
                group/btn
                inline-flex items-center justify-center gap-2
                rounded-full
                bg-white
                px-5 py-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-black
                transition-all duration-200
                hover:bg-black
                hover:text-white
              "
            >
              Explore Portal
              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  group-hover/btn:translate-x-0.5
                  group-hover/btn:-translate-y-0.5
                "
              />
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Attendance"
          value="87%"
          detail="This semester"
          icon={<CheckCircle2 size={17} />}
        />

        <StatCard
          label="Subjects"
          value="06"
          detail="Enrolled subjects"
          icon={<BookOpenIcon size={17} />}
        />

        <StatCard
          label="Assignments"
          value="02"
          detail="Need attention"
          icon={<FileText size={17} />}
        />

        <StatCard
          label="Current GPA"
          value="—"
          detail="Awaiting results"
          icon={<GraduationCap size={17} />}
        />
      </section>

      {/* CLASSES + PROFILE */}
      <section className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        {/* CLASSES */}
        <div className="glass rounded-[28px] p-5 sm:p-6">
          <SectionHeader
            eyebrow="Today"
            title="Your classes"
            action="View timetable"
            path="/student/timetable"
          />

          <div className="mt-6 space-y-3">
            {classes.map((item) => (
              <div key={item.code} className="dashboard-hover-card">
                <div className="flex items-center gap-3 sm:w-[115px] sm:shrink-0">
                  <div className="dashboard-icon-box h-11 w-11 rounded-[14px]">
                    {item.period}
                  </div>

                  <div className="sm:hidden">
                    <p className="dashboard-title text-[11px] font-semibold">
                      {item.time}
                    </p>

                    <p className="dashboard-muted mt-0.5 text-[8px] uppercase tracking-[0.15em]">
                      {item.duration}
                    </p>
                  </div>
                </div>

                <div className="hidden w-[105px] shrink-0 sm:block">
                  <p className="dashboard-title text-[11px] font-semibold">
                    {item.time}
                  </p>

                  <p className="dashboard-muted mt-1 text-[8px] uppercase tracking-[0.15em]">
                    {item.duration}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="dashboard-title truncate text-sm font-semibold tracking-[-0.02em]">
                    {item.subject}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="dashboard-muted text-[9px] font-medium uppercase tracking-[0.14em]">
                      {item.code}
                    </span>

                    <span className="dashboard-dot h-1 w-1 rounded-full" />

                    <span className="dashboard-muted text-[9px]">
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="dashboard-muted flex items-center gap-2 text-[10px]">
                  <MapPin size={13} />

                  <span>{item.room}</span>
                </div>

                <button
                  type="button"
                  className="
                    dashboard-arrow
                    hidden h-9 w-9 items-center justify-center
                    rounded-full
                    sm:flex
                  "
                >
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PROFILE */}
        <div className="glass rounded-[28px] p-5 sm:p-6">
          <SectionHeader eyebrow="Academic profile" title="Student details" />

          <div className="mt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[21px] bg-black text-lg font-semibold text-white">
                {initials || "ST"}
              </div>

              <div>
                <p className="text-base font-semibold tracking-[-0.03em]">
                  {userName}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/35">
                  Student ID · {user?.studentId || "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-black/[0.07]">
              <ProfileRow
                label="Program"
                value={user?.course || "Bachelor of Information Technology"}
              />

              <ProfileRow
                label="Semester"
                value={
                  user?.semester ? `Semester ${user.semester}` : "Semester 3"
                }
              />

              <ProfileRow
                label="Section"
                value={user?.section ? `Section ${user.section}` : "Section B"}
              />

              <ProfileRow
                label="Location"
                value={user?.address || "Lalitpur, Nepal"}
              />
            </div>

            <Link
              to="/student/profile"
              className="
                mt-5 flex w-full items-center justify-between
                rounded-[16px]
                border border-black/[0.08]
                bg-black/[0.025]
                px-4 py-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-black/55
                transition-all duration-200
                hover:border-black
                hover:bg-black
                hover:text-white
              "
            >
              View profile
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ASSIGNMENTS */}
      <section className="glass rounded-[28px] p-5 sm:p-6">
        <SectionHeader
          eyebrow="Coursework"
          title="Assignments"
          action="View all"
          path="/student/assignments"
        />

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Link
              to="/student/assignments"
              key={assignment.title}
              className="dashboard-hover-card !block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="dashboard-icon-box h-10 w-10 rounded-[13px]">
                  <FileText size={16} />
                </div>

                <MoreHorizontal size={16} className="dashboard-muted" />
              </div>

              <div className="mt-5">
                <p className="dashboard-title text-sm font-semibold leading-5 tracking-[-0.02em]">
                  {assignment.title}
                </p>

                <p className="dashboard-muted mt-2 text-[9px] font-medium uppercase tracking-[0.17em]">
                  {assignment.subject}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="dashboard-muted flex items-center gap-2 text-[10px]">
                  <Clock3 size={13} />

                  <span>Due {assignment.due}</span>
                </div>

                <span className="dashboard-status rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em]">
                  {assignment.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section>
        <div className="mb-4 px-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/30">
            Quick access
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-black">
            Keep moving.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                to={action.path}
                key={action.title}
                className="dashboard-hover-card !block"
              >
                <div className="flex items-start justify-between">
                  <div className="dashboard-icon-box h-10 w-10 rounded-[13px]">
                    <Icon size={17} />
                  </div>

                  <ArrowUpRight size={15} className="dashboard-arrow-icon" />
                </div>

                <p className="dashboard-title mt-5 text-sm font-semibold tracking-[-0.02em]">
                  {action.title}
                </p>

                <p className="dashboard-muted mt-1 text-[10px] leading-4">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOVER SYSTEM */}
      <style>{`
        .dashboard-hover-card {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-radius: 22px;
          border: 1px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.55);
          padding: 20px;
          color: #000;
          transition:
            transform 300ms ease,
            background-color 300ms ease,
            border-color 300ms ease,
            color 300ms ease,
            box-shadow 300ms ease;
        }

        .dashboard-hover-card:hover {
          transform: translateY(-4px);
          background: #000;
          border-color: #000;
          color: #fff;
          box-shadow: 0 18px 45px rgba(0,0,0,0.15);
        }

        .dashboard-title {
          color: #000;
          transition: color 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-title {
          color: #fff;
        }

        .dashboard-muted {
          color: rgba(0,0,0,0.38);
          transition: color 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-muted {
          color: rgba(255,255,255,0.55);
        }

        .dashboard-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.07);
          background: rgba(0,0,0,0.025);
          color: rgba(0,0,0,0.5);
          transition:
            background-color 200ms ease,
            border-color 200ms ease,
            color 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-icon-box {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .dashboard-arrow {
          border: 1px solid rgba(0,0,0,0.07);
          color: rgba(0,0,0,0.35);
          transition:
            background-color 200ms ease,
            border-color 200ms ease,
            color 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-arrow {
          border-color: rgba(255,255,255,0.2);
          color: #fff;
        }

        .dashboard-arrow-icon {
          color: rgba(0,0,0,0.2);
          transition:
            color 200ms ease,
            transform 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-arrow-icon {
          color: rgba(255,255,255,0.7);
          transform: translate(2px, -2px);
        }

        .dashboard-dot {
          background: rgba(0,0,0,0.2);
          transition: background-color 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-dot {
          background: rgba(255,255,255,0.3);
        }

        .dashboard-status {
          border-color: rgba(0,0,0,0.08);
          background: rgba(0,0,0,0.025);
          color: rgba(0,0,0,0.5);
          transition:
            background-color 200ms ease,
            border-color 200ms ease,
            color 200ms ease;
        }

        .dashboard-hover-card:hover .dashboard-status {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        @media (min-width: 640px) {
          .dashboard-hover-card {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

/* =========================================
   STAT CARD
========================================= */

const StatCard = ({ label, value, detail, icon }) => {
  return (
    <div className="dashboard-hover-card">
      <div className="flex w-full items-center justify-between">
        <div className="dashboard-icon-box h-9 w-9 rounded-[12px]">{icon}</div>

        <ArrowUpRight size={14} className="dashboard-arrow-icon" />
      </div>

      <div className="mt-5">
        <p className="dashboard-muted text-[9px] font-semibold uppercase tracking-[0.19em]">
          {label}
        </p>

        <p className="dashboard-title mt-1 text-2xl font-semibold tracking-[-0.05em]">
          {value}
        </p>

        <p className="dashboard-muted mt-1 text-[9px]">{detail}</p>
      </div>
    </div>
  );
};

/* =========================================
   SECTION HEADER
========================================= */

const SectionHeader = ({ eyebrow, title, action, path }) => {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-black/30">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-black">
          {title}
        </h2>
      </div>

      {action && (
        <Link
          to={path || "#"}
          className="
            group
            hidden items-center gap-2
            rounded-full
            border border-black/[0.08]
            bg-white/50
            px-3 py-2
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-black/45
            transition-all
            hover:border-black
            hover:bg-black
            hover:text-white
            sm:flex
          "
        >
          {action}

          <ArrowUpRight
            size={13}
            className="
              transition-transform
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </Link>
      )}
    </div>
  );
};

/* =========================================
   PROFILE ROW
========================================= */

const ProfileRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/25">
        {label}
      </span>

      <span className="max-w-[60%] text-right text-[11px] font-medium text-black/65">
        {value}
      </span>
    </div>
  );
};

/* =========================================
   BOOK ICON
========================================= */

const BookOpenIcon = ({ size = 17 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22V4.5Z" />

      <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5A2.5 2.5 0 0 1 22 22V4.5Z" />
    </svg>
  );
};

export default StudentDashboard;
