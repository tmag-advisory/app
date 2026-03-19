import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import { usePaymentSuccessModal, PaymentSuccessModal } from "../components/payment/PaymentSuccessModal";
import { AnimatePresence } from "framer-motion";

const UserDashboardLayout = () => {
    const { showModal, closeModal } = usePaymentSuccessModal();

    return (
        <div className="min-h-screen bg-background-primary">
            <Sidebar />
            <main className="lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-6xl">
                <Outlet />
            </main>

            {/* Payment success modal */}
            <AnimatePresence>
                {showModal && <PaymentSuccessModal onClose={closeModal} />}
            </AnimatePresence>
        </div>
    );
};

export default UserDashboardLayout;
