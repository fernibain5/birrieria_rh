# Sistema de Días Festivos - Calendario

Este sistema permite manejar automáticamente los días festivos oficiales de México en el calendario, junto con eventos personalizados.

## 🎄 Días Festivos Incluidos

El sistema incluye los siguientes días festivos oficiales de México:

1. **1 de enero**: Año Nuevo (fecha fija)
2. **Primer lunes de febrero**: Aniversario de la Constitución
3. **Tercer lunes de marzo**: Natalicio de Benito Juárez
4. **1 de mayo**: Día del Trabajo (fecha fija)
5. **16 de septiembre**: Día de la Independencia (fecha fija)
6. **Tercer lunes de noviembre**: Aniversario de la Revolución
7. **25 de diciembre**: Navidad (fecha fija)

## 🛠️ Cómo Funciona

### Automatización

- Cuando un administrador visita el calendario, el sistema verifica automáticamente si existen días festivos para el año actual
- Si no existen, los agrega automáticamente a Firestore
- Los días festivos se calculan dinámicamente según las reglas específicas (fechas fijas vs. días móviles)

### Agregar Días Festivos Manualmente

1. Como administrador, visita la página del calendario
2. Si no hay días festivos para el año que estás viendo, aparecerá un botón verde "Agregar Días Festivos [AÑO]"
3. Haz clic en el botón y confirma para agregar todos los días festivos del año
4. Los días festivos se añadirán automáticamente con la información correcta

### Distinción Visual

- **Días Festivos**: Aparecen con un borde izquierdo grueso y texto en negrita
- **Eventos Personalizados**: Aparecen con el estilo normal
- Una leyenda en la parte superior del calendario muestra la diferencia
- Los días festivos son de solo lectura (no se pueden editar o eliminar)

## 📝 Estructura de Datos

### Event Type (Tipo de Evento)

```typescript
interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  color?: string;
  type?: "holiday" | "custom"; // Distingue entre festivos y personalizados
  year?: number; // Año al que pertenece el evento
  createdAt?: Date;
  createdBy?: string; // ID del usuario que creó el evento
}
```

### Almacenamiento en Firestore

- **Colección**: `events`
- **Campos adicionales**:
  - `type`: 'holiday' para días festivos, 'custom' para eventos personalizados
  - `year`: Año del evento para consultas eficientes
  - `createdBy`: Solo para eventos personalizados

## 🔧 Archivos del Sistema

### Servicios

- `src/services/eventService.ts`: Maneja todas las operaciones CRUD con Firestore
- `src/utils/holidayGenerator.ts`: Genera los días festivos para cualquier año

### Componentes

- `src/pages/CalendarPage.tsx`: Página principal del calendario con integración de festivos
- `src/components/Calendar/EventModal.tsx`: Modal para ver/editar eventos (festivos son solo lectura)

### Scripts

- `scripts/setup-holidays.js`: Script para agregar festivos masivamente (requiere autenticación)

## 🎯 Casos de Uso

### Para Administradores

1. **Ver calendario completo**: Festivos + eventos personalizados
2. **Agregar eventos personalizados**: Reuniones, recordatorios, etc.
3. **Gestionar días festivos**: Agregar automáticamente para nuevos años
4. **Solo lectura en festivos**: Los festivos no se pueden modificar para mantener consistencia

### Para Usuarios Regulares

1. **Ver calendario**: Solo lectura de todos los eventos
2. **Distinguir tipos**: Ver claramente qué son festivos vs. eventos personalizados
3. **Información completa**: Acceder a descripciones y detalles de todos los eventos

## 🚀 Configuración Inicial

### 1. Agregar Días Festivos

```bash
# Opción 1: Usar la interfaz web (recomendado)
1. Inicia sesión como administrador
2. Ve al calendario
3. Haz clic en "Agregar Días Festivos [AÑO]" si aparece

# Opción 2: Script manual (requiere configuración de autenticación)
node scripts/setup-holidays.js 2025
```

### 2. Reglas de Firestore

Asegúrate de que las reglas de Firestore permitan:

- Lectura de eventos para usuarios autenticados
- Escritura de eventos solo para administradores

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

## 🔄 Flujo de Datos

1. **Carga inicial**: Se cargan todos los eventos desde Firestore
2. **Verificación automática**: Se verifica si existen festivos para el año actual
3. **Generación automática**: Si no existen y el usuario es admin, se generan automáticamente
4. **Actualización en tiempo real**: Los nuevos eventos se reflejan inmediatamente
5. **Persistencia**: Todos los datos se guardan en Firestore

## 🎨 Personalización

### Colores de Días Festivos

Los colores se asignan automáticamente según el tipo de festivo:

- Año Nuevo / Navidad: Rojo
- Constitución: Azul
- Benito Juárez / Independencia: Verde
- Día del Trabajo: Amarillo
- Revolución: Morado

### Agregar Nuevos Festivos

Para agregar nuevos días festivos, modifica `src/utils/holidayGenerator.ts`:

```typescript
// Agregar nuevo festivo
holidays.push({
  title: "Nuevo Festivo",
  description: "Descripción del nuevo festivo",
  date: new Date(year, month, day), // 0-indexed month
  color: "bg-blue-100 text-blue-800",
  type: "holiday",
  year: year,
  createdAt: new Date(),
});
```

## 🐛 Solución de Problemas

### Los festivos no aparecen

1. Verifica que estés autenticado como administrador
2. Comprueba la consola del navegador por errores
3. Verifica las reglas de Firestore
4. Intenta usar el botón "Agregar Días Festivos" manualmente

### Error de permisos

1. Asegúrate de que las reglas de Firestore estén configuradas correctamente
2. Verifica que tu usuario tenga el rol 'admin' en Firestore
3. Comprueba la configuración de Firebase

### Fechas incorrectas

1. Verifica la lógica de cálculo en `holidayGenerator.ts`
2. Los meses en JavaScript son 0-indexed (0 = Enero, 11 = Diciembre)
3. Las fechas móviles se calculan automáticamente según el año

## 📱 Responsive y UX

- El calendario es completamente responsive
- Los festivos tienen indicadores visuales claros
- Tooltips muestran información adicional
- Confirmaciones antes de acciones importantes
- Mensajes de estado durante operaciones asíncronas
