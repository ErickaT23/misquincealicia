# Reglas operativas del enlace `G50`

Este archivo documenta como funciona la invitacion grupal abierta para evitar romper el flujo en futuros ajustes.

## Objetivo

- Mantener un solo enlace compartido: `?id=G50`
- Permitir que cada persona escriba su nombre y confirme 1 lugar fijo
- Llevar contador de confirmaciones grupales en secuencia ascendente

## Comportamiento esperado

- **Portada (`G50`)**: mostrar `1 lugar especial para ti`
- **RSVP (`G50`)**:
  - pedir nombre siempre
  - cantidad de pases bloqueada en `1`
  - no bloquear por "ya confirmado" usando el ID base `G50`
- **IDs de confirmacion**:
  - crear IDs consecutivos: `G51`, `G52`, `G53`...
  - continuar desde el mayor ya existente

## Valores base actuales

- Invitado base `G50`:
  - `tipo: grupo`
  - `solicitaNombre: true`
  - `pases: 100`
  - `pasesDisponibles: 100` (se consume con cada "si")

## Archivos clave

- `script.js`
  - configuracion local de `G50`
  - texto especial de portada para `G50`
- `rsvp.html`
  - flujo de formulario para grupo abierto
  - pase fijo en 1 y captura de nombre
- `database.js`
  - guardado de confirmaciones grupales
  - generacion de ID consecutivo ascendente
- `admin.js`
  - actualizacion segura de `G50` (sin cambiar ID ni logica)

## Si se aumenta cupo en el futuro

1. Entrar a `admin.html?admin=TD-ADMIN-2026&eventId=alicia-2026`
2. Editar el invitado base `G50` (no filas `G50-...`)
3. Cambiar `pases` al nuevo total y guardar

Con el ajuste actual, al guardar `G50` tambien se alinea `pasesDisponibles` al mismo valor.
