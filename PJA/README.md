# Plataforma Judicial Administrativa · Frontend

Frontend moderno para el sistema de control de asistencia del Poder Judicial del Estado de Colima. Está construido con React + TypeScript sobre Vite y un design system derivado de la identidad visual de [stjcolima.gob.mx](https://stjcolima.gob.mx).

## Stack principal

- **React 19 + React Router v6**
- **Mantine UI 7** para layout, componentes y theming
- **Mantine DataTable, Dates, Dropzone** para tablas, date pickers y drag & drop
- **Framer Motion** para animaciones suaves
- **SweetAlert2** para alertas/confirmaciones
- **Zustand + Axios** para estado de autenticación y consumo de API

## Estructura de carpetas

```
src/
  api/                # Clientes HTTP (axiosClient, employees, auth, etc.)
  components/
    common/           # DataTable, Modal, File helpers, etc.
    forms/            # Formularios reutilizables (EmployeeForm...)
    navigation/       # Sidebar, items de menú
    routing/          # ProtectedRoute y wrappers de navegación
  hooks/              # Hooks personalizados (useAuth, useEmployeeForm...)
  layouts/            # AuthLayout, DashboardLayout
  pages/              # Vistas (auth, dashboard, employees, etc.)
  router/             # Definición de rutas
  store/              # Estados globales con Zustand
  theme/              # Paleta y configuración del design system
  utils/              # Helpers (alerts SweetAlert2, formateadores...)
```

## Temas y diseño

El archivo `src/theme/index.ts` centraliza colores, tipografía, breakpoints y overrides de componentes. Los colores principales (`colimaBlue`, `colimaGold`, `colimaTeal`) se inspiran en el sitio institucional.

## Scripts disponibles

| Script            | Descripción                                          |
| ----------------- | ---------------------------------------------------- |
| `npm install`     | Instala dependencias                                 |
| `npm run dev`     | Levanta Vite + React en modo desarrollo              |
| `npm run build`   | Compila TypeScript y genera artefactos de producción |
| `npm run preview` | Sirve el build para pruebas locales                  |

## Puesta en marcha

1. **Instalar dependencias**
   ```bash
   npm install
   ```
2. **Variables de entorno**
   - Duplica `.env.example` ⇒ `.env` y actualiza `VITE_API_URL` con la URL real del backend.
3. **Modo desarrollo**
   ```bash
   npm run dev
   ```
   Abre `http://localhost:5173`.
4. **Build para producción**
   ```bash
   npm run build
   npm run preview   # Opcional, para validar el resultado
   ```

## Integración con el backend

- El store `authStore` ya consume los endpoints `/auth/login`, `/auth/logout` y `/auth/refresh` definidos en `src/api/auth.ts`.
- El nuevo `EmployeeForm` envía archivos y metadatos a `/employees` usando `multipart/form-data` cuando hay adjuntos.
- Añade en `src/api/*` las rutas que necesites y reutiliza los hooks (`useAuth`, `useEmployeeForm`) y componentes (tablas, formularios, dropzones) para acelerar nuevos módulos.

## Buenas prácticas incluidas

- Theming consistente vía Mantine Provider.
- Componentes accesibles (botones, inputs, tablas, modales) listos para producción.
- Animaciones suaves y feedback visual (loaders, alerts, tooltips).
- Utilidades para confirmaciones con SweetAlert2 y notificaciones.
- Ejemplos de tablas con paginación/filtros, formularios con date picker y drag & drop.
