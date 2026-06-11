-- ==========================================
-- SCRIPT DE CREACIÓN DE TABLAS - EGAÑA AUTOMOTRIZ
-- Ejecuta este script en el SQL Editor de Supabase
-- ==========================================

-- 1. Crear tabla Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  rut text,
  correo text,
  telefono text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  patente text NOT NULL UNIQUE,
  marca text,
  modelo text,
  anio integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla Inventario (Repuestos/Insumos)
CREATE TABLE IF NOT EXISTS inventario (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text UNIQUE,
  nombre text NOT NULL,
  stock numeric DEFAULT 0 NOT NULL,
  costo_unitario numeric DEFAULT 0 NOT NULL,
  precio_venta numeric DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear tabla Órdenes de Trabajo (OT)
-- Estados posibles: 'Abierta', 'En Progreso', 'Cerrada'
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_secuencial SERIAL,
  vehiculo_id uuid REFERENCES vehiculos(id) ON DELETE CASCADE,
  estado text DEFAULT 'Abierta',
  descripcion text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Crear tabla Reportes de Trabajo (RT)
CREATE TABLE IF NOT EXISTS reportes_trabajo (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_secuencial SERIAL,
  orden_id uuid REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  descripcion_trabajo text NOT NULL,
  costo_total numeric DEFAULT 0 NOT NULL,
  cobro_total numeric DEFAULT 0 NOT NULL,
  ganancia numeric DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Crear tabla Insumos Usados en Reporte
CREATE TABLE IF NOT EXISTS insumos_reporte (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporte_id uuid REFERENCES reportes_trabajo(id) ON DELETE CASCADE,
  inventario_id uuid REFERENCES inventario(id) ON DELETE CASCADE,
  cantidad numeric NOT NULL,
  precio_unitario numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Crear tabla Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_secuencial SERIAL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vehiculo_id uuid REFERENCES vehiculos(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  total numeric DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- Permitir acceso a todos los usuarios autenticados
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos_reporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir SELECT, INSERT, UPDATE, DELETE a usuarios autenticados
CREATE POLICY "Permitir todo a usuarios autenticados en clientes" ON clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en vehiculos" ON vehiculos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en inventario" ON inventario FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en ordenes_trabajo" ON ordenes_trabajo FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en reportes_trabajo" ON reportes_trabajo FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en insumos_reporte" ON insumos_reporte FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en cotizaciones" ON cotizaciones FOR ALL USING (auth.role() = 'authenticated');

-- Función para actualizar stock automáticamente al insertar en insumos_reporte
CREATE OR REPLACE FUNCTION actualizar_stock_inventario()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventario
  SET stock = stock - NEW.cantidad
  WHERE id = NEW.inventario_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON insumos_reporte
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_inventario();

-- Función para cerrar la OT cuando se crea un RT
CREATE OR REPLACE FUNCTION cerrar_ot_al_crear_rt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ordenes_trabajo
  SET estado = 'Cerrada'
  WHERE id = NEW.orden_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cerrar_ot
AFTER INSERT ON reportes_trabajo
FOR EACH ROW
EXECUTE FUNCTION cerrar_ot_al_crear_rt();
