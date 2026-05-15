import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import familyTripApi from "../../api/familyTrip";
import AnimateIn from "../../components/animations/AnimateIn";
import FooterSection from "../../components/sections/FooterSection";
import Navbar from "../../components/sections/Navbar";

export default function FamilyLogin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await familyTripApi.memberLogin(email, code);
      localStorage.setItem("familyMemberToken", res.data.data.sessionToken);
      navigate("/family/dashboard");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 pt-12 pb-20">
        <AnimateIn type="fade" className="bg-white border border-border-light rounded-3xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
            Family Portal
          </h1>
          <p className="text-sm text-body mb-8">
            Access your group travel health plan securely.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Main Applicant Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="applicant@example.com"
                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Access Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="A1B2C3"
                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 uppercase tracking-widest font-bold text-center"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || !email}
              className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? "Verifying..." : "Access Travel Plan"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <Link to="/" className="text-xs text-muted hover:text-heading transition-colors duration-200">
              Back to home
            </Link>
          </div>
        </AnimateIn>
      </main>

      <FooterSection />
    </div>
  );
}
