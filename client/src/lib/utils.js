import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow as fdn } from "date-fns"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    // If it's a string and doesn't end in Z, append Z to force UTC parsing
    // But only if it looks like an ISO string (contains T or is from SQLite like 'YYYY-MM-DD HH:MM:SS')
    let cleanStr = dateStr;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z')) {
        cleanStr = dateStr.replace(' ', 'T') + 'Z';
    }
    return fdn(new Date(cleanStr), { addSuffix: true });
}
