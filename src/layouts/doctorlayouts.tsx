import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DoctorSidebar from "../components/doctor/DoctorSidebar";

const DoctorDashboardLayout = () => {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background-primary">
            <DoctorSidebar />
            <main className="relative z-10 lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-6xl">
                <Outlet />
            </main>
            <Toaster position="top-right" containerStyle={{ fontSize: "14px" }} />
        </div>
    );
};

export default DoctorDashboardLayout;
