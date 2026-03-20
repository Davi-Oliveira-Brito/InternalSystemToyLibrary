-- LIMPAR TABELAS ANTIGAS

drop table if exists loans cascade;
drop table if exists games cascade;
drop table if exists users cascade;
drop table if exists admins cascade;
drop table if exists unidades cascade;


-- TABELAS

create table unidades (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  created_at timestamp default now()
);

create table admins (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  password text not null,
  avatar_url text,
  created_at timestamp default now()
);

create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  password text not null,
  unidade_slug text not null references unidades(slug),
  avatar_url text,
  created_at timestamp default now()
);

create table games (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text,
  category text,
  total_copies integer not null default 1,
  unidade_slug text not null references unidades(slug),
  created_at timestamp default now()
);

create table loans (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references games(id) on delete cascade,
  game_name text not null,
  student_name text not null,
  student_ra text not null,
  student_class text not null,
  unidade_slug text not null references unidades(slug),
  loaned_at timestamp default now(),
  returned boolean default false,
  returned_at timestamp
);


-- STORAGE BUCKETS

insert into storage.buckets (id, name, public)
values ('games', 'games', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;


-- DADOS INICIAIS

insert into unidades (slug, name) values
  ('morumbi',      'Unidade Morumbi'),
  ('valinhos',     'Unidade Valinhos'),
  ('panamby',      'Unidade Panamby'),
  ('vila-andrade', 'Unidade Vila Andrade');

insert into admins (name, email, password)
values ('Admin', 'admin@portoseguro.org.br', 'hash_bcrypt_aqui');