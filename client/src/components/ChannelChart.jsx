import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ChannelChart({ data }) {
    // Transform object { "stormwatch": 10, ... } to array [{ name: "stormwatch", value: 10 }]
    const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where are leads coming from?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
