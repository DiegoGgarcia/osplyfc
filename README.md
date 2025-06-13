# 🏥 OsplyfC Dashboard - Sistema de Gestión de Expedientes

Dashboard moderno para la Obra Social del Personal de Luz y Fuerza de Córdoba (OsplyfC) que integra con ProcessMaker 3.4.9 Community Edition.

## 📋 Descripción

Este proyecto implementa un dashboard responsivo que reemplaza el HOME de ProcessMaker, proporcionando una interfaz moderna para gestionar los 14 tipos de expedientes utilizados en el sistema GECROS de OsplyfC.

## 🏗️ Arquitectura

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     FRONTEND        │    │   PROCESSMAKER      │    │      GECROS         │
│                     │    │                     │    │                     │
│  Angular 17+        │◄──►│  REST API 3.4.9     │◄──►│   14 Tipos de       │
│  Standalone Comp.   │    │  Community Edition  │    │   Expedientes       │
│  Angular Material   │    │                     │    │                     │
│  TailwindCSS        │    │  Workspace: OsplyfC │    │   Workflow GECROS   │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🚀 Características

### ✅ Implementado

- **Autenticación ProcessMaker 3.4:** Login session-based completo
- **Dashboard Responsivo:** Interfaz moderna con Angular Material
- **14 Tipos de Expedientes:** Según especificaciones GECROS
- **Métricas en Tiempo Real:** Estadísticas de casos y actividad
- **Gestión de Usuarios:** Roles y permisos integrados
- **Auto-refresh:** Actualización automática de datos
- **Persistencia de Sesión:** Manejo completo de tokens
- **Error Handling:** Manejo robusto de errores y reconexión

### 🔄 En Desarrollo

- **Inicio de Expedientes:** Funcionalidad para crear nuevos casos
- **Reportes Avanzados:** Métricas específicas por departamento
- **Notificaciones:** Sistema de alertas y notificaciones
- **Integración N8N:** Workflows automáticos (opcional)

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Angular 17+ con Standalone Components
- **UI Library:** Angular Material 17
- **Styling:** TailwindCSS + Angular Material Theme
- **Estado:** Angular Signals
- **HTTP:** Angular HttpClient con interceptors
- **Build:** Angular CLI con Vite

### Backend Integration
- **ProcessMaker:** v3.4.9 Community Edition
- **Workspace:** OsplyfC
- **API:** REST API /api/1.0/OsplyfC
- **Autenticación:** Session-based (NO OAuth 2.0)

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm 9+
- Angular CLI 17+
- ProcessMaker 3.4.9 funcionando en https://bpm.micam.com.ar/sysOsplyfC
- Acceso a workspace OsplyfC

### 1. Clonar e Instalar

```bash
# Clonar repositorio
git clone [URL_REPO]
cd osplyfc-dashboard

# Instalar dependencias
npm install
```

### 2. Configuración de Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  processMakerUrl: 'https://bpm.micam.com.ar/sysOsplyfC',
  workspace: 'OsplyfC',
  processMakerEndpoints: {
    auth: {
      login: '/api/1.0/{workspace}/login',
      logout: '/api/1.0/{workspace}/logout',
      user: '/api/1.0/{workspace}/user'
    },
    api: {
      cases: '/api/1.0/{workspace}/cases',
      casesTodo: '/api/1.0/{workspace}/cases/todo',
      casesSent: '/api/1.0/{workspace}/cases/sent',
      processes: '/api/1.0/{workspace}/processes'
    }
  },
  refreshInterval: 300000 // 5 minutos
};
```

### 3. Desarrollo

```bash
# Servidor de desarrollo
ng serve

# Abrir en navegador
http://localhost:4200
```

### 4. Build para Producción

```bash
# Build optimizado
ng build --configuration production

# Los archivos se generan en dist/osplyfc/
```

## 🔐 Autenticación

### ProcessMaker 3.4 Session-Based Auth

La aplicación utiliza autenticación tradicional de ProcessMaker 3.4:

```typescript
// Flujo de autenticación:
1. POST /api/1.0/OsplyfC/login con credenciales
2. Respuesta con access_token y datos de usuario
3. Almacenamiento en localStorage + cookies de sesión
4. Headers Authorization en requests posteriores
5. Auto-refresh de token cuando sea necesario
```

### Endpoints Principales

```bash
# Login
POST /api/1.0/OsplyfC/login
Body: { "usr_username": "user", "usr_password": "pass" }

# User Info
GET /api/1.0/OsplyfC/user
Headers: Authorization: Bearer {token}

# Cases
GET /api/1.0/OsplyfC/cases/todo
GET /api/1.0/OsplyfC/cases/sent

# Logout
POST /api/1.0/OsplyfC/logout
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios y utilidades core
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   └── services/           # Servicios principales
│   │       ├── auth.service.ts          # Autenticación
│   │       ├── processmaker.service.ts  # API ProcessMaker
│   │       └── dashboard.service.ts     # Datos dashboard
│   │
│   ├── features/               # Features de la aplicación
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── login.component.ts
│   │   │   └── auth-callback.component.ts
│   │   └── dashboard/         # Dashboard principal
│   │       └── dashboard.component.ts
│   │
│   ├── shared/                # Componentes compartidos
│   └── app.routes.ts          # Configuración de rutas
│
├── environments/              # Configuración por ambiente
├── assets/                   # Recursos estáticos
└── styles.css               # Estilos globales
```

## 🏢 Expedientes OsplyfC

### 14 Tipos Implementados

| # | Expediente | Departamento | Descripción |
|---|---|---|---|
| 1 | **Autorización** | Auditoría | Medicamentos, materiales, sondas |
| 2 | **Correspondencia Varios** | Variable | Recetarios, certificados CUD |
| 3 | **Legajo** | Personal | Documentación empleados |
| 4 | **Factura Médica** | Facturación | Clínicas, sanatorios |
| 5 | **Factura Proveedores** | Facturación | Servicios generales |
| 6 | **Reintegros** | Auditoría | Prestaciones fuera de red |
| 7 | **SUR Medicación** | Auditoría | Sistema Único Reintegros |
| 8 | **Carta Documento** | Legales | Documentación legal |
| 9 | **Nota** | Variable | Oficios, cédulas, amparos |
| 10 | **Presupuestos** | Auditoría | Prestaciones no convenidas |
| 11 | **Hospitales Públicos** | Facturación | Verificación cobertura |
| 12 | **Despachos** | General | Envíos a delegaciones |
| 13 | **Carpeta Discapacidad** | Junta | Revisión facturas |
| 14 | **Correo Argentino** | Complementario | Cartas certificadas |

### Flujo General GECROS

```
INICIO (Mesa de Entrada / CAB)
    ↓
IDENTIFICACIÓN AUTOMÁTICA ÁREA ORIGEN
    ↓
VALIDACIÓN Y COMPLETADO DE DATOS
    ↓
RUTEO AUTOMÁTICO AL ÁREA DESTINO
    ↓
EVALUACIÓN/PROCESAMIENTO
    ↓
DECISIÓN (Aprobado/Rechazado/Más Info)
    ↓
COMUNICACIÓN (Opcional via CAB)
    ↓
FINALIZACIÓN Y MÉTRICAS
```

## 🎯 Roles y Permisos

### Estructura Organizacional

```
OsplyfC (Raíz)
├── Mesa de Entrada
├── CAB (Centro de Atención al Beneficiario)
├── Auditoría
│   ├── Auditoría Médica
│   ├── Auditoría Odontológica
│   └── Auditoría Salud Mental
├── Facturación
│   ├── Facturación General
│   └── Facturación 4to Piso
├── Legales
├── Recursos Humanos
└── Junta de Discapacidad
```

### Roles Definidos

- **ROL_MESA_ENTRADA:** Operadores de ingreso
- **ROL_CAB_OPERADOR:** Centro de atención
- **ROL_AUDITOR_MEDICO:** Profesionales auditores
- **ROL_SUPERVISOR_AUDITORIA:** Supervisión y gestión

## 🔧 Desarrollo

### Comandos Útiles

```bash
# Desarrollo
npm start                    # ng serve
npm run build               # ng build
npm run build:prod         # ng build --configuration production
npm test                   # ng test
npm run lint              # ng lint

# Análisis
npm run analyze           # webpack-bundle-analyzer
```

### Testing

```bash
# Tests unitarios
ng test

# Tests e2e
ng e2e

# Cobertura
ng test --code-coverage
```

### Debug de Autenticación

```javascript
// En DevTools Console - verificar estado:
console.table({
  token: localStorage.getItem('access_token'),
  user: JSON.parse(localStorage.getItem('currentUser') || '{}'),
  expires: new Date(parseInt(localStorage.getItem('expires_at')))
});

// Limpiar sesión manualmente:
['access_token', 'token_type', 'refresh_token', 'expires_at', 'currentUser']
  .forEach(key => localStorage.removeItem(key));
```

## 🚀 Deployment

### Build de Producción

```bash
# Build optimizado
ng build --configuration production

# Los archivos están en: dist/osplyfc/
```

### Configuración del Servidor

```nginx
# nginx.conf ejemplo:
server {
    listen 80;
    server_name dashboard.osplyfc.com.ar;
    
    location / {
        root /var/www/osplyfc-dashboard;
        try_files $uri $uri/ /index.html;
    }
    
    # Caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Variables de Entorno - Producción

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  processMakerUrl: 'https://bpm.micam.com.ar/sysOsplyfC',
  workspace: 'OsplyfC',
  refreshInterval: 300000,
  retryAttempts: 3
};
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error 404 en Login
```
Causa: Uso del endpoint /light (no disponible en PM 3.4)
Solución: Verificar que se use /login en lugar de /light
```

#### CORS Errors
```
Causa: Configuración incorrecta de headers
Solución: Asegurar withCredentials: true en requests
```

#### Token No Persiste
```
Causa: Error en checkStoredAuth()
Solución: Verificar localStorage y llamadas en constructor
```

#### Redirecciones Infinitas
```
Causa: Lógica incorrecta en AuthGuard
Solución: Revisar condiciones de autenticación
```

### Logs de Debug

```
✅ Funcionamiento Normal:
🔑 Intentando login en ProcessMaker 3.4...
✅ Login exitoso: {access_token: "...", user: {...}}
💾 Sesión guardada, expira en: [fecha]
👤 Usuario establecido: [username]

❌ Errores Comunes:
❌ ProcessMaker Login error: [details]
⏰ Token expirado, limpiando sesión
🚪 Error de autenticación, redirigiendo al login
```

## 📚 Documentación Adicional

- [ProcessMaker 3.4 REST API](https://wiki.processmaker.com/3.1/REST_API)
- [Angular Material](https://material.angular.io/)
- [Testing Guide](./TESTING_GUIDE.md)
- [Contexto del Proyecto](./docs/CONTEXTO_PROYECTO.md)

## 🤝 Contribución

### Flujo de Desarrollo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Add: nueva funcionalidad'`
4. Push rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- **Linting:** ESLint + Prettier
- **Commits:** Conventional Commits
- **Testing:** Jest + Angular Testing Library
- **Cobertura:** Mínimo 80%

## 📄 Licencia

Proyecto privado - OsplyfC (Obra Social del Personal de Luz y Fuerza de Córdoba)

## 👥 Equipo

- **Desarrollo:** [Nombre del desarrollador]
- **Cliente:** OsplyfC
- **Consultoría:** [Nombre de la consultora]

## 📞 Soporte

Para soporte técnico o consultas:

- **Email:** [email_soporte]
- **ProcessMaker:** https://bpm.micam.com.ar/sysOsplyfC
- **Documentación:** [URL_documentacion]

---

**🏥 OsplyfC - Obra Social del Personal de Luz y Fuerza de Córdoba**
*Sistema de Gestión de Expedientes - Dashboard v1.0.0*