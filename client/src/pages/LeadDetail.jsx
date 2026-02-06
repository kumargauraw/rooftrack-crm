import { useParams, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLeadStatus } from '../hooks/useLeads';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Tabs and Separator imports removed as they were unused 
import ActivityFeed from "@/components/ActivityFeed";
import { Phone, Mail, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeadDetail() {
    const { id } = useParams();
    const { data: lead, isLoading } = useLead(id);
    const { mutate: updateStatus } = useUpdateLeadStatus();

    const navigate = useNavigate();

    if (isLoading) return <div className="p-8">Loading detail...</div>;
    if (!lead) return <div className="p-8">Lead not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{lead.name}</h2>
                    <div className="flex gap-2 text-sm text-muted-foreground items-center">
                        <Badge variant="outline">{lead.source_channel}</Badge>
                        <span>Created {new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={lead.status}
                        onChange={(e) => updateStatus({ id: lead.id, status: e.target.value })}
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Service Scheduled</option>
                        <option value="quoted">Quoted</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Service Completed</option>
                        <option value="paid">Payment Received</option>
                        <option value="review_received">Review Received</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Contact & Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${lead.phone}`} className="text-sm hover:underline">{lead.phone}</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="text-sm hover:underline">{lead.email}</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{lead.address}, {lead.city}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Financials</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                                <span className="text-sm">Estimated Value</span>
                                <span className="font-semibold">${lead.estimated_value?.toLocaleString()}</span>
                            </div>

                            {/* Jobs Summary */}
                            {lead.jobs && lead.jobs.length > 0 && (
                                <div className="pt-4 border-t">
                                    <p className="font-semibold text-sm mb-2">Jobs</p>
                                    {lead.jobs.map(job => (
                                        <div key={job.id} className="flex justify-between text-sm py-1">
                                            <span>{job.job_type} ({job.status})</span>
                                            <span>${job.quote_amount?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline & Interactions */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lead.appointments && lead.appointments.length > 0 ? (
                                <div className="space-y-2">
                                    {lead.appointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-purple-500" />
                                                <div>
                                                    <p className="font-medium text-sm">{apt.type}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(apt.scheduled_date).toLocaleDateString()} at {apt.scheduled_time}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">{apt.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ActivityFeed activities={lead.interactions || []} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
