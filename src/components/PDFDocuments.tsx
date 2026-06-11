import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Configurar estilos premium y corporativos
const styles = StyleSheet.create({
  page: { padding: 45, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  
  // Encabezado corporativo
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 15 },
  brandTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' },
  brandSubtitle: { fontSize: 9, color: '#64748b', marginTop: 3 },
  brandInfo: { fontSize: 8, color: '#64748b', marginTop: 2 },
  docTypeContainer: { alignItems: 'flex-end' },
  docTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', tracking: 0.5 },
  docMeta: { fontSize: 8.5, color: '#64748b', marginTop: 3 },
  docId: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', marginTop: 3 },

  // Contenedor de Fichas (Cliente y Vehículo)
  cardsContainer: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  card: { flex: 1, borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, padding: 12, backgroundColor: '#f8fafc' },
  cardHeader: { fontSize: 9, fontWeight: 'bold', color: '#1e3a8a', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 4, marginBottom: 8, textTransform: 'uppercase' },
  
  // Filas en grilla
  gridRow: { flexDirection: 'row', marginBottom: 4 },
  gridLabel: { width: 65, fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  gridValue: { flex: 1, fontSize: 8, color: '#1f2937' },
  
  // Título de Sección General
  sectionTitle: { fontSize: 9.5, fontWeight: 'bold', color: '#1e3a8a', borderLeftWidth: 3, borderLeftColor: '#2563eb', paddingLeft: 6, marginBottom: 8, textTransform: 'uppercase' },
  
  // Cuadros de texto para observaciones y descripciones
  textBox: { backgroundColor: '#f8fafc', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, padding: 12, marginBottom: 20 },
  textParagraph: { fontSize: 8.5, color: '#334155', lineHeight: 1.4 },

  // Estilos de Tablas de Insumos/Repuestos
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a8a', borderRadius: 4, padding: 6, marginBottom: 2 },
  tableRowEven: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#ffffff' },
  tableRowOdd: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  
  colDescHeader: { width: '50%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' },
  colCantHeader: { width: '15%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  colPrecHeader: { width: '17%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' },
  colSubHeader: { width: '18%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' },

  colDesc: { width: '50%', fontSize: 8, color: '#334155' },
  colCant: { width: '15%', fontSize: 8, color: '#334155', textAlign: 'center' },
  colPrec: { width: '17%', fontSize: 8, color: '#334155', textAlign: 'right' },
  colSub: { width: '18%', fontSize: 8, color: '#334155', textAlign: 'right', fontWeight: 'bold' },

  // Cuadro de Resumen de Totales Financieros
  totalsBox: { width: '45%', alignSelf: 'flex-end', marginTop: 15, borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, backgroundColor: '#f8fafc', padding: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 3, paddingBottom: 3 },
  totalLabel: { fontSize: 8.5, color: '#64748b' },
  totalValue: { fontSize: 8.5, color: '#1f2937', fontWeight: 'bold' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 6, marginTop: 4 },
  grandTotalLabel: { fontSize: 10, fontWeight: 'bold', color: '#1e3a8a' },
  grandTotalValue: { fontSize: 11, fontWeight: 'bold', color: '#2563eb' },

  // Firmas de Conformidad
  signaturesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, gap: 50 },
  signatureBox: { flex: 1, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 8 },
  signatureText: { fontSize: 7.5, color: '#64748b' },
  signatureTitle: { fontSize: 8, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },

  // Pie de Página
  footer: { position: 'absolute', bottom: 30, left: 45, right: 45, fontSize: 7.5, textAlign: 'center', color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
});

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

// 1. PDF para Cotizaciones (Premium)
export const CotizacionPDF = ({ cotizacion }: { cotizacion: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>SERVITECA EGAÑA</Text>
          <Text style={styles.brandSubtitle}>Servicio Mecánico Profesional e Integral</Text>
          <Text style={styles.brandInfo}>Puerto Montt, Chile | Contacto: taller@egana.cl</Text>
        </View>
        <View style={styles.docTypeContainer}>
          <Text style={styles.docTitle}>COTIZACIÓN</Text>
          <Text style={styles.docMeta}>
            Fecha Emisión: {new Date(cotizacion.created_at).toLocaleDateString('es-CL')}
          </Text>
          <Text style={styles.docId}>
            Nº {cotizacion.numero_secuencial}
          </Text>
        </View>
      </View>

      {/* Fichas Cliente y Vehículo */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Datos del Cliente</Text>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Nombre:</Text>
            <Text style={styles.gridValue}>{cotizacion.clientes?.nombre || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>RUT:</Text>
            <Text style={styles.gridValue}>{cotizacion.clientes?.rut || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Contacto:</Text>
            <Text style={styles.gridValue}>
              {cotizacion.clientes?.telefono || ''} {cotizacion.clientes?.correo ? `| ${cotizacion.clientes.correo}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Vehículo Asociado</Text>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Patente:</Text>
            <Text style={[styles.gridValue, { fontWeight: 'bold', textTransform: 'uppercase' }]}>
              {cotizacion.vehiculos?.patente || 'N/A'}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Marca / Mod:</Text>
            <Text style={styles.gridValue}>
              {cotizacion.vehiculos?.marca || ''} {cotizacion.vehiculos?.modelo || ''}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Año:</Text>
            <Text style={styles.gridValue}>{cotizacion.vehiculos?.anio || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Detalles del Servicio */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Detalles del Servicio / Trabajo Cotizado</Text>
        <View style={styles.textBox}>
          <Text style={styles.textParagraph}>{cotizacion.descripcion}</Text>
        </View>
      </View>

      {/* Cuadro de Resumen */}
      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal Neto (81%):</Text>
          <Text style={styles.totalValue}>{formatMoney(cotizacion.total * 0.81)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA (19%):</Text>
          <Text style={styles.totalValue}>{formatMoney(cotizacion.total * 0.19)}</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total General:</Text>
          <Text style={styles.grandTotalValue}>{formatMoney(cotizacion.total)}</Text>
        </View>
      </View>

      {/* Firmas */}
      <View style={styles.signaturesContainer}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Firma Responsable Taller</Text>
          <Text style={styles.signatureTitle}>Serviteca Egaña</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Firma Aceptación Presupuesto</Text>
          <Text style={styles.signatureTitle}>{cotizacion.clientes?.nombre || 'Cliente'}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Esta cotización tiene una validez de 15 días desde la fecha de emisión. Valores incluyen IVA. Serviteca Egaña.
      </Text>
    </Page>
  </Document>
);

// 2. PDF para Órdenes de Trabajo (Premium)
export const OrdenTrabajoPDF = ({ orden }: { orden: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>SERVITECA EGAÑA</Text>
          <Text style={styles.brandSubtitle}>Servicio Mecánico Profesional e Integral</Text>
          <Text style={styles.brandInfo}>Puerto Montt, Chile | Fono: +56 9 1234 5678</Text>
        </View>
        <View style={styles.docTypeContainer}>
          <Text style={styles.docTitle}>ORDEN DE TRABAJO (OT)</Text>
          <Text style={styles.docMeta}>
            Fecha Ingreso: {new Date(orden.created_at).toLocaleDateString('es-CL')}
          </Text>
          <Text style={styles.docId}>
            OT Nº {orden.numero_secuencial}
          </Text>
        </View>
      </View>

      {/* Fichas Cliente y Vehículo */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Datos del Cliente</Text>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Nombre:</Text>
            <Text style={styles.gridValue}>{orden.vehiculos?.clientes?.nombre || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>RUT:</Text>
            <Text style={styles.gridValue}>{orden.vehiculos?.clientes?.rut || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Teléfono:</Text>
            <Text style={styles.gridValue}>{orden.vehiculos?.clientes?.telefono || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Correo:</Text>
            <Text style={styles.gridValue}>{orden.vehiculos?.clientes?.correo || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Datos del Vehículo</Text>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Patente:</Text>
            <Text style={[styles.gridValue, { fontWeight: 'bold', textTransform: 'uppercase' }]}>
              {orden.vehiculos?.patente || 'N/A'}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Marca / Mod:</Text>
            <Text style={styles.gridValue}>
              {orden.vehiculos?.marca || ''} {orden.vehiculos?.modelo || ''}
            </Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Año:</Text>
            <Text style={styles.gridValue}>{orden.vehiculos?.anio || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Estado OT:</Text>
            <Text style={[styles.gridValue, { fontWeight: 'bold', color: orden.estado === 'Cerrada' ? '#16a34a' : '#ea580c' }]}>
              {orden.estado || 'Abierta'}
            </Text>
          </View>
        </View>
      </View>

      {/* Diagnóstico / Síntomas */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Diagnóstico Recepción y Solicitud del Cliente</Text>
        <View style={styles.textBox}>
          <Text style={styles.textParagraph}>{orden.descripcion}</Text>
        </View>
      </View>

      {/* Observaciones de Recepción (Detalles previos del vehículo) */}
      {orden.observaciones && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>Observaciones / Detalles Previos del Vehículo</Text>
          <View style={styles.textBox}>
            <Text style={styles.textParagraph}>{orden.observaciones}</Text>
          </View>
        </View>
      )}

      {/* Condiciones */}
      <View style={{ marginTop: 15, padding: 10, backgroundColor: '#f8fafc', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6 }}>
        <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4, textTransform: 'uppercase' }}>Términos del Servicio de Recepción</Text>
        <Text style={{ fontSize: 6.5, color: '#64748b', lineHeight: 1.3 }}>
          1. El taller no responderá por accesorios removibles u objetos de valor que no hayan sido declarados.
          2. Todo trabajo adicional requerido que no conste en esta orden será avisado previamente para autorización.
          3. El cliente autoriza pruebas de carretera reglamentarias y necesarias para verificar los desperfectos mecánicos.
        </Text>
      </View>

      {/* Firmas */}
      <View style={styles.signaturesContainer}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Firma Recepción Taller</Text>
          <Text style={styles.signatureTitle}>Serviteca Egaña</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Firma Autorización Cliente</Text>
          <Text style={styles.signatureTitle}>{orden.vehiculos?.clientes?.nombre || 'Cliente'}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Documento de control de ingreso y recepción de vehículo. Serviteca Egaña.
      </Text>
    </Page>
  </Document>
);

// 3. PDF para Reportes de Trabajo (Premium)
export const ReporteTrabajoPDF = ({ reporte }: { reporte: any }) => {
  const cobroInsumos = reporte.insumos_reporte?.reduce((acc: number, curr: any) => acc + (curr.precio_unitario * curr.cantidad), 0) || 0;
  const manoObra = Math.max(0, reporte.cobro_total - cobroInsumos);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SERVITECA EGAÑA</Text>
            <Text style={styles.brandSubtitle}>Servicio Mecánico Profesional e Integral</Text>
            <Text style={styles.brandInfo}>Puerto Montt, Chile | Fono: +56 9 1234 5678</Text>
          </View>
          <View style={styles.docTypeContainer}>
            <Text style={styles.docTitle}>REPORTE DE TRABAJO (RT)</Text>
            <Text style={styles.docMeta}>
              Fecha Emisión: {new Date(reporte.created_at).toLocaleDateString('es-CL')}
            </Text>
            <Text style={styles.docId}>
              RT Nº {reporte.numero_secuencial}
            </Text>
            <Text style={styles.docMeta}>
              Ref. OT: OT-{reporte.ordenes_trabajo?.numero_secuencial || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Fichas Cliente y Vehículo */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Datos del Cliente</Text>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Nombre:</Text>
              <Text style={styles.gridValue}>{reporte.ordenes_trabajo?.vehiculos?.clientes?.nombre || 'N/A'}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>RUT:</Text>
              <Text style={styles.gridValue}>{reporte.ordenes_trabajo?.vehiculos?.clientes?.rut || 'N/A'}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Teléfono:</Text>
              <Text style={styles.gridValue}>{reporte.ordenes_trabajo?.vehiculos?.clientes?.telefono || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>Datos del Vehículo</Text>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Patente:</Text>
              <Text style={[styles.gridValue, { fontWeight: 'bold', textTransform: 'uppercase' }]}>
                {reporte.ordenes_trabajo?.vehiculos?.patente || 'N/A'}
              </Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Marca / Mod:</Text>
              <Text style={styles.gridValue}>
                {reporte.ordenes_trabajo?.vehiculos?.marca || ''} {reporte.ordenes_trabajo?.vehiculos?.modelo || ''}
              </Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Año:</Text>
              <Text style={styles.gridValue}>{reporte.ordenes_trabajo?.vehiculos?.anio || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Trabajos Realizados */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>Trabajo Mecánico y Reparaciones Realizadas</Text>
          <View style={styles.textBox}>
            <Text style={styles.textParagraph}>{reporte.descripcion_trabajo}</Text>
          </View>
        </View>

        {/* Tabla de Repuestos/Insumos */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>Repuestos y Materiales Incorporados</Text>
          
          <View style={styles.tableHeader}>
            <Text style={styles.colDescHeader}>Repuesto / Insumo</Text>
            <Text style={styles.colCantHeader}>Cant.</Text>
            <Text style={styles.colPrecHeader}>Precio Unit.</Text>
            <Text style={styles.colSubHeader}>Subtotal</Text>
          </View>

          {(!reporte.insumos_reporte || reporte.insumos_reporte.length === 0) ? (
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', alignItems: 'center' }}>
              <Text style={{ fontSize: 8, color: '#64748b', fontStyle: 'italic' }}>No se registraron repuestos ni insumos en este reporte.</Text>
            </View>
          ) : (
            reporte.insumos_reporte.map((insumo: any, idx: number) => {
              const rowStyle = idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd;
              return (
                <View key={insumo.id} style={rowStyle}>
                  <Text style={styles.colDesc}>{insumo.inventario?.nombre || 'Insumo Eliminado'}</Text>
                  <Text style={styles.colCant}>{insumo.cantidad}</Text>
                  <Text style={styles.colPrec}>{formatMoney(insumo.precio_unitario)}</Text>
                  <Text style={styles.colSub}>{formatMoney(insumo.cantidad * insumo.precio_unitario)}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Desglose Financiero */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Mano de Obra:</Text>
            <Text style={styles.totalValue}>{formatMoney(manoObra)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Insumos/Repuestos:</Text>
            <Text style={styles.totalValue}>{formatMoney(cobroInsumos)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total a Pagar:</Text>
            <Text style={styles.grandTotalValue}>{formatMoney(reporte.cobro_total)}</Text>
          </View>
        </View>

        {/* Firmas */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>Firma Mecánico Ejecutor</Text>
            <Text style={styles.signatureTitle}>Serviteca Egaña</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>Firma Recepción Conforme</Text>
            <Text style={styles.signatureTitle}>{reporte.ordenes_trabajo?.vehiculos?.clientes?.nombre || 'Cliente'}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Documento que certifica la entrega del vehículo conforme a los trabajos señalados. Serviteca Egaña.
        </Text>
      </Page>
    </Document>
  );
};

// 4. PDF Consolidado de Cotizaciones
export const ListaCotizacionesPDF = ({ list }: { list: any[] }) => {
  const grandTotal = list.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SERVITECA EGAÑA</Text>
            <Text style={styles.brandSubtitle}>Reporte Consolidado de Cotizaciones Emitidas</Text>
          </View>
          <View style={styles.docTypeContainer}>
            <Text style={styles.docTitle}>REPORTE GENERAL</Text>
            <Text style={styles.docMeta}>Fecha Generación: {new Date().toLocaleDateString('es-CL')}</Text>
            <Text style={styles.docMeta}>Total Documentos: {list.length}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ width: '12%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Nº Cotización</Text>
          <Text style={{ width: '15%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Fecha</Text>
          <Text style={{ width: '30%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Cliente</Text>
          <Text style={{ width: '23%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Patente Vehículo</Text>
          <Text style={{ width: '20%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' }}>Total Cotizado</Text>
        </View>

        {list.map((cot, idx) => {
          const rowStyle = idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd;
          return (
            <View key={cot.id} style={rowStyle}>
              <Text style={{ width: '12%', fontSize: 8, color: '#334155' }}>Nº {cot.numero_secuencial}</Text>
              <Text style={{ width: '15%', fontSize: 8, color: '#334155' }}>{new Date(cot.created_at).toLocaleDateString('es-CL')}</Text>
              <Text style={{ width: '30%', fontSize: 8, color: '#334155' }}>{cot.clientes?.nombre || 'N/A'}</Text>
              <Text style={{ width: '23%', fontSize: 8, color: '#334155', textTransform: 'uppercase' }}>{cot.vehiculos?.patente || 'N/A'}</Text>
              <Text style={{ width: '20%', fontSize: 8, color: '#334155', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(cot.total)}</Text>
            </View>
          );
        })}

        <View style={[styles.totalsBox, { width: '35%', marginTop: 20 }]}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Suma Total:</Text>
            <Text style={styles.grandTotalValue}>{formatMoney(grandTotal)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Reporte Consolidado de Cotizaciones. Serviteca Egaña.</Text>
      </Page>
    </Document>
  );
};

// 5. PDF Consolidado de Órdenes de Trabajo
export const ListaOrdenesTrabajoPDF = ({ list }: { list: any[] }) => {
  const abiertas = list.filter(o => o.estado === 'Abierta').length;
  const progreso = list.filter(o => o.estado === 'En Progreso').length;
  const cerradas = list.filter(o => o.estado === 'Cerrada').length;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SERVITECA EGAÑA</Text>
            <Text style={styles.brandSubtitle}>Reporte Consolidado de Órdenes de Trabajo</Text>
          </View>
          <View style={styles.docTypeContainer}>
            <Text style={styles.docTitle}>REPORTE GENERAL</Text>
            <Text style={styles.docMeta}>Fecha Generación: {new Date().toLocaleDateString('es-CL')}</Text>
            <Text style={styles.docMeta}>Resumen: {abiertas} Abiertas | {progreso} En Progreso | {cerradas} Cerradas</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ width: '10%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Nº OT</Text>
          <Text style={{ width: '12%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Fecha</Text>
          <Text style={{ width: '25%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Cliente</Text>
          <Text style={{ width: '15%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Vehículo</Text>
          <Text style={{ width: '13%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Estado</Text>
          <Text style={{ width: '25%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Descripción / Diagnóstico</Text>
        </View>

        {list.map((orden, idx) => {
          const rowStyle = idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd;
          return (
            <View key={orden.id} style={rowStyle}>
              <Text style={{ width: '10%', fontSize: 8, color: '#334155', fontWeight: 'bold' }}>OT-{orden.numero_secuencial}</Text>
              <Text style={{ width: '12%', fontSize: 8, color: '#334155' }}>{new Date(orden.created_at).toLocaleDateString('es-CL')}</Text>
              <Text style={{ width: '25%', fontSize: 8, color: '#334155' }}>{orden.vehiculos?.clientes?.nombre || 'N/A'}</Text>
              <Text style={{ width: '15%', fontSize: 8, color: '#334155', textTransform: 'uppercase' }}>{orden.vehiculos?.patente} ({orden.vehiculos?.marca})</Text>
              <Text style={{ width: '13%', fontSize: 8, color: orden.estado === 'Cerrada' ? '#16a34a' : '#ea580c', fontWeight: 'bold' }}>{orden.estado}</Text>
              <Text style={{ width: '25%', fontSize: 7.5, color: '#64748b' }}>{orden.descripcion?.substring(0, 50)}{orden.descripcion?.length > 50 ? '...' : ''}</Text>
            </View>
          );
        })}

        <Text style={styles.footer}>Reporte Consolidado de Órdenes de Trabajo. Serviteca Egaña.</Text>
      </Page>
    </Document>
  );
};

// 6. PDF Consolidado de Reportes de Trabajo y Ganancias
export const ListaReportesTrabajoPDF = ({ list }: { list: any[] }) => {
  const totalCostos = list.reduce((acc, curr) => acc + (curr.costo_total || 0), 0);
  const totalCobros = list.reduce((acc, curr) => acc + (curr.cobro_total || 0), 0);
  const totalGanancia = list.reduce((acc, curr) => acc + (curr.ganancia || 0), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SERVITECA EGAÑA</Text>
            <Text style={styles.brandSubtitle}>Consolidado de Ingresos y Ganancias de Trabajos</Text>
          </View>
          <View style={styles.docTypeContainer}>
            <Text style={styles.docTitle}>REPORTE FINANCIERO</Text>
            <Text style={styles.docMeta}>Fecha Generación: {new Date().toLocaleDateString('es-CL')}</Text>
            <Text style={styles.docMeta}>Total Reportes: {list.length}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ width: '10%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Nº RT</Text>
          <Text style={{ width: '10%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Ref. OT</Text>
          <Text style={{ width: '10%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Fecha</Text>
          <Text style={{ width: '25%', fontSize: 8, fontWeight: 'bold', color: '#ffffff' }}>Cliente</Text>
          <Text style={{ width: '15%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' }}>Costo Insumos</Text>
          <Text style={{ width: '15%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' }}>Monto Cobrado</Text>
          <Text style={{ width: '15%', fontSize: 8, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' }}>Ganancia Neta</Text>
        </View>

        {list.map((reporte, idx) => {
          const rowStyle = idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd;
          return (
            <View key={reporte.id} style={rowStyle}>
              <Text style={{ width: '10%', fontSize: 8, color: '#334155' }}>RT-{reporte.numero_secuencial}</Text>
              <Text style={{ width: '10%', fontSize: 8, color: '#334155' }}>OT-{reporte.ordenes_trabajo?.numero_secuencial || 'N/A'}</Text>
              <Text style={{ width: '10%', fontSize: 8, color: '#334155' }}>{new Date(reporte.created_at).toLocaleDateString('es-CL')}</Text>
              <Text style={{ width: '25%', fontSize: 8, color: '#334155' }}>{reporte.ordenes_trabajo?.vehiculos?.clientes?.nombre || 'N/A'}</Text>
              <Text style={{ width: '15%', fontSize: 8, color: '#dc2626', textAlign: 'right' }}>{formatMoney(reporte.costo_total)}</Text>
              <Text style={{ width: '15%', fontSize: 8, color: '#1f2937', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(reporte.cobro_total)}</Text>
              <Text style={{ width: '15%', fontSize: 8, color: '#16a34a', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(reporte.ganancia)}</Text>
            </View>
          );
        })}

        <View style={[styles.totalsBox, { width: '45%', marginTop: 20 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gastos Totales (Costo Repuestos):</Text>
            <Text style={[styles.totalValue, { color: '#dc2626' }]}>{formatMoney(totalCostos)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Ingresos Totales (Cobro Clientes):</Text>
            <Text style={styles.totalValue}>{formatMoney(totalCobros)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Ganancia Neta Consolidada:</Text>
            <Text style={[styles.grandTotalValue, { color: '#16a34a' }]}>{formatMoney(totalGanancia)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Reporte Financiero y Consolidado de Ganancias. Serviteca Egaña.</Text>
      </Page>
    </Document>
  );
};
