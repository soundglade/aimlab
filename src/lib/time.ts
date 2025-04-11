import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Returns a relative time string like "2 hours ago", "yesterday", "3 days ago"
export function timeAgo(date: string | number | Date): string {
  return dayjs(date).fromNow();
}
