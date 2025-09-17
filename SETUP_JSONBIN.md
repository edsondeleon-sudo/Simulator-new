# Configuración de JSONBin.io para Almacenamiento Compartido

## Paso 1: Crear cuenta en JSONBin.io

1. Ve a [jsonbin.io](https://jsonbin.io)
2. Haz clic en "Sign Up" 
3. Regístrate con email o GitHub
4. Confirma tu cuenta

## Paso 2: Crear un nuevo Bin

1. Una vez logueado, haz clic en "Create Bin"
2. En el contenido, pega esto:
```json
{
  "history": [],
  "penalties": [],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```
3. Haz clic en "Create"
4. **Copia el Bin ID** (algo como: `507f1f77bcf86cd799439011`)

## Paso 3: Obtener API Key

1. Ve a tu perfil (esquina superior derecha)
2. Haz clic en "API Keys"
3. Haz clic en "Create API Key"
4. Dale un nombre como "F1 Simulator"
5. **Copia la API Key** (algo como: `$2a$10$abc123...`)

## Paso 4: Configurar el código

1. Abre `script.js`
2. Busca estas líneas:
```javascript
this.jsonBinId = 'YOUR_BIN_ID_HERE';
this.jsonBinApiKey = 'YOUR_API_KEY_HERE';
```
3. Reemplaza con tus valores reales:
```javascript
this.jsonBinId = '507f1f77bcf86cd799439011'; // Tu Bin ID
this.jsonBinApiKey = '$2a$10$abc123...'; // Tu API Key
```

## Paso 5: Probar

1. Guarda el archivo
2. Abre la página en tu navegador
3. Registra un tiempo
4. Abre la misma página en otra computadora
5. ¡Deberías ver el tiempo registrado!

## Límites gratuitos de JSONBin.io

- **10,000 requests/mes** (más que suficiente para tu simulador)
- **1MB de almacenamiento** (perfecto para historial de tiempos)
- **Sin límite de bins**

## Alternativas si necesitas más

Si JSONBin.io no es suficiente, puedes usar:
- **Firebase** (Google) - Más robusto
- **Supabase** - Open source
- **PlanetScale** - Base de datos MySQL

## Seguridad

- Tu API Key es privada, no la compartas
- Los datos son públicos por defecto (perfecto para tu caso)
- Puedes hacer el bin privado si quieres
