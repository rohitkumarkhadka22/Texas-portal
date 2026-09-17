import { Link } from "react-router-dom";

const StudentFooter = () => {
  return (
    <footer className="relative z-10 mt-10 border-t border-black/[0.08] pt-8 pb-6">
      <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-black/[0.08] bg-white shadow-sm">
              <span className="text-sm font-bold tracking-[-0.04em]">TC</span>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-black">
                Texas College
              </p>

              <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.2em] text-black/30">
                Student Portal
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-[300px] text-[10px] leading-5 text-black/40">
            Your digital academic space for learning, progress, campus
            information, and student services.
          </p>
        </div>

        {/* ACADEMICS */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
            Academics
          </p>

          <div className="mt-4 space-y-2.5">
            <Link
              to="/student/subjects"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Subjects
            </Link>

            <Link
              to="/student/assignments"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Assignments
            </Link>

            <Link
              to="/student/results"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Results
            </Link>

            <Link
              to="/student/timetable"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Timetable
            </Link>
          </div>
        </div>

        {/* CAMPUS */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
            Campus
          </p>

          <div className="mt-4 space-y-2.5">
            <Link
              to="/student/examinations"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Examinations
            </Link>

            <Link
              to="/student/notices"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Notices
            </Link>

            <Link
              to="/student/fees"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Fees & Payments
            </Link>

            <Link
              to="/student/attendance"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Attendance
            </Link>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
            Account
          </p>

          <div className="mt-4 space-y-2.5">
            <Link
              to="/student/profile"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              My Profile
            </Link>

            <button
              type="button"
              className="block text-[10px] text-black/50 transition hover:text-black"
            >
              Help & Support
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-8 flex flex-col gap-3 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/25">
          © 2026 Texas College. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <span className="text-[8px] uppercase tracking-[0.18em] text-black/25">
            Kathmandu, Nepal
          </span>

          <span className="h-1 w-1 rounded-full bg-black/20" />

          <span className="text-[8px] uppercase tracking-[0.18em] text-black/25">
            Academic Year 2026
          </span>
        </div>
      </div>
    </footer>
  );
};

export default StudentFooter;
