import { useDashboardSummary } from "../hooks/useDashboard";
import RevenueChart from "../components/RevenueChart";
import ChannelChart from "../components/ChannelChart";

export default function Reports() {
    const { data: summary, isLoading } = useDashboardSummary();

    if (isLoading) return <div className="p-8">Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground">Business intelligence and analytics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <RevenueChart data={summary.revenueByMonth} />
                <ChannelChart data={summary.leadsBySource} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-2">Conversion Rate</h3>
                    <p className="text-3xl font-bold">35%</p>
                    <p className="text-xs text-muted-foreground">Leads to Jobs</p>
                </div>
                <div className="p-6 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-2">Avg. Ticket</h3>
                    <p className="text-3xl font-bold">$12,450</p>
                    <p className="text-xs text-muted-foreground">Per Completed Job</p>
                </div>
                <div className="p-6 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-2">Avg. Sales Cycle</h3>
                    <p className="text-3xl font-bold">14 Days</p>
                    <p className="text-xs text-muted-foreground">Lead to Signed</p>
                </div>
            </div>
        </div>
    )
}
