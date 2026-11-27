import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/sync-leads")({
  server: { handlers: { POST: async ({ request }) => {
    const denied = await authenticateCronRequest(request);
    if (denied) return denied;
    const { retryPendingSheets } = await import("@/lib/lead-sheet.server");
    return Response.json(await retryPendingSheets());
  } } },
});
