import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "../components/dashboard/Sidebar";
import { usePaymentSuccessModal, PaymentSuccessModal } from "../components/payment/PaymentSuccessModal";
import { AnimatePresence } from "framer-motion";
import DashboardFooter from "../components/dashboard/DashboardFooter";

const UserDashboardLayout = () => {
    const { showModal, closeModal } = usePaymentSuccessModal();

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background-primary">
            {/*<DashboardAmbientBackground />*/}
            <Sidebar />
            <main className="relative z-10 lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-6xl">
                <Outlet />
            </main>
            <DashboardFooter />

            {/* Payment success modal */}
            <AnimatePresence>
                {showModal && <PaymentSuccessModal onClose={closeModal} />}
            </AnimatePresence>

            <Toaster position="top-right" containerStyle={{ fontSize: "14px" }} />
        </div>
    );
};

export default UserDashboardLayout;
