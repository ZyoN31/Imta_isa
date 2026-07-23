USE `imta_db`;

-- Desactivar temporalmente la verificación de llaves foráneas para una inserción limpia
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas antes de poblar (Opcional)
TRUNCATE TABLE `comentarios`;
TRUNCATE TABLE `noticias`;
TRUNCATE TABLE `estudios`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `investigadores`;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 1. POBLAR TABLA: investigadores
-- ========================================================
INSERT INTO `investigadores` (`id`, `nivel_academico`, `area_investigacion`, `semblanza`, `foto`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Doctorado', 'Hidráulica Experimental', 'Especialista en modelos físicos de estructuras hidráulicas, canal de olas y dinámica de fluidos computacional con más de 15 años de experiencia académica e investigación aplicada.', '/storage/investigadores/dr_enzo_mendoza.jpg', NOW(), NOW(), NULL),
(2, 'Doctorado', 'Modelación Hidráulica', 'Investigadora dedicada al análisis de transitorios hidráulicos, redes de distribución de agua potable y sistemas de bombeo a gran escala.', '/storage/investigadores/dra_sofia_perez.jpg', NOW(), NOW(), NULL),
(3, 'Maestría', 'Ecohidráulica y Calidad del Agua', 'Enfocado en la calidad del agua en embalses, instrumentación hidráulica de precisión y evaluación del impacto ambiental en cuencas hidrográficas.', '/storage/investigadores/mbro_julian_quinones.jpg', NOW(), NOW(), NULL);

-- ========================================================
-- 2. POBLAR TABLA: users
-- ========================================================
-- Nota: Las contraseñas corresponden a un hash bcrypt formal (password simulado)
INSERT INTO `users` (`id`, `nombre`, `apellido_paterno`, `apellido_materno`, `email`, `email_verified_at`, `password`, `rol`, `investigador_id`, `foto`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'Admin IMTA', 'Laboratorio', 'Enzo Levi', 'admin@imta.gob.mx', NULL, '$2y$12$y6WRSAT9a2ygcfYCs6P2L.t9j4xVnv4Zi1Jn3mnUEsixqBJpsVDOm', 'administrador', NULL, NULL, NULL, '2026-07-23 03:27:28', '2026-07-23 03:27:28', NULL),
	(2, 'Sofia', 'Perez', 'Flores', 'sofiape@imta.gob.mx', NULL, '$2y$12$2ZV2DACFJP2JzZh6dcVxkOG6lt.TlrzwFvOUXk.u6cPFeSGaFN9eu', 'investigador', 1, NULL, NULL, '2026-07-23 03:34:28', '2026-07-23 03:46:55', '2026-07-23 03:46:55'),
	(3, 'Isabel', 'Rojas', 'Pastor', 'isabelrojaspas@gmail.com', NULL, '$2y$12$4cRGdOyEW0GU98oxPZa1Vesw.yV722zFWuF./DnYKyM377rzvaOcK', 'consultor', NULL, '/storage/usuarios/XSoI1QFuzWcyn8e70gQdulp8sE2Apxnv8MOUri6a.jpg', NULL, '2026-07-23 03:35:39', '2026-07-23 05:10:20', NULL),
	(4, 'Julian', 'Quiñones', 'Jimenez', 'julianqj22@imta.com', NULL, '$2y$12$419dUEP8R2qzgPQ3vdQ8cuaTKvVdnZI39Ba6Tg2XePUWrLY9nDHcq', 'investigador', 2, NULL, NULL, '2026-07-23 03:42:08', '2026-07-23 03:46:09', NULL),
	(5, 'Margarita', 'Alvarez', 'Mendez', 'margaritaaf@imta.com', NULL, '$2y$12$abRg7yWQuebzDBSAJex8FOj9UHi4FCKU9kgUzUWy/2or.b5VZUkLy', 'investigador', 3, NULL, NULL, '2026-07-23 03:45:03', '2026-07-23 05:04:55', '2026-07-23 05:04:55'),
	(6, 'Federico', 'Halaand', 'Leonel', 'federicoochoa@gmail.com', NULL, '$2y$12$MZ01EjFrZkqEPohP/3PBCOpj0S7sob47M4V7NTnHT028Nfk2efCr6', 'consultor', NULL, NULL, NULL, '2026-07-23 04:36:16', '2026-07-23 04:36:16', NULL),
	(7, 'Jacob', 'Keyes', NULL, 'jacobkeyes@zanthor.com', NULL, '$2y$12$JEdmKJ8p5rMHy0S0VL8Q3uDN5hInA4/Y1L4G5IsEIBlzbbDxHqtSS', 'consultor', NULL, '/storage/usuarios/nGy1O6Pyb40yA7wG5pdnjeGMTwtWtmahYteZWAam.jpg', NULL, '2026-07-23 04:41:14', '2026-07-23 04:43:30', NULL);

-- ========================================================
-- 3. POBLAR TABLA: noticias
-- ========================================================
INSERT INTO `noticias` (`id`, `titulo`, `contenido`, `fecha`, `foto`, `investigador_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Inauguración del Banco de Pruebas Hidráulicas de Alta Capacidad', 'El Instituto Mexicano de Tecnología del Agua da un paso adelante en innovación con la puesta en marcha de un banco de pruebas de vanguardia para la calibración de equipo hidráulico y medición de flujos turbulentos.', '2026-06-29', '/storage/noticias/banco_pruebas_imta.jpg', 1, NOW(), NOW(), NULL),
(2, 'Avanza la modernización de la infraestructura del edificio Enzo Levi', 'Se concluyeron las obras de remodelación y actualización tecnológica en las áreas del canal de olas y el laboratorio de instrumentación, optimizando los procesos de toma de datos experimental.', '2026-06-09', '/storage/noticias/edificio_enzo_levi.jpg', 2, NOW(), NOW(), NULL),
(3, 'Mantenimiento programado y cierre temporal de canal de pruebas', 'Informamos a la comunidad académica que los ensayos físicos en el canal principal estarán suspendidos temporalmente debido a trabajos de calibración y mantenimiento preventivo del sistema de bombeo.', '2026-07-04', '/storage/noticias/mantenimiento_canal.jpg', 1, NOW(), NOW(), NULL),
(4, 'Implementación de protocolo contra plagas y biocontaminantes', 'Como parte de las normas de conservación de calidad del agua y bioseguridad en los modelos físicos, se ejecutará el plan anual de desinfección en recirculadores y depósitos.', '2026-02-18', '/storage/noticias/control_biologico.jpg', 3, NOW(), NOW(), NULL),
(5, 'Conmemoración del Aniversario del Laboratorio Enzo Levi', 'Investigadores, personal académico y consultores celebran los aportes científicos y desarrollos de ingeniería hidráulica que consolidan a la institución a nivel internacional.', '2026-07-02', '/storage/noticias/aniversario_enzo_levi.jpg', 2, NOW(), NOW(), NULL);

-- ========================================================
-- 4. POBLAR TABLA: estudios
-- ========================================================
INSERT INTO `estudios` (`id`, `titulo`, `descripcion`, `categoria`, `foto`, `documento`, `investigador_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Evaluación Experimental de Estructuras Disipadoras de Energía', 'Análisis detallado en modelo físico tridimensional sobre la disipación de energía hidráulica en vertederos de demasías bajo condiciones extremas de avenida.', 'Hidráulica Experimental', '/storage/estudios/fotos/disipadores_2026.jpg', '/storage/estudios/documentos/informe_disipadores_2026.pdf', 1, NOW(), NOW(), NULL),
(2, 'Estudio Hidrodinámico de Vertederos en Cresta Ancha', 'Caracterización del coeficiente de descarga y perfiles de flujo sobre vertederos mediante técnicas fotogramétricas e instrumentación Doppler.', 'Hidráulica Experimental', '/storage/estudios/fotos/vertederos_cresta.jpg', '/storage/estudios/documentos/estudio_vertederos.pdf', 2, NOW(), NOW(), NULL),
(3, 'Modelación de Arrastre de Sedimentos en Canales Abiertos', 'Investigación sobre el comportamiento del transporte de sedimentos de fondo y en suspensión en curvas de ríos regulados mediante modelos reducidos.', 'Ecohidráulica', '/storage/estudios/fotos/sedimentos_canales.jpg', '/storage/estudios/documentos/reporte_sedimentos.pdf', 3, NOW(), NOW(), NULL);