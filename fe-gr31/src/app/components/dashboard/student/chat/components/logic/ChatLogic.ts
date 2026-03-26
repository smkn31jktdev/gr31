/**
 * Chat Logic Utilities
 * Helper functions for chat components
 */

/**
 * Get status color classes for badge
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "diteruskan":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "ditindaklanjuti":
      return "bg-orange-100 text-orange-800 border border-orange-200";
    case "selesai":
      return "bg-green-100 text-green-800 border border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
}

/**
 * Get status badge text
 */
export function getStatusBadge(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "diteruskan":
      return "Diteruskan";
    case "ditindaklanjuti":
      return "Ditindaklanjuti";
    case "selesai":
      return "Selesai";
    default:
      return status;
  }
}

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Format timestamp to time format
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return timestamp;
  }
}
