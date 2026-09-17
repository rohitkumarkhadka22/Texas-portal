import { Outlet } from "react-router-dom";
import { useState } from "react";

import StudentNavbar from "../components/StudentNavbar";
import StudentSidebar from "../components/StudentSidebar";
import StudentFooter from "../components/StudentFooter";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-black">
      {/* =========================================
          AMBIENT LIGHT
      ========================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-black/[0.025] blur-[140px]" />

        <div className="absolute -right-40 top-[15%] h-[560px] w-[560px] rounded-full bg-black/[0.02] blur-[150px]" />

        <div className="absolute bottom-[-280px] left-[35%] h-[520px] w-[520px] rounded-full bg-black/[0.02] blur-[150px]" />
      </div>

      {/* =========================================
          NAVBAR
      ========================================= */}
      <StudentNavbar setSidebarOpen={setSidebarOpen} />

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <main className="relative z-10 min-h-screen pt-[96px] lg:pl-[280px]">
        <div className="mx-auto w-full max-w-[1700px] px-4 pb-12 sm:px-6 lg:px-8">
          <Outlet />

          {/* =========================================
              FOOTER
          ========================================= */}
          <StudentFooter />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
