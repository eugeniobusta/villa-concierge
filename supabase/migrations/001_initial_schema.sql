-- ================================================================
-- Villa Concierge — Migration 001: Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================


-- ──────────────────────────────────────────────────────────────
-- TABLE: guest_sessions
-- One row = one Airbnb booking stay.
-- The access_token is the short code in the guest's private URL.
-- When the token is valid AND today is between check_in/check_out,
-- the guest can browse and order services.
-- ──────────────────────────────────────────────────────────────
create table guest_sessions (
  id            uuid        primary key default gen_random_uuid(),
  access_token  text        unique not null,
  guest_name    text        not null,
  guest_email   text,
  check_in      date        not null,
  check_out     date        not null,
  notes         text,
  created_at    timestamptz default now(),

  -- The database itself enforces checkout must be after checkin.
  -- No bug in your code can ever create an impossible date range.
  constraint chk_dates check (check_out > check_in)
);


-- ──────────────────────────────────────────────────────────────
-- TABLE: service_categories
-- Top-level groupings shown on the guest portal.
-- name/icon are JSONB so adding a 6th language = zero schema changes.
-- ──────────────────────────────────────────────────────────────
create table service_categories (
  id          uuid     primary key default gen_random_uuid(),
  slug        text     unique not null,        -- e.g. "wellness", "food-drink"
  name        jsonb    not null,               -- {"en":"Wellness","es":"Bienestar",...}
  icon        text     not null,               -- lucide icon name, e.g. "sparkles"
  sort_order  smallint default 0,
  is_active   boolean  default true
);


-- ──────────────────────────────────────────────────────────────
-- TABLE: services
-- Individual bookable services within a category.
-- price_unit tells the booking UI how to calculate the total:
--   per_hour    → total = price × hours
--   per_session → total = price × 1 (fixed session price)
--   flat        → total = price (delivery fee style)
--   per_item    → total = price × quantity
-- ──────────────────────────────────────────────────────────────
create table services (
  id                  uuid         primary key default gen_random_uuid(),
  category_id         uuid         not null references service_categories(id) on delete cascade,
  slug                text         unique not null,
  name                jsonb        not null,
  description         jsonb,
  base_price          numeric(10,2) not null check (base_price >= 0),
  price_unit          text         not null
    check (price_unit in ('per_hour', 'per_session', 'flat', 'per_item')),
  min_duration_hours  numeric(4,2),
  max_duration_hours  numeric(4,2),
  requires_scheduling boolean      default true,  -- false for groceries/delivery
  is_active           boolean      default true,
  sort_order          smallint     default 0
);


-- ──────────────────────────────────────────────────────────────
-- TABLE: providers
-- Your trusted service people. commission_rate is what THEY receive.
-- 0.85 means the provider gets 85% of the booking total.
-- You (the host) keep 15%.
-- ──────────────────────────────────────────────────────────────
create table providers (
  id              uuid         primary key default gen_random_uuid(),
  user_id         uuid         references auth.users(id) on delete set null,
  name            text         not null,
  bio             jsonb,       -- {"en":"Carlos is a...", "es":"Carlos es un..."}
  photo_url       text,
  phone           text,
  email           text,
  commission_rate numeric(4,3) not null default 0.850
    check (commission_rate > 0 and commission_rate <= 1),
  is_active       boolean      default true,
  created_at      timestamptz  default now()
);


-- ──────────────────────────────────────────────────────────────
-- TABLE: provider_services  (junction / pivot table)
-- Bridges providers ↔ services (many-to-many relationship).
-- A provider can offer many services; a service can be offered by many providers.
-- custom_price overrides base_price when set (e.g. Carlos charges €90/h for yoga
-- while the default is €80/h).
-- ──────────────────────────────────────────────────────────────
create table provider_services (
  id            uuid         primary key default gen_random_uuid(),
  provider_id   uuid         not null references providers(id) on delete cascade,
  service_id    uuid         not null references services(id) on delete cascade,
  custom_price  numeric(10,2),
  is_available  boolean      default true,

  -- UNIQUE constraint: a provider can only be linked to a service once
  unique (provider_id, service_id)
);


-- ──────────────────────────────────────────────────────────────
-- TABLE: availability_slots
-- Providers set their open time windows here.
-- is_blocked = false → this slot IS available
-- is_blocked = true  → provider explicitly marked it unavailable
-- ──────────────────────────────────────────────────────────────
create table availability_slots (
  id            uuid     primary key default gen_random_uuid(),
  provider_id   uuid     not null references providers(id) on delete cascade,
  date          date     not null,
  start_time    time     not null,
  end_time      time     not null,
  is_blocked    boolean  default false,
  created_at    timestamptz default now(),

  constraint chk_times check (end_time > start_time)
);


-- ──────────────────────────────────────────────────────────────
-- TABLE: bookings
-- The core transaction: a guest session books a provider's service.
--
-- The three amount columns record the split at booking time.
-- Even if you later change commission_rate, the historical split is preserved.
--   total_amount    = what the guest pays
--   provider_amount = total × commission_rate  (what you owe the provider)
--   platform_amount = total − provider_amount  (your revenue)
-- ──────────────────────────────────────────────────────────────
create table bookings (
  id                        uuid         primary key default gen_random_uuid(),
  guest_session_id          uuid         not null references guest_sessions(id),
  provider_service_id       uuid         not null references provider_services(id),
  booking_date              date         not null,
  start_time                time,
  end_time                  time,
  quantity                  int          not null default 1 check (quantity > 0),
  special_requests          text,

  status                    text         not null default 'pending'
    check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),

  total_amount              numeric(10,2) not null check (total_amount >= 0),
  provider_amount           numeric(10,2) not null check (provider_amount >= 0),
  platform_amount           numeric(10,2) not null check (platform_amount >= 0),

  stripe_payment_intent_id  text,
  stripe_payment_status     text         not null default 'pending'
    check (stripe_payment_status in ('pending', 'paid', 'refunded', 'failed')),

  created_at                timestamptz  default now(),
  updated_at                timestamptz  default now()
);


-- ──────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at on bookings
-- A trigger is a function the database runs automatically when
-- a row is inserted or updated. No application code needed.
-- ──────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function set_updated_at();


-- ──────────────────────────────────────────────────────────────
-- INDEXES
-- B-tree indexes for the queries we know we'll run frequently.
-- Rule of thumb: index foreign keys and any column used in WHERE clauses.
-- ──────────────────────────────────────────────────────────────
create index idx_guest_sessions_token     on guest_sessions(access_token);
create index idx_guest_sessions_dates     on guest_sessions(check_in, check_out);
create index idx_availability_prov_date   on availability_slots(provider_id, date);
create index idx_bookings_session         on bookings(guest_session_id);
create index idx_bookings_prov_service    on bookings(provider_service_id);
create index idx_bookings_status          on bookings(status);
create index idx_bookings_date            on bookings(booking_date);


-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Postgres evaluates these policies on EVERY query, even from
-- inside your application. Think of it as a WHERE clause that
-- the database adds automatically and cannot be bypassed.
--
-- Supabase has two built-in roles:
--   anon          → unauthenticated requests (guest portal)
--   authenticated → logged-in Supabase Auth users (providers, admin)
--   service_role  → backend server using the secret key (admin ops)
-- ──────────────────────────────────────────────────────────────
alter table guest_sessions      enable row level security;
alter table service_categories  enable row level security;
alter table services            enable row level security;
alter table providers           enable row level security;
alter table provider_services   enable row level security;
alter table availability_slots  enable row level security;
alter table bookings            enable row level security;

-- Public catalog: anyone can read active categories and services
create policy "public read categories"
  on service_categories for select using (is_active = true);

create policy "public read services"
  on services for select using (is_active = true);

create policy "public read active providers"
  on providers for select using (is_active = true);

create policy "public read provider services"
  on provider_services for select using (is_available = true);

create policy "public read availability"
  on availability_slots for select using (true);

-- Guest sessions and bookings: server-side only via service_role key.
-- The guest portal server validates tokens and reads/writes using
-- the service_role key, which bypasses RLS entirely.
-- This means NO client-side code can ever access these tables directly.
create policy "service role only — guest sessions"
  on guest_sessions for all using (auth.role() = 'service_role');

create policy "service role full access — bookings"
  on bookings for all using (auth.role() = 'service_role');

-- Providers can read their own bookings (logged in via Supabase Auth)
create policy "providers read own bookings"
  on bookings for select
  using (
    auth.uid() in (
      select p.user_id
      from providers p
      join provider_services ps on ps.provider_id = p.id
      where ps.id = bookings.provider_service_id
        and p.user_id is not null
    )
  );


-- ================================================================
-- SEED DATA: Service Categories & Services
-- Run after the schema above.
-- ================================================================

insert into service_categories (slug, name, icon, sort_order) values
  ('household',   '{"en":"Household","es":"Hogar","fr":"Maison","de":"Haushalt","it":"Casa"}',                   'sparkles', 1),
  ('food-drink',  '{"en":"Food & Drink","es":"Comida y Bebida","fr":"Nourriture","de":"Essen","it":"Cibo"}',     'chef-hat', 2),
  ('wellness',    '{"en":"Wellness","es":"Bienestar","fr":"Bien-être","de":"Wohlbefinden","it":"Benessere"}',    'flower-2', 3),
  ('transport',   '{"en":"Transport","es":"Transporte","fr":"Transport","de":"Transport","it":"Trasporto"}',     'car',      4),
  ('experiences', '{"en":"Experiences","es":"Experiencias","fr":"Expériences","de":"Erlebnisse","it":"Esperienze"}', 'map',  5);


insert into services (category_id, slug, name, description, base_price, price_unit, min_duration_hours, max_duration_hours, requires_scheduling, sort_order)
select
  c.id,
  s.slug,
  s.name::jsonb,
  s.description::jsonb,
  s.base_price,
  s.price_unit,
  s.min_duration_hours,
  s.max_duration_hours,
  s.requires_scheduling,
  s.sort_order
from (values
  -- Household
  ('household',   'housekeeping',
    '{"en":"Housekeeping","es":"Limpieza","fr":"Ménage","de":"Hausreinigung","it":"Pulizie"}',
    '{"en":"Full villa cleaning and tidying","es":"Limpieza completa de la villa","fr":"Nettoyage complet de la villa","de":"Vollständige Villareinigung","it":"Pulizia completa della villa"}',
    80.00, 'per_session', 2, 6, true, 1),

  ('household',   'laundry',
    '{"en":"Laundry & Ironing","es":"Lavandería","fr":"Blanchisserie","de":"Wäscheservice","it":"Lavanderia"}',
    '{"en":"Washing, drying and ironing","es":"Lavado, secado y planchado","fr":"Lavage, séchage et repassage","de":"Waschen, Trocknen und Bügeln","it":"Lavaggio, asciugatura e stiratura"}',
    40.00, 'flat', null, null, false, 2),

  -- Food & Drink
  ('food-drink',  'private-chef',
    '{"en":"Private Chef","es":"Chef Privado","fr":"Chef Privé","de":"Privatkoch","it":"Chef Privato"}',
    '{"en":"Gourmet meals prepared in your villa","es":"Comidas gourmet en tu villa","fr":"Repas gastronomiques à la villa","de":"Gourmet-Mahlzeiten in der Villa","it":"Pasti gourmet in villa"}',
    120.00, 'per_session', 2, 8, true, 1),

  ('food-drink',  'grocery-shopping',
    '{"en":"Grocery Shopping","es":"Compra a Domicilio","fr":"Courses","de":"Einkaufsservice","it":"Spesa a Domicilio"}',
    '{"en":"Fresh produce and pantry essentials delivered","es":"Productos frescos entregados","fr":"Produits frais livrés","de":"Frische Produkte geliefert","it":"Prodotti freschi consegnati"}',
    25.00, 'flat', null, null, false, 2),

  ('food-drink',  'wine-delivery',
    '{"en":"Wine & Beverages","es":"Vinos y Bebidas","fr":"Vins & Boissons","de":"Wein & Getränke","it":"Vini & Bevande"}',
    '{"en":"Curated wine and beverage selection delivered","es":"Selección de vinos y bebidas","fr":"Sélection de vins livrée","de":"Weinauswahl geliefert","it":"Selezione vini consegnata"}',
    20.00, 'flat', null, null, false, 3),

  -- Wellness
  ('wellness',    'yoga-fitness',
    '{"en":"Yoga & Fitness","es":"Yoga y Fitness","fr":"Yoga & Fitness","de":"Yoga & Fitness","it":"Yoga & Fitness"}',
    '{"en":"Personal trainer and yoga sessions","es":"Entrenador personal y yoga","fr":"Coach personnel et yoga","de":"Personal Trainer und Yoga","it":"Personal trainer e yoga"}',
    70.00, 'per_hour', 1, 3, true, 1),

  ('wellness',    'massage-beauty',
    '{"en":"Massage & Beauty","es":"Masajes y Belleza","fr":"Massage & Beauté","de":"Massage & Beauty","it":"Massaggi & Beauty"}',
    '{"en":"Spa and beauty services at your door","es":"Servicios de spa y belleza","fr":"Spa et beauté à domicile","de":"Spa und Beauty vor Ort","it":"Spa e beauty a domicilio"}',
    90.00, 'per_hour', 1, 4, true, 2),

  -- Transport
  ('transport',   'private-transfer',
    '{"en":"Private Transfer","es":"Traslado Privado","fr":"Transfert Privé","de":"Privattransfer","it":"Trasferimento Privato"}',
    '{"en":"Airport pickups and city transfers","es":"Traslados al aeropuerto y ciudad","fr":"Transferts aéroport et ville","de":"Flughafen und Stadtfahrten","it":"Trasferimenti aeroporto e città"}',
    60.00, 'flat', null, null, true, 1),

  -- Experiences
  ('experiences', 'malaga-tours',
    '{"en":"Malaga Tours","es":"Excursiones Málaga","fr":"Visites Malaga","de":"Malaga Touren","it":"Tour Malaga"}',
    '{"en":"Private guided tours of Malaga and surroundings","es":"Tours privados por Málaga","fr":"Visites guidées privées de Malaga","de":"Private Stadtführungen in Malaga","it":"Tour privati di Malaga"}',
    100.00, 'per_session', 2, 6, true, 1),

  ('experiences', 'childcare',
    '{"en":"Childcare","es":"Cuidado de Niños","fr":"Garde d''Enfants","de":"Kinderbetreuung","it":"Babysitter"}',
    '{"en":"Trusted and vetted babysitters","es":"Canguros de confianza","fr":"Baby-sitters de confiance","de":"Vertrauenswürdige Babysitter","it":"Babysitter di fiducia"}',
    25.00, 'per_hour', 2, 12, true, 2)

) as s(category_slug, slug, name, description, base_price, price_unit, min_duration_hours, max_duration_hours, requires_scheduling, sort_order)
join service_categories c on c.slug = s.category_slug;
