import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

const UserDashboardLayout = () => {
    return (
        <div className="min-h-screen bg-background-primary">
            <Sidebar />
            <main className="lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-6xl">
                <Outlet />
            </main>
        </div>
    );
};

export default UserDashboardLayout;
