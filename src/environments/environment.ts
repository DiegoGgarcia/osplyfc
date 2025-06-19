export const environment = {
  production: false,
  processMakerUrl: 'https://bpm.micam.com.ar',
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
      casesAdvancedSearch: '/api/1.0/{workspace}/cases/advanced-search/paged',
      processes: '/api/1.0/{workspace}/processes',
      users: '/api/1.0/{workspace}/users',
      departments: '/api/1.0/{workspace}/departments',
      groups: '/api/1.0/{workspace}/groups'
    }
  },
  n8nApiUrl: 'http://localhost:5678/webhook',
  refreshInterval: 300000,
  cacheTimeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000
};
