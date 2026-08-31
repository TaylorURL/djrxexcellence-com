-- Leads were reachable by three statements and removable by none. The grant in
-- 0005 already gives `authenticated` delete on the table, so the missing piece
-- was the policy that decides which rows the statement may touch, and without
-- one every delete matched nothing and reported success. Two rows from
-- scripts/verify-policies.js sat in the table for that reason: the script files
-- a lead to prove an anonymous visitor can, then deletes it, and the delete had
-- been silently removing nothing on every run since the table was created.
--
-- The row an agent may remove is any of them, which is the same reach the
-- select and update policies already grant. What stops a visitor removing the
-- record of their own enquiry is that `is_agent()` is false for them, and what
-- stops an agent removing rows wholesale from the dashboard is that nothing in
-- src/services/leads.js issues a delete -- the table is triaged through
-- `is_handled` and `agent_notes`, and a real enquiry is meant to keep.

create policy "leads removed by agent"
  on public.leads for delete
  using (public.is_agent());
