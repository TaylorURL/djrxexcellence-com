-- Table privileges for the two browser roles.
--
-- Row-level security decides which rows a statement may touch; it never decides
-- whether the statement may run. A role holding TRUNCATE or REFERENCES is
-- outside row security entirely, and a role holding DELETE on a table it has no
-- delete policy for is one policy edit away from removing every row. So the
-- grant is narrowed to the statements each role actually issues, and the
-- policies become the second check rather than the only one.

revoke all on all tables in schema public from anon, authenticated;

-- The unauthenticated visitor reads the listings, the photos on them, the
-- published testimonials and the comment thread, and files a lead from the
-- contact form. `submitLead` in src/services/leads.js inserts without reading
-- back, so anon needs no select on leads.
grant select on public.listings to anon;
grant select on public.listing_images to anon;
grant select on public.testimonials to anon;
grant select on public.comments to anon;
grant insert on public.leads to anon;

-- A signed-in account reaches every table, and which rows it reaches is the
-- policies' answer. TRUNCATE, REFERENCES and TRIGGER are withheld because no
-- policy is consulted for any of the three.
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.listing_images to authenticated;
grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_searches to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;

-- A table added later inherits the same shape rather than the ownership
-- default, which is every privilege to both roles.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- rls_auto_enable fires from an event trigger and runs as its owner, so the
-- execute grant only exposes it. The same revoke covers the trigger functions
-- in 0004; this one was created outside those migrations and kept the grant.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
