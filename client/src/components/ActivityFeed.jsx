import { Phone, Mail, FileText, CheckCircle, Calendar, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ICONS = {
    call: Phone,
    email: Mail,
    note: FileText,
    system: CheckCircle,
    meeting: Calendar,
    sms: MessageSquare,
    inspection: HammerIcon // will define below
};

function HammerIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
            <path d="M17.64 15 22 10.64" />
            <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V7.86c0-.55-.45-1-1-1H16.5c-.85 0-1.65-.33-2.25-.93L13 4.69" />
            <path d="M14.4 14.4 9.6 9.6" />
        </svg>
    )
}

export default function ActivityFeed({ activities }) {
    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                const Icon = ICONS[activity.type] || FileText;
                return (
                    <div key={activity.id} className="flex gap-3">
                        <div className="mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-slate-900">
                                <span className="font-semibold text-primary">{activity.leadName}</span>
                                <span className="font-normal text-slate-500"> — {activity.summary}</span>
                            </p>
                            <p className="text-xs text-slate-500">
                                {formatDate(activity.createdAt)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
