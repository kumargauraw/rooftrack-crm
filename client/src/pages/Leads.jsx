import { useState } from 'react';
import { useLeads, useCreateLead, useUpdateLeadStatus } from "../hooks/useLeads";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Leads() {
    const { data: leads, isLoading } = useLeads();
    const { mutate: createLead } = useCreateLead();
    const { mutate: updateStatus } = useUpdateLeadStatus();

    // Local state for UI
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Simple form state
    const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', source_channel: 'manual', notes: '' });

    if (isLoading) return <div className="p-8">Loading leads...</div>;

    const filteredLeads = leads?.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createLead(newLead, {
            onSuccess: () => {
                setIsModalOpen(false);
                setNewLead({ name: '', phone: '', email: '', source_channel: 'manual', notes: '' });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                    <p className="text-muted-foreground">Manage your potential customers.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Lead
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or phone..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
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

            {/* Table Card */}
            <Card>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Source</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Priority</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredLeads?.map((lead) => (
                                <tr key={lead.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">
                                        <div className="flex flex-col">
                                            <span>{lead.name}</span>
                                            <span className="text-xs text-muted-foreground">{lead.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge variant="outline">{lead.source_channel}</Badge>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge className={
                                            lead.status === 'new' ? 'bg-blue-500' :
                                                lead.status === 'paid' ? 'bg-green-500' :
                                                    lead.status === 'lost' ? 'bg-red-500' : 'bg-slate-500'
                                        }>
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={
                                            lead.priority === 'hot' ? 'text-red-500 font-bold' :
                                                lead.priority === 'warm' ? 'text-orange-500' : 'text-blue-500'
                                        }>
                                            {lead.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {formatDistanceToNow(new Date(lead.created_at))} ago
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/leads/${lead.id}`}>
                                                View <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Simple Modal overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white">
                        <CardHeader>
                            <CardTitle>Add New Lead</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <Input
                                    placeholder="Name"
                                    value={newLead.name}
                                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Phone"
                                    value={newLead.phone}
                                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                />
                                <Input
                                    placeholder="Email"
                                    value={newLead.email}
                                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                />
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newLead.source_channel}
                                    onChange={e => setNewLead({ ...newLead, source_channel: e.target.value })}
                                >
                                    <option value="manual">Manual Entry</option>
                                    <option value="referral">Referral</option>
                                    <option value="homeadvisor">HomeAdvisor</option>
                                </select>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit">Create Lead</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
