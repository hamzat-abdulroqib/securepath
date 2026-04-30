-- Prevent duplicate votes from the same user on the same report/ping
CREATE UNIQUE INDEX IF NOT EXISTS confirmations_unique_user_report
  ON public.confirmations (user_id, report_id) WHERE report_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS confirmations_unique_user_ping
  ON public.confirmations (user_id, ping_id) WHERE ping_id IS NOT NULL;