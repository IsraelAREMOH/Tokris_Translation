-- 0009_blog_search_ranking.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Phase 5 search
-- upgrade).
--
-- 1) Replaces the flat search_vector from 0005 with a WEIGHTED one so title
--    matches rank above excerpt matches, which rank above body matches
--    ('A' > 'B' > 'C' in Postgres full-text search). Generated columns can't
--    be ALTERed in place, so this drops and re-adds it (also drops/recreates
--    the GIN index, which lived on the old column).
-- 2) Adds search_blog_posts(): a single ranked RPC combining direct
--    full-text matches with category/author/tag NAME matches (at a lower,
--    flat rank), paginated with a total count — avoids composing this from
--    several round trips in application code.
-- 3) Adds search_blog_posts_fuzzy(): a typo-tolerant fallback (pg_trgm
--    title similarity), used only when (2) returns zero rows.

create extension if not exists pg_trgm;

alter table public.blog_posts drop column if exists search_vector;

alter table public.blog_posts add column search_vector tsvector generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content_text, '')), 'C')
) stored;

create index if not exists blog_posts_search_idx on public.blog_posts using gin (search_vector);
create index if not exists blog_posts_title_trgm_idx on public.blog_posts using gin (title gin_trgm_ops);

create or replace function public.search_blog_posts(
  p_query text,
  p_limit int default 9,
  p_offset int default 0
)
returns table (id uuid, rank real, total_count bigint)
language sql
stable
as $$
  with matches as (
    select bp.id, ts_rank(bp.search_vector, websearch_to_tsquery('english', p_query)) as match_rank
    from public.blog_posts bp
    where bp.status = 'published'
      and bp.search_vector @@ websearch_to_tsquery('english', p_query)

    union all

    select bp.id, 0.1::real as match_rank
    from public.blog_posts bp
    join public.blog_categories c on c.id = bp.category_id
    where bp.status = 'published' and c.name ilike '%' || p_query || '%'

    union all

    select bp.id, 0.1::real as match_rank
    from public.blog_posts bp
    join public.blog_authors a on a.id = bp.author_id
    where bp.status = 'published' and a.name ilike '%' || p_query || '%'

    union all

    select bp.id, 0.1::real as match_rank
    from public.blog_posts bp
    join public.blog_post_tags pt on pt.post_id = bp.id
    join public.blog_tags t on t.id = pt.tag_id
    where bp.status = 'published' and t.name ilike '%' || p_query || '%'
  ),
  deduped as (
    select id, max(match_rank) as rank from matches group by id
  )
  select d.id, d.rank, count(*) over() as total_count
  from deduped d
  order by d.rank desc
  limit p_limit offset p_offset;
$$;

grant execute on function public.search_blog_posts(text, int, int) to anon, authenticated;

create or replace function public.search_blog_posts_fuzzy(p_query text, p_limit int default 5)
returns table (id uuid, similarity_score real)
language sql
stable
as $$
  select bp.id, similarity(bp.title, p_query) as similarity_score
  from public.blog_posts bp
  where bp.status = 'published'
    and bp.title % p_query
  order by similarity_score desc
  limit p_limit;
$$;

grant execute on function public.search_blog_posts_fuzzy(text, int) to anon, authenticated;
