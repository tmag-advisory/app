import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../layouts/homelayouts";
import AuthLayout from "../layouts/authlayouts";
import UserDashboardLayout from "../layouts/userlayouts";
import HRDashboardLayout from "../layouts/hrlayouts";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleGuard from "../components/guards/RoleGuard";

// Marketing pages (lazy-loaded)
const Home = lazy(() => import("../pages/home/home"));
const HowItWorks = lazy(() => import("../pages/how-it-works/how-it-works"));
const PricingPage = lazy(() => import("../pages/pricing/pricing"));
const ForCompanies = lazy(() => import("../pages/for-companies/for-companies"));
const About = lazy(() => import("../pages/about/about"));
const FAQPage = lazy(() => import("../pages/faq/faq"));
const TermsOfService = lazy(() => import("../pages/legal/terms"));
const PrivacyPolicy = lazy(() => import("../pages/legal/privacy"));
const MedicalDisclaimer = lazy(() => import("../pages/legal/medical-disclaimer"));
const HIPAACompliance = lazy(() => import("../pages/legal/hipaa"));
const Careers = lazy(() => import("../pages/careers/careers"));
const Blog = lazy(() => import("../pages/blog/blog"));
const Press = lazy(() => import("../pages/press/press"));
const HelpCenter = lazy(() => import("../pages/help/help"));
const Documentation = lazy(() => import("../pages/docs/docs"));
const Status = lazy(() => import("../pages/status/status"));
const Community = lazy(() => import("../pages/community/community"));

// Auth pages (lazy-loaded)
const Login = lazy(() => import("../pages/auth/login"));
const Register = lazy(() => import("../pages/auth/register"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("../pages/auth/reset-password"));
const AcceptInvitation = lazy(() => import("../pages/auth/accept-invitation"));
const EmailVerification = lazy(() => import("../pages/auth/email-verification"));
const VerifyEmailCallback = lazy(() => import("../pages/auth/verify-email-callback"));
const GoogleCallback = lazy(() => import("../pages/auth/google-callback"));
const Onboarding = lazy(() => import("../pages/auth/onboarding"));
const TravelHealthQuestionnaire = lazy(() => import("../pages/auth/travel-health-questionnaire"));

// Individual dashboard (lazy-loaded)
const DashboardOverview = lazy(() => import("../pages/dashboard/overview"));
const CreatePlan = lazy(() => import("../pages/dashboard/create-plan"));
const PlanHistory = lazy(() => import("../pages/dashboard/plan-history"));
const PlanDetails = lazy(() => import("../pages/dashboard/plan-details"));
const Settings = lazy(() => import("../pages/dashboard/settings"));

// HR dashboard (lazy-loaded)
const HROverview = lazy(() => import("../pages/hr/overview"));
const Employees = lazy(() => import("../pages/hr/employees"));
const EmployeeDetail = lazy(() => import("../pages/hr/employee-detail"));
const HRCreatePlan = lazy(() => import("../pages/hr/create-plan"));
const TravelRequests = lazy(() => import("../pages/hr/travel-requests"));
const Reports = lazy(() => import("../pages/hr/reports"));
const Billing = lazy(() => import("../pages/hr/billing"));

// Payment pages
const PaymentCallback = lazy(() => import("../pages/payment/callback"));

// Error pages (lazy-loaded)
const NotFound = lazy(() => import("../pages/not-found/not-found"));
const ServerError = lazy(() => import("../pages/not-found/server-error"));
const Unauthorized = lazy(() => import("../pages/not-found/unauthorized"));


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
            { path: "hipaa", element: <HIPAACompliance /> },
            { path: "careers", element: <Careers /> },
            { path: "blog", element: <Blog /> },
            { path: "press", element: <Press /> },
            { path: "help", element: <HelpCenter /> },
            { path: "docs", element: <Documentation /> },
            { path: "status", element: <Status /> },
            { path: "community", element: <Community /> },
        ],
    },

    // Auth
    {
        element: <AuthLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password", element: <ResetPassword /> },
            { path: "accept-invitation", element: <AcceptInvitation /> },
            { path: "verify-email", element: <EmailVerification /> },
        ],
    },

    {
        path: "onboarding", element: <ProtectedRoute><Onboarding /></ProtectedRoute>
    },

    {
        path: "onboarding/questionnaire", element: <ProtectedRoute><TravelHealthQuestionnaire /></ProtectedRoute>
    },

    // Email verification callback (from email link: /auth/verify-email?token=...)
    // Google OAuth callback (from Google redirect: /auth/google/callback?code=...)
    {
        path: "auth",
        element: <AuthLayout />,
        children: [
            { path: "verify-email", element: <VerifyEmailCallback /> },
            { path: "google/callback", element: <GoogleCallback /> },
        ],
    },

    // Payment callback (needs to be accessible after payment)
    {
        path: "payment/callback",
        element: <PaymentCallback />,
    },

    // Individual dashboard
    {
        path: "dashboard",
        element: (
            <ProtectedRoute>
                <RoleGuard section="dashboard">
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
                <RoleGuard section="hr">
                    <HRDashboardLayout />
                </RoleGuard>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <HROverview /> },
            { path: "employees", element: <Employees /> },
            { path: "employees/:id", element: <EmployeeDetail /> },
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
