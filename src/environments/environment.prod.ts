// src/environments/environment.prod.ts - PRODUCCIÓN
export const environment = {
  production: true,
  processMakerUrl: 'https://bpm.micam.com.ar',
  workspace: 'OsplyfC',
  
  // OAuth 2.0 Configuration
  oauth: {
    clientId: 'YGJMEUDNZMBMDUASKDLUEJYKEOYKMGXA',
    clientSecret: '995242620684c5996639dd9053914125',
    scope: '*',
    grantType: 'password'
  },
  
  // ProcessMaker API Endpoints
  processMakerEndpoints: {
    auth: {
      token: '/oauth2/token',
      refresh: '/oauth2/token',
      revoke: '/oauth2/revoke'
    },
    api: {
      cases: '/api/1.0/{workspace}/cases',
      casesTodo: '/api/1.0/{workspace}/cases/todo',
      casesSent: '/api/1.0/{workspace}/cases/sent', 
      casesAdvancedSearch: '/api/1.0/{workspace}/cases/advanced-search/paged',
      processes: '/api/1.0/{workspace}/processes',
      users: '/api/1.0/{workspace}/users',
      user: '/api/1.0/{workspace}/user',
      departments: '/api/1.0/{workspace}/departments',
      groups: '/api/1.0/{workspace}/groups'
    }
  },
  
  // Configuración para N8N (producción)
  n8nApiUrl: 'https://n8n.micam.com.ar/webhook', // URL de producción
  
  // App Settings
  refreshInterval: 300000, // 5 minutos
  cacheTimeout: 60000,     // 1 minuto
  retryAttempts: 3,
  retryDelay: 1000         // 1 segundo
};
