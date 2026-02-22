import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../layouts/homelayouts";
import AuthLayout from "../layouts/authlayouts";
import UserDashboardLayout from "../layouts/userlayouts";
import HRDashboardLayout from "../layouts/hrlayouts";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleGuard from "../components/guards/RoleGuard";

// Marketing pages
import Home from "../pages/home/home";
import HowItWorks from "../pages/how-it-works/how-it-works";
import PricingPage from "../pages/pricing/pricing";
import ForCompanies from "../pages/for-companies/for-companies";
import About from "../pages/about/about";
import FAQPage from "../pages/faq/faq";
import TermsOfService from "../pages/legal/terms";
import PrivacyPolicy from "../pages/legal/privacy";
import MedicalDisclaimer from "../pages/legal/medical-disclaimer";

// Auth pages
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import ForgotPassword from "../pages/auth/forgot-password";
import EmailVerification from "../pages/auth/email-verification";
import Onboarding from "../pages/auth/onboarding";

// Individual dashboard
import DashboardOverview from "../pages/dashboard/overview";
import CreatePlan from "../pages/dashboard/create-plan";
import PlanHistory from "../pages/dashboard/plan-history";
import PlanDetails from "../pages/dashboard/plan-details";
import Settings from "../pages/dashboard/settings";

// HR dashboard
import HROverview from "../pages/hr/overview";
import Employees from "../pages/hr/employees";
import HRCreatePlan from "../pages/hr/create-plan";
import TravelRequests from "../pages/hr/travel-requests";
import Reports from "../pages/hr/reports";
import Billing from "../pages/hr/billing";

import NotFound from "../pages/not-found/not-found";
import ServerError from "../pages/not-found/server-error";
import Unauthorized from "../pages/not-found/unauthorized";

const router = createBrowserRouter([
    // Marketing
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "how-it-works", element: <HowItWorks /> },
            { path: "pricing", element: <PricingPage /> },
            { path: "for-companies", element: <ForCompanies /> },
            { path: "about", element: <About /> },
            { path: "faq", element: <FAQPage /> },
            { path: "terms", element: <TermsOfService /> },
            { path: "privacy", element: <PrivacyPolicy /> },
            { path: "medical-disclaimer", element: <MedicalDisclaimer /> },
        ],
    },

    // Auth
    {
        element: <AuthLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "verify-email", element: <EmailVerification /> },
            { path: "onboarding", element: <Onboarding /> },
        ],
    },

    // Individual dashboard
    {
        path: "dashboard",
        element: (
            <ProtectedRoute>
                <RoleGuard allowedType="individual">
                    <UserDashboardLayout />
                </RoleGuard>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DashboardOverview /> },
            { path: "create-plan", element: <CreatePlan /> },
            { path: "plans", element: <PlanHistory /> },
            { path: "plans/:id", element: <PlanDetails /> },
            { path: "settings", element: <Settings /> },
        ],
    },

    // HR dashboard
    {
        path: "hr",
        element: (
            <ProtectedRoute>
                <RoleGuard allowedType="company">
                    <HRDashboardLayout />
                </RoleGuard>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <HROverview /> },
            { path: "employees", element: <Employees /> },
            { path: "create-plan", element: <HRCreatePlan /> },
            { path: "travel-requests", element: <TravelRequests /> },
            { path: "reports", element: <Reports /> },
            { path: "billing", element: <Billing /> },
        ],
    },

    // Error pages
    { path: "unauthorized", element: <Unauthorized /> },
    { path: "server-error", element: <ServerError /> },

    // 404 catch-all
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default router;
