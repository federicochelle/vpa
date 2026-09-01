begin;

-- Seed de datos de prueba para poblar la web publica de VPA.
-- No toca registros reales existentes:
-- - usa UUIDs fijos para todos los registros demo
-- - usa slugs con prefijo `demo-vpa-`
-- - solo inserta si no existe el UUID y tampoco el slug
-- - las imagenes se vinculan unicamente a los UUIDs demo definidos aqui

with property_seed (
  id,
  title,
  slug,
  operation_type,
  property_type,
  featured,
  price,
  currency,
  bedrooms,
  bathrooms,
  garages,
  built_area,
  total_area,
  land_area,
  description,
  address,
  neighborhood,
  city,
  department,
  latitude,
  longitude,
  expenses,
  construction_year,
  investment_opportunity
) as (
  values
    (
      '11111111-1111-4111-8111-111111111001'::uuid,
      'Apartamento reciclado con terraza en Pocitos',
      'demo-vpa-venta-apartamento-pocitos-terraza',
      'sale',
      'apartment',
      true,
      248000.00,
      'USD',
      2,
      2,
      1,
      78.00,
      92.00,
      null,
      'Apartamento luminoso con living comedor orientado al norte, terraza disfrutable y cocina definida. Una opcion comoda para vivir cerca de la rambla y con servicios a pocas cuadras.',
      'Benito Blanco 1180',
      'Pocitos',
      'Montevideo',
      'Montevideo',
      -34.9132000,
      -56.1514000,
      9200.00,
      2008,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111002'::uuid,
      'Casa familiar con jardin y barbacoa en Carrasco Norte',
      'demo-vpa-venta-casa-carrasco-norte-jardin',
      'sale',
      'house',
      true,
      465000.00,
      'USD',
      4,
      3,
      2,
      210.00,
      540.00,
      330.00,
      'Casa desarrollada en una planta con jardin arbolado, estar diario con estufa a lena y barbacoa cerrada. Ideal para familias que buscan amplitud y buena conectividad hacia colegios y servicios.',
      'Av. Italia 7620',
      'Carrasco Norte',
      'Montevideo',
      'Montevideo',
      -34.8796000,
      -56.0639000,
      null,
      2012,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111003'::uuid,
      'Penthouse de 3 dormitorios con vista abierta en Punta Carretas',
      'demo-vpa-venta-penthouse-punta-carretas',
      'sale',
      'apartment',
      true,
      589000.00,
      'USD',
      3,
      3,
      2,
      162.00,
      198.00,
      null,
      'Penthouse con excelente planta, balcon perimetral y ambientes amplios. Se destaca por su vista despejada, suite principal y dos garages comodos en edificio consolidado.',
      'Jose Ellauri 540',
      'Punta Carretas',
      'Montevideo',
      'Montevideo',
      -34.9266000,
      -56.1587000,
      18500.00,
      2016,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111004'::uuid,
      'Duplex con patio y garage en Parque Rodo',
      'demo-vpa-venta-duplex-parque-rodo-patio',
      'sale',
      'house',
      false,
      319000.00,
      'USD',
      3,
      2,
      1,
      124.00,
      148.00,
      24.00,
      'Duplex actualizado, con patio al fondo y garage independiente. Una propiedad funcional, con buena distribucion y cercania a facultades, parque y servicios gastronomicos.',
      'Maldonado 2018',
      'Parque Rodo',
      'Montevideo',
      'Montevideo',
      -34.9148000,
      -56.1736000,
      null,
      1998,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111005'::uuid,
      'Terreno esquinero para desarrollo en Atlantida Sur',
      'demo-vpa-venta-terreno-atlantida-sur',
      'sale',
      'land',
      false,
      128000.00,
      'USD',
      null,
      null,
      null,
      null,
      720.00,
      720.00,
      'Terreno esquinero en zona de crecimiento con buen frente y entorno residencial consolidado. Apto para vivienda permanente o proyecto de baja escala cerca de la costa.',
      'Calle 18 y Calle 1',
      'Atlantida Sur',
      'Atlantida',
      'Canelones',
      -34.7719000,
      -55.7583000,
      null,
      null,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111006'::uuid,
      'Apartamento amoblado de 1 dormitorio en Centro',
      'demo-vpa-alquiler-apartamento-centro-amoblado',
      'rent',
      'apartment',
      true,
      38500.00,
      'UYU',
      1,
      1,
      0,
      46.00,
      52.00,
      null,
      'Unidad amoblada lista para entrar, con buena luz natural, cocina integrada y bajos gastos comunes. Una opcion practica para quien busca estar cerca de oficinas y locomocion.',
      'Canelones 1288',
      'Centro',
      'Montevideo',
      'Montevideo',
      -34.9053000,
      -56.1910000,
      4100.00,
      2019,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111007'::uuid,
      'Casa de 2 dormitorios con fondo en Buceo',
      'demo-vpa-alquiler-casa-buceo-fondo',
      'rent',
      'house',
      false,
      62000.00,
      'UYU',
      2,
      2,
      1,
      88.00,
      180.00,
      92.00,
      'Casa comoda con fondo verde, parrillero techado y cochera. Muy buena alternativa para quienes priorizan espacios exteriores y cercania a la zona comercial de Rivera.',
      'Solferino 4621',
      'Buceo',
      'Montevideo',
      'Montevideo',
      -34.9009000,
      -56.1285000,
      null,
      2004,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111008'::uuid,
      'Monoambiente amplio con amenities en Cordon Soho',
      'demo-vpa-alquiler-monoambiente-cordon-soho',
      'rent',
      'apartment',
      true,
      31200.00,
      'UYU',
      0,
      1,
      0,
      34.00,
      38.00,
      null,
      'Monoambiente moderno con balcon frances, edificio con laundry y cowork. Pensado para quien quiere vivir en una zona activa, con propuestas culturales y gastronomicas cerca.',
      'Chana 2120',
      'Cordon',
      'Montevideo',
      'Montevideo',
      -34.9046000,
      -56.1761000,
      3600.00,
      2022,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111009'::uuid,
      'Oficina flexible con cochera en World Trade Center',
      'demo-vpa-alquiler-oficina-wtc',
      'rent',
      'office',
      false,
      54000.00,
      'UYU',
      null,
      1,
      1,
      57.00,
      57.00,
      null,
      'Oficina en edificio corporativo con recepcion, vigilancia y cochera fija. Ideal para equipos chicos, consultorios profesionales o base comercial con muy buena imagen.',
      'Luis Alberto de Herrera 1248',
      'Buceo',
      'Montevideo',
      'Montevideo',
      -34.9037000,
      -56.1377000,
      11800.00,
      2015,
      false
    ),
    (
      '11111111-1111-4111-8111-111111111010'::uuid,
      'Local comercial a la calle en Ciudad Vieja',
      'demo-vpa-alquiler-local-ciudad-vieja',
      'rent',
      'commercial-space',
      false,
      47000.00,
      'UYU',
      null,
      1,
      0,
      72.00,
      72.00,
      null,
      'Local en planta baja con buena vidriera, salon principal despejado y deposito. Conveniente para retail, showroom o propuesta gastronomica de formato compacto.',
      'Sarandi 498',
      'Ciudad Vieja',
      'Montevideo',
      'Montevideo',
      -34.9077000,
      -56.2049000,
      null,
      1948,
      false
    )
),
inserted_properties as (
  insert into public.properties (
    id,
    title,
    slug,
    operation_type,
    property_type,
    status,
    published,
    featured,
    price,
    currency,
    bedrooms,
    bathrooms,
    garages,
    built_area,
    total_area,
    land_area,
    description,
    address,
    neighborhood,
    city,
    department,
    latitude,
    longitude,
    expenses,
    construction_year,
    investment_opportunity
  )
  select
    ps.id,
    ps.title,
    ps.slug,
    ps.operation_type,
    ps.property_type,
    'published',
    true,
    ps.featured,
    ps.price,
    ps.currency,
    ps.bedrooms,
    ps.bathrooms,
    ps.garages,
    ps.built_area,
    ps.total_area,
    ps.land_area,
    ps.description,
    ps.address,
    ps.neighborhood,
    ps.city,
    ps.department,
    ps.latitude,
    ps.longitude,
    ps.expenses,
    ps.construction_year,
    ps.investment_opportunity
  from property_seed ps
  where not exists (
    select 1
    from public.properties p
    where p.id = ps.id
       or p.slug = ps.slug
  )
  returning id
)
select count(*) from inserted_properties;

with property_seed (id) as (
  values
    ('11111111-1111-4111-8111-111111111001'::uuid),
    ('11111111-1111-4111-8111-111111111002'::uuid),
    ('11111111-1111-4111-8111-111111111003'::uuid),
    ('11111111-1111-4111-8111-111111111004'::uuid),
    ('11111111-1111-4111-8111-111111111005'::uuid),
    ('11111111-1111-4111-8111-111111111006'::uuid),
    ('11111111-1111-4111-8111-111111111007'::uuid),
    ('11111111-1111-4111-8111-111111111008'::uuid),
    ('11111111-1111-4111-8111-111111111009'::uuid),
    ('11111111-1111-4111-8111-111111111010'::uuid)
)
insert into public.property_images (
  property_id,
  url,
  public_id,
  alt_text,
  sort_order,
  is_cover
)
select
  ps.id,
  '/propiedad.jpg',
  null,
  'Portada de prueba reutilizada desde el hero de VPA',
  0,
  true
from property_seed ps
where exists (
  select 1
  from public.properties p
  where p.id = ps.id
)
and not exists (
  select 1
  from public.property_images pi
  where pi.property_id = ps.id
    and pi.sort_order = 0
    and pi.url = '/propiedad.jpg'
);

with property_seed (id) as (
  values
    ('11111111-1111-4111-8111-111111111001'::uuid),
    ('11111111-1111-4111-8111-111111111002'::uuid),
    ('11111111-1111-4111-8111-111111111003'::uuid),
    ('11111111-1111-4111-8111-111111111004'::uuid),
    ('11111111-1111-4111-8111-111111111005'::uuid),
    ('11111111-1111-4111-8111-111111111006'::uuid),
    ('11111111-1111-4111-8111-111111111007'::uuid),
    ('11111111-1111-4111-8111-111111111008'::uuid),
    ('11111111-1111-4111-8111-111111111009'::uuid),
    ('11111111-1111-4111-8111-111111111010'::uuid)
)
insert into public.property_images (
  property_id,
  url,
  public_id,
  alt_text,
  sort_order,
  is_cover
)
select
  ps.id,
  '/proyecto.jpg',
  null,
  'Imagen secundaria de prueba reutilizada desde el hero de VPA',
  1,
  false
from property_seed ps
where exists (
  select 1
  from public.properties p
  where p.id = ps.id
)
and not exists (
  select 1
  from public.property_images pi
  where pi.property_id = ps.id
    and pi.sort_order = 1
    and pi.url = '/proyecto.jpg'
);

with project_seed (
  id,
  name,
  slug,
  description,
  developer_name,
  construction_status,
  estimated_delivery_date,
  address,
  neighborhood,
  city,
  department,
  latitude,
  longitude,
  featured,
  is_investment_opportunity
) as (
  values
    (
      '22222222-2222-4222-8222-222222222001'::uuid,
      'Parque Mirador Carrasco',
      'demo-vpa-proyecto-parque-mirador-carrasco',
      'Proyecto residencial de escala media con foco en unidades de 1 y 2 dormitorios, amenities de uso comun y conectividad hacia Carrasco, Zonamerica y aeropuerto.',
      'Desarrollos del Este',
      'construction',
      '2027-06-30'::date,
      'Av. de las Americas 8200',
      'Carrasco Norte',
      'Montevideo',
      'Montevideo',
      -34.8653000,
      -56.0427000,
      true,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222002'::uuid,
      'Rambla Sur Residences',
      'demo-vpa-proyecto-rambla-sur-residences',
      'Emprendimiento con vistas abiertas al sur, unidades premium y propuesta de amenities orientada a compradores finales e inversores de renta temporal.',
      'Grupo Costanera',
      'presale',
      '2028-03-31'::date,
      'Rambla Republica Argentina 1540',
      'Parque Rodo',
      'Montevideo',
      'Montevideo',
      -34.9175000,
      -56.1767000,
      true,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222003'::uuid,
      'Punta del Este Central Hub',
      'demo-vpa-proyecto-punta-del-este-central-hub',
      'Desarrollo mixto con residencias de temporada y locales de apoyo en una zona de alta circulacion, pensado para renta flexible y uso vacacional.',
      'Atlantico Real Estate',
      'construction',
      '2027-12-15'::date,
      'Av. Roosevelt Parada 8',
      'Roosevelt',
      'Punta del Este',
      'Maldonado',
      -34.9443000,
      -54.9343000,
      false,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222004'::uuid,
      'Bosques de La Tahona Suites',
      'demo-vpa-proyecto-bosques-de-la-tahona-suites',
      'Conjunto de apartamentos y townhouses dentro de entorno verde, con amenities familiares y perfil de compra patrimonial de mediano plazo.',
      'Norte Habitat',
      'presale',
      '2028-09-30'::date,
      'Camino de los Horneros km 3',
      'La Tahona',
      'Canelones',
      'Canelones',
      -34.7916000,
      -56.0324000,
      false,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222005'::uuid,
      'Puerto Buceo Offices & Lofts',
      'demo-vpa-proyecto-puerto-buceo-offices-lofts',
      'Proyecto finalizado con unidades listas para ocupacion, combinando espacios profesionales y lofts urbanos cerca del eje corporativo de Montevideo.',
      'Rio Plata Developers',
      'immediate_occupancy',
      '2025-11-30'::date,
      '26 de Marzo 3454',
      'Puerto del Buceo',
      'Montevideo',
      'Montevideo',
      -34.9042000,
      -56.1362000,
      false,
      false
    )
),
inserted_projects as (
  insert into public.projects (
    id,
    name,
    slug,
    description,
    developer_name,
    construction_status,
    estimated_delivery_date,
    address,
    neighborhood,
    city,
    department,
    latitude,
    longitude,
    published,
    featured,
    is_investment_opportunity
  )
  select
    ps.id,
    ps.name,
    ps.slug,
    ps.description,
    ps.developer_name,
    ps.construction_status,
    ps.estimated_delivery_date,
    ps.address,
    ps.neighborhood,
    ps.city,
    ps.department,
    ps.latitude,
    ps.longitude,
    true,
    ps.featured,
    ps.is_investment_opportunity
  from project_seed ps
  where not exists (
    select 1
    from public.projects p
    where p.id = ps.id
       or p.slug = ps.slug
  )
  returning id
)
select count(*) from inserted_projects;

with project_seed (id) as (
  values
    ('22222222-2222-4222-8222-222222222001'::uuid),
    ('22222222-2222-4222-8222-222222222002'::uuid),
    ('22222222-2222-4222-8222-222222222003'::uuid),
    ('22222222-2222-4222-8222-222222222004'::uuid),
    ('22222222-2222-4222-8222-222222222005'::uuid)
)
insert into public.project_images (
  project_id,
  url,
  public_id,
  alt_text,
  sort_order,
  is_cover
)
select
  ps.id,
  '/propiedad.jpg',
  null,
  'Portada de prueba reutilizada desde el hero de VPA',
  0,
  true
from project_seed ps
where exists (
  select 1
  from public.projects p
  where p.id = ps.id
)
and not exists (
  select 1
  from public.project_images pi
  where pi.project_id = ps.id
    and pi.sort_order = 0
    and pi.url = '/propiedad.jpg'
);

with project_seed (id) as (
  values
    ('22222222-2222-4222-8222-222222222001'::uuid),
    ('22222222-2222-4222-8222-222222222002'::uuid),
    ('22222222-2222-4222-8222-222222222003'::uuid),
    ('22222222-2222-4222-8222-222222222004'::uuid),
    ('22222222-2222-4222-8222-222222222005'::uuid)
)
insert into public.project_images (
  project_id,
  url,
  public_id,
  alt_text,
  sort_order,
  is_cover
)
select
  ps.id,
  '/proyecto.jpg',
  null,
  'Imagen secundaria de prueba reutilizada desde el hero de VPA',
  1,
  false
from project_seed ps
where exists (
  select 1
  from public.projects p
  where p.id = ps.id
)
and not exists (
  select 1
  from public.project_images pi
  where pi.project_id = ps.id
    and pi.sort_order = 1
    and pi.url = '/proyecto.jpg'
);

commit;
