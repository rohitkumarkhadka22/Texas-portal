import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  CalendarDays,
  CreditCard,
  Bell,
  User,
  ChevronRight,
  Clock3,
} from "lucide-react";

import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import StudentSidebar from "../components/StudentSidebar";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
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
      console.error("User data error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const profileResponse = await api.get("/students/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(profileResponse.data.student);

        const attendanceResponse = await api.get("/attendance/my-summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAttendance(attendanceResponse.data);
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (!user) return null;

  const attendancePercentage =
    attendance?.percentage !== undefined ? Number(attendance.percentage) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <StudentNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =====================================================
          LEFT SIDEBAR
      ====================================================== */}

      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage="dashboard"
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="min-h-screen pt-[68px] lg:pl-[250px]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <section className="mb-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-1 text-sm font-medium text-[#123b63]">
                  Welcome back
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {user.name}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Here is your academic overview and latest updates.
                </p>
              </div>

              {profile && (
                <div className="border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Current Program
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <GraduationCap size={17} className="text-[#123b63]" />

                    <p className="text-sm font-semibold text-slate-800">
                      {profile.course} · Semester {profile.semester}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              STUDENT INFORMATION
          ================================================== */}

          <section className="mb-7 overflow-hidden border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Student Information
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Your current academic details
                </p>
              </div>

              <button
                onClick={() => navigate("/student/profile")}
                className="flex items-center gap-1 text-xs font-medium text-[#123b63] hover:text-slate-900"
              >
                View profile
                <ChevronRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="animate-pulse">
                    <div className="h-3 w-20 bg-slate-200" />

                    <div className="mt-3 h-5 w-28 bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : profile ? (
              <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Student ID" value={profile.studentId} />

                <InfoItem label="Course" value={profile.course} />

                <InfoItem
                  label="Semester"
                  value={`Semester ${profile.semester}`}
                />

                <InfoItem
                  label="Section"
                  value={profile.section || "Not assigned"}
                />
              </div>
            ) : (
              <div className="px-5 py-8 text-sm text-slate-500">
                Student profile not available.
              </div>
            )}
          </section>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={ClipboardCheck}
              label="Attendance"
              value={
                attendancePercentage !== null ? `${attendancePercentage}%` : "—"
              }
              description="Overall attendance"
            />

            <StatCard
              icon={FileText}
              label="Assignments"
              value="—"
              description="Pending assignments"
            />

            <StatCard
              icon={GraduationCap}
              label="Results"
              value="—"
              description="Latest result"
            />

            <StatCard
              icon={CreditCard}
              label="Fees"
              value="—"
              description="Outstanding amount"
            />
          </section>

          {/* =================================================
              MAIN DASHBOARD
          ================================================== */}

          <section className="grid gap-6 xl:grid-cols-3">
            {/* Academic */}

            <DashboardSection
              title="Academic"
              description="Manage your academic activities"
              className="xl:col-span-2"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionCard
                  icon={BookOpen}
                  title="My Subjects"
                  description="View enrolled subjects"
                  onClick={() => navigate("/student/subjects")}
                />

                <ActionCard
                  icon={ClipboardCheck}
                  title="Attendance"
                  description="Check your attendance record"
                  onClick={() => navigate("/student/attendance")}
                />

                <ActionCard
                  icon={FileText}
                  title="Assignments"
                  description="View and submit assignments"
                  onClick={() => navigate("/student/assignments")}
                />

                <ActionCard
                  icon={GraduationCap}
                  title="Results"
                  description="View examination results"
                  onClick={() => navigate("/student/results")}
                />
              </div>
            </DashboardSection>

            {/* Today's Schedule */}

            <DashboardSection
              title="Today's Schedule"
              description="Your classes for today"
            >
              <div className="flex min-h-[185px] flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center bg-slate-100 text-[#123b63]">
                  <Clock3 size={21} />
                </div>

                <p className="text-sm font-medium text-slate-800">
                  View today's timetable
                </p>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
                  Check your class times, subjects and rooms.
                </p>

                <button
                  onClick={() => navigate("/student/timetable")}
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#123b63] hover:text-slate-900"
                >
                  Open timetable
                  <ChevronRight size={14} />
                </button>
              </div>
            </DashboardSection>
          </section>

          {/* =================================================
              EXAM + NOTICES
          ================================================== */}

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Examination */}

            <DashboardSection
              title="Examination"
              description="Upcoming examination information"
            >
              <button
                onClick={() => navigate("/student/exams")}
                className="group flex w-full items-center justify-between border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-[#123b63]">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Exam Schedule
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View your pre-board and final examination schedule.
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#123b63]"
                />
              </button>
            </DashboardSection>

            {/* Notices */}

            <DashboardSection
              title="College Notices"
              description="Latest announcements from college"
            >
              <button
                onClick={() => navigate("/student/notices")}
                className="group flex w-full items-center justify-between border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-[#123b63]">
                    <Bell size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      View Notices
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Stay updated with college announcements.
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#123b63]"
                />
              </button>
            </DashboardSection>
          </section>

          {/* =================================================
              QUICK ACCESS
          ================================================== */}

          <section className="mt-6 overflow-hidden border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Quick Access
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Frequently used student services
              </p>
            </div>

            <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <QuickLink
                icon={CreditCard}
                title="Fee Details"
                onClick={() => navigate("/student/fees")}
              />

              <QuickLink
                icon={Bell}
                title="Notices"
                onClick={() => navigate("/student/notices")}
              />

              <QuickLink
                icon={User}
                title="My Profile"
                onClick={() => navigate("/student/profile")}
              />

              <QuickLink
                icon={CalendarDays}
                title="Exam Schedule"
                onClick={() => navigate("/student/exams")}
              />
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================== */}

          <footer className="py-8 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Texas College · Student Portal
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

/* ============================================================
   INFO ITEM
============================================================ */

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
};

/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({ icon: Icon, label, value, description }) => {
  return (
    <div className="border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center bg-slate-100 text-[#123b63]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   DASHBOARD SECTION
============================================================ */

const DashboardSection = ({ title, description, children, className = "" }) => {
  return (
    <div
      className={`overflow-hidden border border-slate-200 bg-white ${className}`}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

/* ============================================================
   ACTION CARD
============================================================ */

const ActionCard = ({ icon: Icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-slate-700 transition group-hover:text-[#123b63]">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#123b63]"
      />
    </button>
  );
};

/* ============================================================
   QUICK LINK
============================================================ */

const QuickLink = ({ icon: Icon, title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
    >
      <Icon size={18} className="text-[#123b63]" />

      <span className="text-sm font-medium text-slate-700">{title}</span>

      <ChevronRight size={15} className="ml-auto text-slate-400" />
    </button>
  );
};

export default StudentDashboard;
