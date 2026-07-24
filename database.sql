USE `imta_db`;

-- Desactivar temporalmente la verificación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Limpieza de tablas
TRUNCATE TABLE `comentarios`;
TRUNCATE TABLE `noticias`;
TRUNCATE TABLE `estudios`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `investigadores`;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 1. POBLAR TABLA: investigadores (5 Investigadores)
-- ========================================================
INSERT INTO `investigadores` (`id`, `nivel_academico`, `area_investigacion`, `semblanza`, `foto`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Doctorado', 'Hidráulica Experimental', 'Especialista en modelos físicos de estructuras hidráulicas, canal de olas y dinámica de fluidos computacional con más de 15 años de experiencia académica e investigación aplicada.', '/storage/investigadores/dr_enzo_mendoza.jpg', '2026-07-23 03:00:00', '2026-07-23 03:00:00', NULL),
(2, 'Doctorado', 'Modelación Hidráulica', 'Investigadora dedicada al análisis de transitorios hidráulicos, redes de distribución de agua potable y sistemas de bombeo a gran escala.', '/storage/investigadores/dra_sofia_perez.jpg', '2026-07-23 03:00:00', '2026-07-23 03:00:00', NULL),
(3, 'Maestría', 'Ecohidráulica y Calidad del Agua', 'Enfocado en la calidad del agua en embalses, instrumentación hidráulica de precisión y evaluación del impacto ambiental en cuencas hidrográficas.', '/storage/investigadores/mbro_julian_quinones.jpg', '2026-07-23 03:00:00', '2026-07-23 03:00:00', NULL),
(4, 'Doctorado', 'Hidrología de Cuencas y Transitorios', 'Especialista en el desarrollo de algoritmos numéricos para flujo no permanente y gestión integral de riesgos por inundaciones continentales.', '/storage/investigadores/dra_margarita_alvarez.jpg', '2026-07-23 03:00:00', '2026-07-23 03:00:00', NULL),
(5, 'Maestría', 'Instrumentación y Telemática Hidráulica', 'Ingeniero e investigador enfocado en la integración de sensores de velocidad Doppler (ADV), tomografía eléctrica y automatización de compuertas.', '/storage/investigadores/mbro_rodrigo_herrera.jpg', '2026-07-23 03:00:00', '2026-07-23 03:00:00', NULL);

-- ========================================================
-- 2. POBLAR TABLA: users
-- ========================================================
INSERT INTO `users` (`id`, `nombre`, `apellido_paterno`, `apellido_materno`, `email`, `email_verified_at`, `password`, `rol`, `investigador_id`, `foto`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Admin IMTA', 'Laboratorio', 'Enzo Levi', 'admin@imta.gob.mx', NULL, '$2y$12$y6WRSAT9a2ygcfYCs6P2L.t9j4xVnv4Zi1Jn3mnUEsixqBJpsVDOm', 'administrador', NULL, NULL, NULL, '2026-07-23 03:27:28', '2026-07-23 03:27:28', NULL),
(2, 'Sofia', 'Perez', 'Flores', 'sofiape@imta.gob.mx', NULL, '$2y$12$2ZV2DACFJP2JzZh6dcVxkOG6lt.TlrzwFvOUXk.u6cPFeSGaFN9eu', 'investigador', 1, NULL, NULL, '2026-07-23 03:34:28', '2026-07-23 03:46:55', '2026-07-23 03:46:55'),
(3, 'Isabel', 'Rojas', 'Pastor', 'isabelrojaspas@gmail.com', NULL, '$2y$12$4cRGdOyEW0GU98oxPZa1Vesw.yV722zFWuF./DnYKyM377rzvaOcK', 'consultor', NULL, '/storage/usuarios/XSoI1QFuzWcyn8e70gQdulp8sE2Apxnv8MOUri6a.jpg', NULL, '2026-07-23 03:35:39', '2026-07-23 05:10:20', NULL),
(4, 'Julian', 'Quiñones', 'Jimenez', 'julianqj22@imta.com', NULL, '$2y$12$419dUEP8R2qzgPQ3vdQ8cuaTKvVdnZI39Ba6Tg2XePUWrLY9nDHcq', 'investigador', 2, NULL, NULL, '2026-07-23 03:42:08', '2026-07-23 03:46:09', NULL),
(5, 'Margarita', 'Alvarez', 'Mendez', 'margaritaaf@imta.com', NULL, '$2y$12$abRg7yWQuebzDBSAJex8FOj9UHi4FCKU9kgUzUWy/2or.b5VZUkLy', 'investigador', 3, NULL, NULL, '2026-07-23 03:45:03', '2026-07-23 05:04:55', '2026-07-23 05:04:55'),
(6, 'Federico', 'Halaand', 'Leonel', 'federicoochoa@gmail.com', NULL, '$2y$12$MZ01EJFrZkqEPohP/3PBCOpj0S7sob47M4V7NTnHT028Nfk2efCr6', 'consultor', NULL, NULL, NULL, '2026-07-23 04:36:16', '2026-07-23 04:36:16', NULL),
(7, 'Jacob', 'Keyes', NULL, 'jacobkeyes@zanthor.com', NULL, '$2y$12$JEdmKJ8p5rMHy0S0VL8Q3uDN5hInA4/Y1L4G5IsEIBlzbbDxHqtSS', 'consultor', NULL, '/storage/usuarios/nGy1O6Pyb40yA7wG5pdnjeGMTwtWtmahYteZWAam.jpg', NULL, '2026-07-23 04:41:14', '2026-07-23 04:43:30', NULL);

-- ========================================================
-- 3. POBLAR TABLA: noticias (12 Noticias detalladas)
-- ========================================================
INSERT INTO `noticias` (`id`, `titulo`, `contenido`, `fecha`, `foto`, `investigador_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Inauguración del Banco de Pruebas Hidráulicas de Alta Capacidad', 'El Instituto Mexicano de Tecnología del Agua da un paso adelante en innovación con la puesta en marcha de un banco de pruebas de vanguardia para la calibración de equipo hidráulico y medición de flujos turbulentos.', '2026-06-29', '/storage/noticias/banco_pruebas_imta.jpg', 1, NOW(), NOW(), NULL),
(2, 'Avanza la modernización de la infraestructura del edificio Enzo Levi', 'Se concluyeron las obras de remodelación y actualización tecnológica en las áreas del canal de olas y el laboratorio de instrumentación, optimizando los procesos de toma de datos experimental.', '2026-06-09', '/storage/noticias/edificio_enzo_levi.jpg', 2, NOW(), NOW(), NULL),
(3, 'Mantenimiento programado y cierre temporal de canal de pruebas', 'Informamos a la comunidad académica que los ensayos físicos en el canal principal estarán suspendidos temporalmente debido a trabajos de calibración y mantenimiento preventivo del sistema de bombeo.', '2026-07-04', '/storage/noticias/mantenimiento_canal.jpg', 1, NOW(), NOW(), NULL),
(4, 'Implementación de protocolo contra plagas y biocontaminantes', 'Como parte de las normas de conservación de calidad del agua y bioseguridad en los modelos físicos, se ejecutará el plan anual de desinfección en recirculadores y depósitos.', '2026-02-18', '/storage/noticias/control_biologico.jpg', 3, NOW(), NOW(), NULL),
(5, 'Conmemoración del Aniversario del Laboratorio Enzo Levi', 'Investigadores, personal académico y consultores celebran los aportes científicos y desarrollos de ingeniería hidráulica que consolidan a la institución a nivel internacional.', '2026-07-02', '/storage/noticias/aniversario_enzo_levi.jpg', 2, NOW(), NOW(), NULL),
(6, 'Convenio Internacional para la Gestión Sustentable de Cuencas', 'Se firmó un acuerdo de colaboración con la red latinoamericana de laboratorios de hidráulica para compartir modelos computacionales y transferir tecnología en medición de sedimentos.', '2026-05-14', '/storage/noticias/convenio_internacional.jpg', 4, NOW(), NOW(), NULL),
(7, 'Adquisición de Sensores PIV (Velocimetría por Imágenes de Partículas)', 'Llegó el nuevo equipo óptico de alta velocidad que permitirá visualizar y cuantificar patrones de flujo bidimensionales en zonas de vórtices dentro de modelos a escala reducida.', '2026-04-20', '/storage/noticias/sensores_piv.jpg', 5, NOW(), NOW(), NULL),
(8, 'Taller de Capacitación en Análisis de Transitorios Hidráulicos', 'Inició el curso teórico-práctico impartido por especialistas de la coordinación de modelación, dirigido a ingenieros del sector público y estudiantes de posgrado.', '2026-03-11', '/storage/noticias/taller_transitorios.jpg', 2, NOW(), NOW(), NULL),
(9, 'Simposio Nacional sobre Infraestructura Hidráulica Ante el Cambio Climático', 'Investigadores del IMTA presentaron ponencias sobre el rediseño de vertederos ante crecidas extremas asociadas a eventos meteorológicos atípicos.', '2026-01-28', '/storage/noticias/simposio_infraestructura.jpg', 1, NOW(), NOW(), NULL),
(10, 'Publicación del Manual de Operación de Canales de Olas', 'Está disponible en la biblioteca digital del IMTA la guía técnica para la parametrización de oleaje regular e irregular en el tanque experimental del Laboratorio Enzo Levi.', '2025-11-15', '/storage/noticias/manual_canal_olas.jpg', 3, NOW(), NOW(), NULL),
(11, 'Evaluación de Bioconstrucciones para Protección de Margenes de Ríos', 'Finalizó la primera etapa del proyecto experimental que estudia la efectividad de los mantos de vegetación en la reducción de la erosión en curvas de cauces.', '2025-10-05', '/storage/noticias/proteccion_cauces.jpg', 4, NOW(), NOW(), NULL),
(12, 'Pruebas de Calibración en Microturbinas para Generación Limpia', 'Se completaron los ensayos en el canal secundario para medir la eficiencia hidrodinámica de turbinas horizontales en corrientes de baja velocidad.', '2025-09-18', '/storage/noticias/microturbinas_hidraulicas.jpg', 5, NOW(), NOW(), NULL);

-- ========================================================
-- 4. POBLAR TABLA: estudios (10 Estudios técnicos exhaustivos)
-- ========================================================
INSERT INTO `estudios` (`id`, `titulo`, `descripcion`, `categoria`, `foto`, `documento`, `investigador_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Evaluación Experimental de Estructuras Disipadoras de Energía', 'Análisis detallado en modelo físico tridimensional sobre la disipación de energía hidráulica en vertederos de demasías bajo condiciones extremas de avenida.', 'Hidráulica Experimental', '/storage/estudios/fotos/disipadores_2026.jpg', '/storage/estudios/documentos/informe_disipadores_2026.pdf', 1, NOW(), NOW(), NULL),
(2, 'Estudio Hidrodinámico de Vertederos en Cresta Ancha', 'Caracterización del coeficiente de descarga y perfiles de flujo sobre vertederos mediante técnicas fotogramétricas e instrumentación Doppler.', 'Hidráulica Experimental', '/storage/estudios/fotos/vertederos_cresta.jpg', '/storage/estudios/documentos/estudio_vertederos.pdf', 2, NOW(), NOW(), NULL),
(3, 'Modelación de Arrastre de Sedimentos en Canales Abiertos', 'Investigación sobre el comportamiento del transporte de sedimentos de fondo y en suspensión en curvas de ríos regulados mediante modelos reducidos.', 'Ecohidráulica', '/storage/estudios/fotos/sedimentos_canales.jpg', '/storage/estudios/documentos/reporte_sedimentos.pdf', 3, NOW(), NOW(), NULL),
(4, 'Análisis de Golpe de Ariete en Redes de Impulsión a Gran Escala', 'Simulación y validación experimental de presiones pico generadas por el paro repentino de bombas en conducciones de agua potable.', 'Modelación Hidráulica', '/storage/estudios/fotos/golpe_ariete.jpg', '/storage/estudios/documentos/analisis_golpe_ariete.pdf', 2, NOW(), NOW(), NULL),
(5, 'Optimización Hidrodinámica de Obras de Toma en Embalses', 'Determinación de la geometría óptima para evitar la formación de vórtices con aireación en la entrada de túneles de conducción hidroeconómica.', 'Hidráulica Experimental', '/storage/estudios/fotos/obras_toma.jpg', '/storage/estudios/documentos/optimizacion_obras_toma.pdf', 1, NOW(), NOW(), NULL),
(6, 'Evaluación del Impacto de Estructuras Bioclimáticas en Canales Abiertos', 'Medición del comportamiento hidráulico y la retención de contaminantes orgánicos al incorporar macrófitas en el lecho de canales de drenaje.', 'Ecohidráulica y Calidad del Agua', '/storage/estudios/fotos/bioclimaticas_canales.jpg', '/storage/estudios/documentos/impacto_bioclimaticas.pdf', 3, NOW(), NOW(), NULL),
(7, 'Modelado Numérico 3D del Flujo alrededor de Pilas de Puentes', 'Simulación CFD para evaluar la profundidad de socavación local y las fuerzas hidrodinámicas sobre apoyos circulares y elípticos.', 'Modelación Hidráulica', '/storage/estudios/fotos/socavacion_pilas.jpg', '/storage/estudios/documentos/modelado_socavacion.pdf', 4, NOW(), NOW(), NULL),
(8, 'Calibración de Sensores Ultrasónicos para Canales Parshall', 'Desarrollo de curvas de descarga y estimación de patrones de incertidumbre en instrumentos de medición continua de caudal instalados en laboratorio.', 'Instrumentación y Telemática', '/storage/estudios/fotos/parshall_sensores.jpg', '/storage/estudios/documentos/calibracion_parshall.pdf', 5, NOW(), NOW(), NULL),
(9, 'Análisis de Difusión de Térmica en Descargas de Centrales Eléctricas', 'Estudio físico sobre el comportamiento de la pluma térmicamente estratificada en cuerpos de agua receptores bajo diferentes regímenes de marea.', 'Ecohidráulica', '/storage/estudios/fotos/difusion_termica.jpg', '/storage/estudios/documentos/difusion_termica_reporte.pdf', 3, NOW(), NOW(), NULL),
(10, 'Amortiguación de Olas mediante Barreras Sumergidas Porosas', 'Medición de coeficientes de transmisión y reflexión de oleaje al interactuar con escolleras permeables en el tanque de olas del laboratorio.', 'Hidráulica Experimental', '/storage/estudios/fotos/barreras_porosas.jpg', '/storage/estudios/documentos/barreras_porosas_estudio.pdf', 1, NOW(), NOW(), NULL);

-- ========================================================
-- 5. POBLAR TABLA: comentarios (Muestra representativa corregida)
-- ========================================================
INSERT INTO `comentarios` (`id`, `contenido`, `fecha`, `user_id`, `noticia_id`, `estudio_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Excelente iniciativa. Los datos de calibración del banco de pruebas serán de gran ayuda para los proyectos de maestría.', '2026-07-23', 3, 1, NULL, NOW(), NOW(), NULL),
(2, '¿Cuándo se reanudarán las pruebas de campo en el canal principal de olas?', '2026-07-23', 6, 3, NULL, NOW(), NOW(), NULL),
(3, 'Los resultados del gráfico de socavación en el estudio 7 coinciden con nuestras simulaciones en software comercial.', '2026-07-23', 7, NULL, 7, NOW(), NOW(), NULL),
(4, 'Un avance fundamental para la seguridad hidráulica de la infraestructura nacional.', '2026-07-23', 3, NULL, 1, NOW(), NOW(), NULL);