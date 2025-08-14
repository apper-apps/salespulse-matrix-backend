import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
<div className="lg:pl-64">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pt-16 lg:pt-0">
            <div className="p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;