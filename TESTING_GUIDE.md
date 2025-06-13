# GUÍA DE PRUEBAS - PROCESSMAKER 3.4 AUTHENTICATION

## 🧪 TESTS DE AUTENTICACIÓN

### 1. Configuración Previa

Antes de probar, verificar que:

```bash
# 1. ProcessMaker 3.4.9 esté ejecutándose
curl -i https://bpm.micam.com.ar/sysOsplyfC/api/1.0/OsplyfC/login

# 2. Las credenciales de usuario estén disponibles
# Usuario: [tu_usuario_pm]
# Password: [tu_password_pm]

# 3. El workspace OsplyfC esté configurado
```

### 2. Test Manual de Login

#### Paso 1: Verificar Endpoint de Login
```bash
# Probar endpoint manualmente
curl -X POST https://bpm.micam.com.ar/sysOsplyfC/api/1.0/OsplyfC/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "usr_username": "TU_USUARIO",
    "usr_password": "TU_PASSWORD"
  }'
```

**Respuesta Esperada:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "usr_uid": "12345678901234567890123456789012",
    "usr_username": "usuario",
    "usr_firstname": "Nombre",
    "usr_lastname": "Apellido",
    "usr_email": "email@osplyfc.com.ar"
  }
}
```

#### Paso 2: Verificar Endpoint de Usuario
```bash
# Con el token obtenido:
curl -X GET https://bpm.micam.com.ar/sysOsplyfC/api/1.0/OsplyfC/user \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

### 3. Test de la Aplicación Angular

#### Escenario 1: Login Exitoso
1. Abrir `http://localhost:4200`
2. Debería redirigir a `/auth/login`
3. Ingresar credenciales válidas:
   - Usuario: `[tu_usuario]`
   - Password: `[tu_password]`
4. Hacer clic en "Iniciar Sesión"
5. **Verificar:**
   - Loading spinner aparece
   - Redirección a `/dashboard`
   - Snackbar de bienvenida
   - Usuario mostrado en header

#### Escenario 2: Login con Credenciales Incorrectas
1. Ingresar credenciales inválidas
2. **Verificar:**
   - Mensaje de error: "Usuario o contraseña incorrectos"
   - No hay redirección
   - Formulario permanece activo

#### Escenario 3: Error de Conectividad
1. Desconectar internet o cambiar URL en environment
2. Intentar login
3. **Verificar:**
   - Mensaje: "No se puede conectar con el servidor"
   - Error 0 o timeout

### 4. Test de Persistencia de Sesión

#### Escenario 1: Refresh de Página
1. Hacer login exitoso
2. Estar en dashboard
3. Refrescar página (F5)
4. **Verificar:**
   - Permanece en dashboard
   - Usuario sigue logueado
   - Datos del localStorage presentes

#### Escenario 2: Nueva Pestaña
1. Con sesión activa en una pestaña
2. Abrir nueva pestaña en `http://localhost:4200`
3. **Verificar:**
   - Redirección automática a dashboard
   - Usuario ya logueado

### 5. Test de Logout

#### Escenario 1: Logout Manual
1. Estar logueado en dashboard
2. Hacer clic en menú de usuario
3. Seleccionar "Cerrar Sesión"
4. **Verificar:**
   - Redirección a `/auth/login`
   - localStorage limpio
   - Snackbar de confirmación

#### Escenario 2: Token Expirado
1. Simular token expirado (cambiar `expires_at` en localStorage)
2. Navegar a dashboard
3. **Verificar:**
   - Redirección automática a login
   - Sesión limpiada

### 6. Test de Interceptors

#### Verificar Headers de Autenticación
1. Abrir DevTools → Network
2. Estar logueado
3. Navegar por la aplicación
4. **Verificar requests a ProcessMaker:**
   - Header `Authorization: Bearer ...`
   - Header `Content-Type: application/json`
   - Cookie de sesión si aplica

### 7. Test de Casos de Error

#### Error 401 - No Autorizado
```javascript
// En DevTools Console:
fetch('https://bpm.micam.com.ar/sysOsplyfC/api/1.0/OsplyfC/cases', {
  headers: {
    'Authorization': 'Bearer token_invalido'
  }
})
.then(r => console.log(r.status)) // Debería ser 401
```

#### Error 404 - Endpoint No Encontrado
```javascript
// Verificar que no se use el endpoint /light:
fetch('https://bpm.micam.com.ar/sysOsplyfC/api/1.0/OsplyfC/light')
.then(r => console.log(r.status)) // Debería ser 404
```

### 8. Logs de Debugging

Verificar en DevTools Console:

```
✅ Logs Exitosos:
🔑 Intentando login en ProcessMaker 3.4...
✅ Login exitoso: {access_token: "...", user: {...}}
💾 Sesión guardada, expira en: [fecha]
👤 Usuario establecido: [username]
✅ Sesión restaurada para usuario: [username]

❌ Logs de Error:
❌ ProcessMaker Login error: [detalles]
⏰ Token expirado, limpiando sesión
🚪 Error de autenticación, redirigiendo al login
```

### 9. Test de Performance

#### Tiempo de Login
- Login debería completarse en < 3 segundos
- Carga inicial del dashboard < 5 segundos

#### Memoria
- Verificar que no hay memory leaks en DevTools
- Observar uso de memoria durante navegación

### 10. Comandos Útiles para Debug

```bash
# Ver localStorage en DevTools Console:
console.table({
  access_token: localStorage.getItem('access_token'),
  token_type: localStorage.getItem('token_type'),
  expires_at: new Date(parseInt(localStorage.getItem('expires_at'))),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}')
});

# Limpiar sesión manualmente:
['access_token', 'token_type', 'refresh_token', 'expires_at', 'currentUser']
  .forEach(key => localStorage.removeItem(key));

# Verificar estado de autenticación:
// En componente Angular con AuthService inyectado:
this.authService.isAuthenticated()
this.authService.getCurrentUser()
```

### 11. Troubleshooting Común

#### Problema: Error 404 en login
**Solución:** Verificar que no se esté usando `/light` endpoint

#### Problema: CORS errors
**Solución:** Verificar `withCredentials: true` en requests

#### Problema: Token no se incluye en requests
**Solución:** Verificar que AuthInterceptor esté registrado correctamente

#### Problema: Usuario no persiste después de refresh
**Solución:** Verificar que `checkStoredAuth()` se ejecute en AuthService constructor

#### Problema: Redirecciones infinitas
**Solución:** Verificar lógica en AuthGuard y manejo de rutas protegidas

### 12. Checklist Final

- [ ] Login funciona con credenciales válidas
- [ ] Error apropiado con credenciales inválidas  
- [ ] Persistencia de sesión funciona
- [ ] Logout limpia sesión correctamente
- [ ] Interceptor agrega headers de auth
- [ ] AuthGuard protege rutas correctamente
- [ ] Dashboard carga datos apropiadamente
- [ ] No hay errores en console
- [ ] Performance aceptable
- [ ] Funciona en diferentes navegadores

### 13. Datos de Test

Para pruebas, usar estos datos de ejemplo:

```typescript
// Credenciales de test (reemplazar con reales):
const testCredentials = {
  username: 'tu_usuario_pm',
  password: 'tu_password_pm'
};

// URLs de test:
const testUrls = {
  processmaker: 'https://bpm.micam.com.ar/sysOsplyfC',
  login: '/api/1.0/OsplyfC/login',
  user: '/api/1.0/OsplyfC/user',
  cases: '/api/1.0/OsplyfC/cases'
};
```

---

**⚠️ IMPORTANTE:** Nunca commitear credenciales reales al repositorio. Usar variables de entorno para credenciales de test.