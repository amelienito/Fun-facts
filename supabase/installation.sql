-- Fun facts : à coller tel quel dans Supabase > SQL Editor, puis « Run ».
-- Crée deux tables : les sauvegardes (par code) et les statistiques de réponses.

create table if not exists public.sauvegardes (
  code text primary key,
  donnees jsonb not null,
  maj timestamptz not null default now()
);

create table if not exists public.stats_reponses (
  question text primary key,
  total integer not null default 0,
  justes integer not null default 0
);

alter table public.sauvegardes enable row level security;
alter table public.stats_reponses enable row level security;

-- Tout le monde peut lire les statistiques (« 62 % des joueurs ont trouvé »).
drop policy if exists "stats lisibles" on public.stats_reponses;
create policy "stats lisibles" on public.stats_reponses for select to anon using (true);

-- Les sauvegardes ne sont accessibles qu'avec leur code, via ces fonctions.
create or replace function public.lire_sauvegarde(p_code text)
returns jsonb language sql security definer set search_path = public as $$
  select donnees from sauvegardes where code = upper(p_code);
$$;

create or replace function public.ecrire_sauvegarde(p_code text, p_donnees jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(p_code) <> 8 or octet_length(p_donnees::text) > 60000 then
    raise exception 'sauvegarde invalide';
  end if;
  insert into sauvegardes (code, donnees, maj) values (upper(p_code), p_donnees, now())
  on conflict (code) do update set donnees = excluded.donnees, maj = now();
end;
$$;

create or replace function public.compter_reponse(p_question text, p_juste boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(p_question) > 40 then raise exception 'question invalide'; end if;
  insert into stats_reponses (question, total, justes) values (p_question, 1, case when p_juste then 1 else 0 end)
  on conflict (question) do update
    set total = stats_reponses.total + 1,
        justes = stats_reponses.justes + (case when p_juste then 1 else 0 end);
end;
$$;

revoke all on function public.lire_sauvegarde(text), public.ecrire_sauvegarde(text, jsonb), public.compter_reponse(text, boolean) from public;
grant execute on function public.lire_sauvegarde(text), public.ecrire_sauvegarde(text, jsonb), public.compter_reponse(text, boolean) to anon;
