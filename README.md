# Melion Barber - Sistema de Gestión de Barbería

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

Melion Barber es el nombre de esta exclusiva barbería, y este sistema es una solución integral diseñada para modernizar la gestión de sus turnos y la interacción con sus clientes. El sistema ofrece una experiencia de usuario premium, permitiendo a los clientes de Melion Barber reservar turnos de forma visual y al barbero gestionar su agenda mediante un tablero Kanban dinámico.

## 🚀 Características Principales

### Para Clientes (Portal Público)
- **Selección Visual de Servicios**: Interfaz moderna con tarjetas e imágenes representativas para cada servicio.
- **Calendario Inteligente**: Selector de fecha personalizado con vista lateral de horarios disponibles.
- **Validación Automática**: Formateo dinámico de números de teléfono (`+XX XX-XXXXX-XXXX`) y control de disponibilidad en tiempo real.
- **Confirmación Inmediata**: Proceso de reserva en 3 simples pasos.

### Para Barberos (Dashboard Privado)
- **Tablero Kanban**: Gestión de turnos mediante arrastrar y soltar (Drag & Drop) para organizar el flujo de trabajo.
- **Gestión de Estados**: Codificación por colores para estados (Pendiente, Confirmado, Completado, Cancelado).
- **Configuración de Disponibilidad**: Panel para activar/desactivar días de la semana y definir rangos horarios de atención.
- **Edición Manual**: Capacidad de modificar horarios de turnos existentes mediante una interfaz intuitiva.
- **Seguridad**: Acceso protegido mediante autenticación JWT.

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Estilos y diseño responsivo)
- **Lucide React** (Iconografía)
- **@dnd-kit** (Sistema de Drag & Drop)
- **Axios** (Comunicación con API)

### Backend
- **FastAPI** (Framework de alto rendimiento)
- **SQLAlchemy** (ORM)
- **SQLite** (Base de datos relacional)
- **Pydantic** (Validación de datos)
- **Python 3.9+**

## 📦 Instalación y Configuración

### Requisitos Previos
- Python 3.9 o superior
- Node.js 18 o superior
- npm o yarn

### Configuración del Backend
1. Navega al directorio backend:
   ```bash
   cd backend
   ```
2. Crea y activa un entorno virtual:
   ```bash
   python -m venv env
   # En Windows:
   .\env\Scripts\activate
   # En Linux/macOS:
   source env/bin/activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Inicializa la base de datos y carga los datos iniciales:
   ```bash
   python update_db.py
   python seed.py
   ```

### Configuración del Frontend
1. Navega al directorio frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

## 🏃‍♂️ Cómo Ejecutar el Proyecto

Para que el sistema funcione correctamente, debes iniciar tanto el backend como el frontend.

1. **Iniciar Backend**:
   ```bash
   cd backend
   .\env\Scripts\activate
   uvicorn app.main:app --reload
   ```
   El API estará disponible en `http://localhost:8000`.

2. **Iniciar Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

## 👤 Credenciales de Administrador
Para acceder al dashboard de barbería:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---
Desarrollado con ❤️ para Melion Barber.
