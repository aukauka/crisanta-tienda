-- ─────────────────────────────────────────────────────────────
--  Base de datos de stock de Crisanta (Supabase)
--  Se pega completo en Supabase > SQL Editor > Run. Una sola vez.
-- ─────────────────────────────────────────────────────────────

-- Stock: una fila por producto + talle (sku). Nunca puede quedar en negativo.
create table if not exists stock (
  sku          text primary key,
  cantidad     integer not null default 0 check (cantidad >= 0),
  actualizado  timestamptz not null default now()
);

-- Historial: cada cambio de stock queda anotado, venga de donde venga.
create table if not exists movimientos (
  id              bigserial primary key,
  sku             text not null references stock(sku),
  cambio          integer not null,
  cantidad_final  integer not null,
  origen          text not null check (origen in ('web','mayorista','ajuste','whatsapp')),
  motivo          text not null default '',
  orden_id        text,
  creado          timestamptz not null default now()
);

-- Órdenes de la tienda web.
create table if not exists ordenes (
  id           text primary key,
  estado       text not null check (estado in ('pendiente','pagada','cancelada','vencida')),
  cliente      jsonb not null,
  items        jsonb not null,
  total        integer not null,
  pago_id      text,
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now()
);

-- Nadie de afuera puede leer ni escribir las tablas directo:
-- solo el servidor de la tienda, con la clave secreta.
alter table stock       enable row level security;
alter table movimientos enable row level security;
alter table ordenes     enable row level security;

-- Suma o resta stock de forma segura. Si no alcanza, falla con SIN_STOCK.
create or replace function ajustar_stock(
  p_sku text, p_cambio integer, p_origen text, p_motivo text, p_orden text default null
) returns integer language plpgsql as $$
declare v_cantidad integer;
begin
  if p_cambio > 0 then
    insert into stock (sku, cantidad) values (p_sku, 0) on conflict (sku) do nothing;
  end if;

  update stock
     set cantidad = cantidad + p_cambio, actualizado = now()
   where sku = p_sku and cantidad + p_cambio >= 0
  returning cantidad into v_cantidad;

  if not found then
    raise exception 'SIN_STOCK:%', p_sku;
  end if;

  insert into movimientos (sku, cambio, cantidad_final, origen, motivo, orden_id)
  values (p_sku, p_cambio, v_cantidad, p_origen, coalesce(p_motivo, ''), p_orden);

  return v_cantidad;
end $$;

-- Reserva todo el carrito de una compra web. Si falta un solo producto,
-- no se descuenta nada (todo o nada).
create or replace function reservar_orden(
  p_id text, p_cliente jsonb, p_items jsonb, p_total integer
) returns void language plpgsql as $$
declare it jsonb;
begin
  for it in select * from jsonb_array_elements(p_items) loop
    perform ajustar_stock(it->>'sku', -(it->>'cantidad')::integer, 'web', 'Compra web (reservado)', p_id);
  end loop;
  insert into ordenes (id, estado, cliente, items, total)
  values (p_id, 'pendiente', p_cliente, p_items, p_total);
end $$;

-- Cierra una orden pendiente. Si no se pagó, devuelve el stock.
create or replace function cerrar_orden(
  p_id text, p_estado text, p_pago text default null
) returns text language plpgsql as $$
declare o ordenes; it jsonb;
begin
  select * into o from ordenes where id = p_id for update;
  if not found then return null; end if;
  if o.estado <> 'pendiente' then return o.estado; end if;

  if p_estado <> 'pagada' then
    for it in select * from jsonb_array_elements(o.items) loop
      perform ajustar_stock(it->>'sku', (it->>'cantidad')::integer, 'web',
                            'Se devolvió: el pago no se completó', p_id);
    end loop;
  end if;

  update ordenes set estado = p_estado, pago_id = coalesce(p_pago, pago_id), actualizado = now()
   where id = p_id;
  return p_estado;
end $$;

-- Libera las reservas de compras que no se pagaron a tiempo.
create or replace function liberar_vencidas(p_minutos integer) returns void language plpgsql as $$
declare v_id text;
begin
  for v_id in
    select id from ordenes
     where estado = 'pendiente' and creado < now() - make_interval(mins => p_minutos)
  loop
    perform cerrar_orden(v_id, 'vencida', null);
  end loop;
end $$;

-- Las funciones solo las puede usar el servidor de la tienda.
revoke execute on function ajustar_stock(text, integer, text, text, text) from public, anon, authenticated;
revoke execute on function reservar_orden(text, jsonb, jsonb, integer)    from public, anon, authenticated;
revoke execute on function cerrar_orden(text, text, text)                 from public, anon, authenticated;
revoke execute on function liberar_vencidas(integer)                      from public, anon, authenticated;

-- Stock inicial de los productos de ejemplo (después se cambia desde /admin).
insert into stock (sku, cantidad) values
  ('remera-cruz-oversize__s', 4),
  ('remera-cruz-oversize__m', 8),
  ('remera-cruz-oversize__l', 6),
  ('remera-cruz-oversize__xl', 2),
  ('remera-basica-logo__s', 10),
  ('remera-basica-logo__m', 12),
  ('remera-basica-logo__l', 9),
  ('remera-basica-logo__xl', 5),
  ('buzo-hoodie-cruz__s', 3),
  ('buzo-hoodie-cruz__m', 5),
  ('buzo-hoodie-cruz__l', 5),
  ('buzo-hoodie-cruz__xl', 1),
  ('buzo-crewneck__s', 2),
  ('buzo-crewneck__m', 6),
  ('buzo-crewneck__l', 4),
  ('buzo-crewneck__xl', 0),
  ('pantalon-cargo__38', 3),
  ('pantalon-cargo__40', 6),
  ('pantalon-cargo__42', 5),
  ('pantalon-cargo__44', 2),
  ('jogger-frisa__s', 5),
  ('jogger-frisa__m', 7),
  ('jogger-frisa__l', 6),
  ('jogger-frisa__xl', 3),
  ('campera-puffer__s', 1),
  ('campera-puffer__m', 3),
  ('campera-puffer__l', 2),
  ('campera-puffer__xl', 1),
  ('gorra-bordada__único', 15)
on conflict (sku) do nothing;
