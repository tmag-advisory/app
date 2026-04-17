import { Link } from "react-router-dom";
import { useMyEbookOrders } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import {
    LucideBookOpen, LucideDownload, LucideLoader2, LucideShoppingBag,
    LucideCalendar, LucideGlobe, LucideCheckCircle2
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function MyEbooksPage() {
    const { data: orders, isLoading } = useMyEbookOrders();

    return (
        <div>
            <DashboardHeader title="My Ebooks" />

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <LucideLoader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
            ) : !orders || orders.length === 0 ? (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-12 text-center flex flex-col items-center gap-4")}>
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <LucideBookOpen className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <p className="font-semibold text-heading mb-1">No ebooks yet</p>
                        <p className="text-sm text-muted">
                            Visit our shop to purchase travel health guides.
                        </p>
                    </div>
                    <Link
                        to="/shop"
                        className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors"
                    >
                        <LucideShoppingBag className="w-4 h-4" />
                        Browse Shop
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className={cn(DASHBOARD_GLASS_SURFACE, "p-5 flex flex-col gap-4")}
                        >
                            {/* Status badge */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                    <LucideBookOpen className="w-5 h-5 text-accent" />
                                </div>
                                <span className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                                    <LucideCheckCircle2 className="w-3 h-3" />
                                    Purchased
                                </span>
                            </div>

                            {/* Book info */}
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-heading leading-snug mb-1">
                                    {order.ebookTitle}
                                </h3>
                                <div className="flex flex-wrap gap-3 text-xs text-muted">
                                    <span className="flex items-center gap-1">
                                        <LucideGlobe className="w-3 h-3" />
                                        {order.versionLabel}
                                    </span>
                                    {order.paidAt && (
                                        <span className="flex items-center gap-1">
                                            <LucideCalendar className="w-3 h-3" />
                                            {new Date(order.paidAt).toLocaleDateString("en-US", {
                                                year: "numeric", month: "short", day: "numeric"
                                            })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted mt-2">
                                    Paid: <strong className="text-body">{order.currencySymbol}{(order.amountPaid ?? order.amount).toLocaleString()}</strong>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-border-light/50 pt-4 flex flex-col gap-2">
                                <p className="text-xs text-muted">
                                    Download link was sent to{" "}
                                    <span className="text-body font-medium">{order.buyerEmail}</span>
                                </p>
                                <p className="text-[10px] text-muted">
                                    Order ref: <span className="font-mono">{order.txRef}</span>
                                </p>
                                <a
                                    href="mailto:support@travelmedicineadvisory.com?subject=Ebook%20Resend%20Request"
                                    className="mt-1 flex items-center gap-1.5 text-xs text-accent hover:underline"
                                >
                                    <LucideDownload className="w-3 h-3" />
                                    Request resend
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {orders && orders.length > 0 && (
                <div className="mt-8 text-center">
                    <Link to="/shop"
                        className="text-sm text-accent hover:underline flex items-center gap-1.5 justify-center">
                        <LucideShoppingBag className="w-4 h-4" />
                        Browse more ebooks
                    </Link>
                </div>
            )}
        </div>
    );
}
