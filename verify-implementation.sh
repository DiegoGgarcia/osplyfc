#!/bin/bash

# Script de verificación de la implementación de autenticación ProcessMaker 3.4
# OsplyfC Dashboard - Verificación Final

echo "🔍 VERIFICACIÓN DE IMPLEMENTACIÓN - OSPLYFC DASHBOARD"
echo "===================================================="
echo

# Verificar estructura de archivos
echo "📁 Verificando estructura de archivos..."

files_to_check=(
    "src/environments/environment.ts"
    "src/environments/environment.prod.ts" 
    "src/app/core/services/auth.service.ts"
    "src/app/core/services/processmaker.service.ts"
    "src/app/core/services/dashboard.service.ts"
    "src/app/core/interceptors/auth.interceptor.ts"
    "src/app/core/guards/auth.guard.ts"
    "src/app/features/auth/login.component.ts"
    "src/app/features/dashboard/dashboard.component.ts"
    "src/app/app.config.ts"
    "src/styles.css"
    "README.md"
    "TESTING_GUIDE.md"
)

missing_files=()
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTANTE"
        missing_files+=("$file")
    fi
done

echo

# Verificar configuración en environments
echo "⚙️ Verificando configuración de environment..."

if grep -q "processMakerUrl.*bpm.micam.com.ar/sysOsplyfC" src/environments/environment.ts; then
    echo "✅ URL de ProcessMaker configurada"
else
    echo "❌ URL de ProcessMaker no configurada correctamente"
fi

if grep -q "workspace.*OsplyfC" src/environments/environment.ts; then
    echo "✅ Workspace OsplyfC configurado"
else
    echo "❌ Workspace no configurado"
fi

if grep -q "/login" src/environments/environment.ts && ! grep -q "/light" src/environments/environment.ts; then
    echo "✅ Endpoints de autenticación correctos (NO usa /light)"
else
    echo "❌ Endpoints de autenticación incorrectos"
fi

echo

# Verificar AuthService
echo "🔐 Verificando AuthService..."

if grep -q "login.*LoginCredentials.*Observable<User>" src/app/core/services/auth.service.ts; then
    echo "✅ Método login implementado correctamente"
else
    echo "❌ Método login no implementado"
fi

if grep -q "withCredentials: true" src/app/core/services/auth.service.ts; then
    echo "✅ withCredentials configurado para sesiones"
else
    echo "❌ withCredentials no configurado"
fi

if grep -q "localStorage.*access_token" src/app/core/services/auth.service.ts; then
    echo "✅ Persistencia de token implementada"
else
    echo "❌ Persistencia de token no implementada"
fi

echo

# Verificar que no se use OAuth 2.0
echo "🚫 Verificando que NO se use OAuth 2.0..."

if ! grep -r "oauth" src/ --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | grep -i "client_id\|client_secret\|authorization_code"; then
    echo "✅ No se detecta configuración OAuth 2.0"
else
    echo "❌ Se detecta configuración OAuth 2.0 - REMOVER"
fi

if ! grep -r "/light" src/ --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null; then
    echo "✅ No se usa endpoint /light"
else
    echo "❌ Se detecta uso de endpoint /light - CORREGIR"
fi

echo

# Verificar LoginComponent
echo "🔑 Verificando LoginComponent..."

if grep -q "onSubmit.*authService.login" src/app/features/auth/login.component.ts; then
    echo "✅ Formulario de login implementado"
else
    echo "❌ Formulario de login no implementado"
fi

if grep -q "MatSnackBar" src/app/features/auth/login.component.ts; then
    echo "✅ Manejo de mensajes implementado"
else
    echo "❌ Manejo de mensajes no implementado"
fi

echo

# Verificar AuthInterceptor
echo "🔧 Verificando AuthInterceptor..."

if grep -q "HTTP_INTERCEPTORS" src/app/app.config.ts; then
    echo "✅ AuthInterceptor registrado en app.config"
else
    echo "❌ AuthInterceptor no registrado"
fi

if grep -q "Authorization.*Bearer" src/app/core/interceptors/auth.interceptor.ts; then
    echo "✅ Headers de autorización implementados"
else
    echo "❌ Headers de autorización no implementados"
fi

echo

# Verificar ProcessMakerService
echo "⚙️ Verificando ProcessMakerService..."

if grep -q "getTodoCases\|getSentCases\|getCaseStats" src/app/core/services/processmaker.service.ts; then
    echo "✅ Métodos de casos implementados"
else
    echo "❌ Métodos de casos no implementados"
fi

if grep -q "buildApiUrl.*workspace" src/app/core/services/processmaker.service.ts; then
    echo "✅ Construcción de URLs con workspace"
else
    echo "❌ Construcción de URLs no implementada"
fi

echo

# Verificar DashboardComponent
echo "📊 Verificando DashboardComponent..."

if grep -q "expedientes.*ExpedienteType" src/app/features/dashboard/dashboard.component.ts; then
    echo "✅ Grid de expedientes implementado"
else
    echo "❌ Grid de expedientes no implementado"
fi

if grep -q "stats.*DashboardStats" src/app/features/dashboard/dashboard.component.ts; then
    echo "✅ Estadísticas implementadas"
else
    echo "❌ Estadísticas no implementadas"
fi

echo

# Verificar dependencias
echo "📦 Verificando dependencias..."

if [ -f "package.json" ]; then
    if grep -q "@angular/material" package.json; then
        echo "✅ Angular Material instalado"
    else
        echo "❌ Angular Material no instalado"
    fi
    
    if grep -q "@angular/cdk" package.json; then
        echo "✅ Angular CDK instalado"
    else
        echo "❌ Angular CDK no instalado"
    fi
else
    echo "❌ package.json no encontrado"
fi

echo

# Resumen final
echo "📋 RESUMEN DE VERIFICACIÓN"
echo "========================="

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ Todos los archivos necesarios están presentes"
else
    echo "❌ Archivos faltantes: ${#missing_files[@]}"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
fi

echo
echo "🚀 PRÓXIMOS PASOS:"
echo "1. Ejecutar 'npm install' para instalar dependencias"
echo "2. Configurar credenciales de test en environment"
echo "3. Ejecutar 'ng serve' para iniciar servidor de desarrollo"
echo "4. Probar login con credenciales válidas de ProcessMaker"
echo "5. Verificar logs en DevTools Console"
echo "6. Seguir guía de testing en TESTING_GUIDE.md"

echo
echo "📖 DOCUMENTACIÓN:"
echo "- README.md: Guía completa de instalación y uso"
echo "- TESTING_GUIDE.md: Guía de pruebas paso a paso"
echo "- /docs/: Documentación del contexto del proyecto"

echo
echo "⚠️ RECORDATORIOS:"
echo "- NO usar endpoint /light (no disponible en PM 3.4)"
echo "- Usar autenticación session-based, NO OAuth 2.0"
echo "- Configurar withCredentials: true para cookies de sesión"
echo "- Verificar que el workspace 'OsplyfC' esté disponible"

echo
echo "🎯 VERIFICACIÓN COMPLETADA"
echo "========================="