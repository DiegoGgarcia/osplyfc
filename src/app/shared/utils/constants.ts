// src/app/shared/utils/constants.ts
import { ExpedienteType } from '../../core/models/case.model';

export const EXPEDIENTES_OSPLYFC: ExpedienteType[] = [
  {
    id: 1,
    code: 'AUTORIZACION',
    name: 'Autorización',
    description: 'Pedido de medicamentos, materiales de osteosíntesis, sondas, alimentación enteral',
    sector_destino: 'Auditoría',
    icon: 'medical_services',
    color: '#4CAF50',
    status: 'ACTIVE',
    documentacion_requerida: ['Pedido médico escaneado']
  },
  {
    id: 2,
    code: 'CORRESPONDENCIA_VARIOS',
    name: 'Correspondencia Varios',
    description: 'Pedidos de recetarios, órdenes médicas, insumos, certificados CUD',
    sector_destino: 'Área solicitante',
    icon: 'mail',
    color: '#2196F3',
    status: 'ACTIVE',
    documentacion_requerida: ['Comprobante escaneado (si aplica)']
  },
  {
    id: 3,
    code: 'LEGAJO',
    name: 'Legajo',
    description: 'Documentación para empleados: certificados médicos, embarazo, ausencias',
    sector_destino: 'Área de personal',
    icon: 'folder',
    color: '#FF9800',
    status: 'ACTIVE',
    documentacion_requerida: ['Documento escaneado o físico']
  },
  {
    id: 4,
    code: 'FACTURA_MEDICA',
    name: 'Factura Médica',
    description: 'Clínicas, sanatorios, hospitales públicos, prestaciones no SUR',
    sector_destino: 'Facturación',
    icon: 'receipt',
    color: '#9C27B0',
    status: 'ACTIVE',
    documentacion_requerida: ['Factura', 'comprobante', 'planilla']
  },
  {
    id: 5,
    code: 'FACTURA_PROVEEDORES',
    name: 'Factura Proveedores',
    description: 'Servicios e insumos generales, honorarios, servicios públicos',
    sector_destino: 'Facturación',
    icon: 'business',
    color: '#795548',
    status: 'ACTIVE',
    documentacion_requerida: ['Factura', 'comprobante', 'planilla']
  },
  {
    id: 6,
    code: 'REINTEGROS',
    name: 'Reintegros',
    description: 'Prestaciones médicas, odontológicas, medicamentos fuera de red',
    sector_destino: 'Auditoría / Odontológica / Salud Mental',
    icon: 'money',
    color: '#4CAF50',
    status: 'ACTIVE',
    documentacion_requerida: ['Factura', 'formulario de reintegro']
  },
  {
    id: 7,
    code: 'SUR_MEDICACION',
    name: 'SUR Medicación',
    description: 'Medicamentos bajo Sistema Único de Reintegros',
    sector_destino: 'Auditoría',
    icon: 'local_pharmacy',
    color: '#E91E63',
    status: 'ACTIVE',
    documentacion_requerida: ['Receta escaneada']
  },
  {
    id: 8,
    code: 'CARTA_DOCUMENTO',
    name: 'Carta Documento',
    description: 'Documentación legal urgente, avisos judiciales',
    sector_destino: 'Legales',
    icon: 'gavel',
    color: '#F44336',
    status: 'ACTIVE',
    documentacion_requerida: ['Registro en planilla', 'copia física']
  },
  {
    id: 9,
    code: 'NOTA',
    name: 'Nota',
    description: 'Coberturas, afiliaciones, oficios judiciales, cédulas, amparos',
    sector_destino: 'Variable según el contenido',
    icon: 'note',
    color: '#607D8B',
    status: 'ACTIVE',
    documentacion_requerida: ['Adjunto físico o digital']
  },
  {
    id: 10,
    code: 'PRESUPUESTOS',
    name: 'Presupuestos',
    description: 'Prestaciones médicas no convenidas previamente',
    sector_destino: 'Auditoría / Dirección Médica',
    icon: 'calculate',
    color: '#FF5722',
    status: 'ACTIVE',
    documentacion_requerida: ['Presupuesto escaneado']
  },
  {
    id: 11,
    code: 'HOSPITALES_PUBLICOS',
    name: 'Hospitales Públicos',
    description: 'Facturación de prestaciones en hospitales públicos',
    sector_destino: 'Facturación',
    icon: 'local_hospital',
    color: '#3F51B5',
    status: 'ACTIVE',
    documentacion_requerida: ['Control de cobertura', 'hoja adjunta']
  },
  {
    id: 12,
    code: 'DESPACHOS',
    name: 'Despachos',
    description: 'Envío de órdenes médicas, documentación a delegaciones',
    sector_destino: 'Dependencia destino',
    icon: 'local_shipping',
    color: '#009688',
    status: 'ACTIVE',
    documentacion_requerida: ['Comprobante', 'hoja BUI', 'stickers']
  },
  {
    id: 13,
    code: 'CARPETA_DISCAPACIDAD',
    name: 'Carpeta de Discapacidad',
    description: 'Facturas para revisión y control de discapacidad',
    sector_destino: 'Junta de Discapacidad',
    icon: 'accessible',
    color: '#673AB7',
    status: 'ACTIVE',
    documentacion_requerida: ['Subida a Google Drive']
  },
  {
    id: 14,
    code: 'SOLICITUDES_CORREO_ARGENTINO',
    name: 'Solicitudes de Correo Argentino',
    description: 'Complementa flujo de Cartas Documento y otros envíos',
    sector_destino: 'Complementa otros envíos',
    icon: 'mail_outline',
    color: '#757575',
    status: 'ACTIVE',
    documentacion_requerida: ['Formulario con stickers']
  }
];

export const USER_ROLES = {
  MESA_ENTRADA: 'ROL_MESA_ENTRADA',
  CAB_OPERADOR: 'ROL_CAB_OPERADOR',
  AUDITOR_MEDICO: 'ROL_AUDITOR_MEDICO',
  SUPERVISOR_AUDITORIA: 'ROL_SUPERVISOR_AUDITORIA'
} as const;

export const DEPARTAMENTOS = {
  MESA_ENTRADA: 'Mesa de Entrada',
  CAB: 'CAB',
  AUDITORIA_MEDICA: 'Auditoría Médica',
  AUDITORIA_ODONTOLOGICA: 'Auditoría Odontológica',
  AUDITORIA_SALUD_MENTAL: 'Auditoría Salud Mental',
  FACTURACION: 'Facturación',
  LEGALES: 'Legales'
} as const;