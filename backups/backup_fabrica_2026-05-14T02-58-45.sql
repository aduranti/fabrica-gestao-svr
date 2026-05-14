/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: categorias_mp
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categorias_mp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: formulas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `formulas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `categoria` enum('sabonete', 'tintura', 'pomada') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rendimento_quantidade` decimal(10, 3) NOT NULL,
  `rendimento_unidade_id` int NOT NULL,
  `versao` int DEFAULT '1',
  `status` enum('rascunho', 'ativa', 'inativa') COLLATE utf8mb4_unicode_ci DEFAULT 'rascunho',
  `instrucoes_producao` text COLLATE utf8mb4_unicode_ci,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `usuario_criacao_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `rendimento_unidade_id` (`rendimento_unidade_id`),
  CONSTRAINT `formulas_ibfk_1` FOREIGN KEY (`rendimento_unidade_id`) REFERENCES `unidades_medida` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: formulas_ingredientes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `formulas_ingredientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `formula_id` int NOT NULL,
  `materia_prima_id` int NOT NULL,
  `quantidade` decimal(12, 4) NOT NULL,
  `unidade_medida_id` int NOT NULL,
  `percentual` decimal(6, 3) DEFAULT NULL,
  `fase` enum('aquosa', 'oleosa', 'esfriamento', 'final', 'unica') COLLATE utf8mb4_unicode_ci DEFAULT 'unica',
  `ordem` int DEFAULT '0',
  `observacoes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `formula_id` (`formula_id`),
  KEY `materia_prima_id` (`materia_prima_id`),
  KEY `unidade_medida_id` (`unidade_medida_id`),
  CONSTRAINT `formulas_ingredientes_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `formulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `formulas_ingredientes_ibfk_2` FOREIGN KEY (`materia_prima_id`) REFERENCES `materias_primas` (`id`),
  CONSTRAINT `formulas_ingredientes_ibfk_3` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 39 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: formulas_versoes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `formulas_versoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `formula_id` int NOT NULL,
  `versao` int NOT NULL,
  `snapshot_json` json NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `data_versao` datetime DEFAULT NULL,
  `motivo_alteracao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `formula_id` (`formula_id`),
  CONSTRAINT `formulas_versoes_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `formulas` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: fornecedores
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `fornecedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `razao_social` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnpj_cpf` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnpj_cpf` (`cnpj_cpf`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: lotes_produtos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `lotes_produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produto_id` int NOT NULL,
  `ordem_producao_id` int DEFAULT NULL,
  `numero_lote` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(12, 3) NOT NULL,
  `data_fabricacao` date NOT NULL,
  `data_validade` date DEFAULT NULL,
  `custo_unitario` decimal(10, 4) DEFAULT NULL,
  `status` enum('disponivel', 'vendido', 'vencido', 'descartado') COLLATE utf8mb4_unicode_ci DEFAULT 'disponivel',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `produto_id` (`produto_id`),
  KEY `ordem_producao_id` (`ordem_producao_id`),
  CONSTRAINT `lotes_produtos_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  CONSTRAINT `lotes_produtos_ibfk_2` FOREIGN KEY (`ordem_producao_id`) REFERENCES `ordens_producao` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: materias_primas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `materias_primas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `categoria_id` int NOT NULL,
  `unidade_medida_id` int NOT NULL,
  `estoque_atual` decimal(12, 3) DEFAULT '0.000',
  `estoque_minimo` decimal(12, 3) DEFAULT '0.000',
  `estoque_maximo` decimal(12, 3) DEFAULT '0.000',
  `custo_medio` decimal(10, 4) DEFAULT '0.0000',
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `categoria_id` (`categoria_id`),
  KEY `unidade_medida_id` (`unidade_medida_id`),
  CONSTRAINT `materias_primas_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_mp` (`id`),
  CONSTRAINT `materias_primas_ibfk_2` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 33 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: materias_primas_fornecedores
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `materias_primas_fornecedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materia_prima_id` int DEFAULT NULL,
  `fornecedor_id` int DEFAULT NULL,
  `preco_unitario` decimal(10, 4) DEFAULT NULL,
  `prazo_entrega_dias` int DEFAULT NULL,
  `preferencial` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `materia_prima_id` (`materia_prima_id`),
  KEY `fornecedor_id` (`fornecedor_id`),
  CONSTRAINT `materias_primas_fornecedores_ibfk_1` FOREIGN KEY (`materia_prima_id`) REFERENCES `materias_primas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `materias_primas_fornecedores_ibfk_2` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: movimentacoes_estoque
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `movimentacoes_estoque` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materia_prima_id` int NOT NULL,
  `tipo` enum('entrada', 'saida', 'ajuste', 'perda') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(12, 3) NOT NULL,
  `custo_unitario` decimal(10, 4) DEFAULT NULL,
  `saldo_anterior` decimal(12, 3) DEFAULT NULL,
  `saldo_posterior` decimal(12, 3) DEFAULT NULL,
  `origem_tipo` enum('compra', 'producao', 'ajuste') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `origem_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `data_movimentacao` datetime DEFAULT NULL,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `materia_prima_id` (`materia_prima_id`),
  CONSTRAINT `movimentacoes_estoque_ibfk_1` FOREIGN KEY (`materia_prima_id`) REFERENCES `materias_primas` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 66 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: ordens_producao
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ordens_producao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formula_id` int NOT NULL,
  `produto_id` int DEFAULT NULL,
  `usuario_responsavel_id` int NOT NULL,
  `quantidade_planejada` decimal(10, 3) NOT NULL,
  `quantidade_produzida` decimal(10, 3) DEFAULT '0.000',
  `status` enum(
  'planejada',
  'em_producao',
  'concluida',
  'cancelada'
  ) COLLATE utf8mb4_unicode_ci DEFAULT 'planejada',
  `data_planejada` date NOT NULL,
  `data_inicio` datetime DEFAULT NULL,
  `data_conclusao` datetime DEFAULT NULL,
  `custo_total_calculado` decimal(12, 4) DEFAULT '0.0000',
  `lote` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `formula_id` (`formula_id`),
  KEY `usuario_responsavel_id` (`usuario_responsavel_id`),
  KEY `ordens_producao_produto_id_foreign_idx` (`produto_id`),
  CONSTRAINT `ordens_producao_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `formulas` (`id`),
  CONSTRAINT `ordens_producao_ibfk_2` FOREIGN KEY (`usuario_responsavel_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `ordens_producao_produto_id_foreign_idx` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: ordens_producao_insumos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ordens_producao_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordem_id` int NOT NULL,
  `materia_prima_id` int NOT NULL,
  `quantidade_planejada` decimal(12, 4) NOT NULL,
  `quantidade_real_usada` decimal(12, 4) DEFAULT '0.0000',
  `custo_unitario` decimal(10, 4) DEFAULT NULL,
  `subtotal` decimal(12, 4) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ordem_id` (`ordem_id`),
  KEY `materia_prima_id` (`materia_prima_id`),
  CONSTRAINT `ordens_producao_insumos_ibfk_1` FOREIGN KEY (`ordem_id`) REFERENCES `ordens_producao` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ordens_producao_insumos_ibfk_2` FOREIGN KEY (`materia_prima_id`) REFERENCES `materias_primas` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: pedidos_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pedidos_compra` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fornecedor_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `status` enum(
  'rascunho',
  'enviado',
  'parcial',
  'recebido',
  'cancelado'
  ) COLLATE utf8mb4_unicode_ci DEFAULT 'rascunho',
  `data_pedido` date NOT NULL,
  `data_previsao` date DEFAULT NULL,
  `data_recebimento` date DEFAULT NULL,
  `valor_total` decimal(12, 2) DEFAULT '0.00',
  `valor_frete` decimal(12, 2) NOT NULL DEFAULT '0.00',
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `fornecedor_id` (`fornecedor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `pedidos_compra_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`),
  CONSTRAINT `pedidos_compra_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 11 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: pedidos_compra_itens
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pedidos_compra_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `materia_prima_id` int NOT NULL,
  `quantidade_pedida` decimal(12, 3) NOT NULL,
  `quantidade_recebida` decimal(12, 3) DEFAULT '0.000',
  `preco_unitario` decimal(10, 4) NOT NULL,
  `fator_conversao` decimal(10, 4) NOT NULL DEFAULT '1.0000' COMMENT 'Quantas unidades de estoque equivalem a 1 unidade de compra. Ex: 1 unidade = 100ml => fator = 100',
  `unidade_compra` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descrição da unidade de compra. Ex: frasco, caixa, kg',
  `subtotal` decimal(12, 2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `materia_prima_id` (`materia_prima_id`),
  CONSTRAINT `pedidos_compra_itens_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos_compra` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedidos_compra_itens_ibfk_2` FOREIGN KEY (`materia_prima_id`) REFERENCES `materias_primas` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 53 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: produtos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formula_id` int DEFAULT NULL,
  `unidade_medida_id` int NOT NULL,
  `preco_custo` decimal(10, 4) DEFAULT '0.0000',
  `preco_venda` decimal(10, 2) DEFAULT '0.00',
  `estoque_atual` decimal(12, 3) DEFAULT '0.000',
  `estoque_minimo` decimal(12, 3) DEFAULT '0.000',
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `formula_id` (`formula_id`),
  KEY `unidade_medida_id` (`unidade_medida_id`),
  CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`formula_id`) REFERENCES `formulas` (`id`),
  CONSTRAINT `produtos_ibfk_2` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sequelizemeta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3 COLLATE = utf8mb3_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: unidades_medida
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `unidades_medida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sigla` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sigla` (`sigla`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: usuarios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `perfil` enum('admin', 'operador', 'comprador') COLLATE utf8mb4_unicode_ci DEFAULT 'operador',
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: categorias_mp
# ------------------------------------------------------------

INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'Óleos Vegetais',
    'Óleos base para sabonetes e pomadas',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'Hidrolatos',
    'Águas florais e hidrolatos',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    'Ativos',
    'Ativos cosméticos e terapêuticos',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    4,
    'Conservantes',
    'Conservantes e estabilizantes',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    'Emulsificantes',
    'Emulsificantes e tensoativos',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    'Ervas e Extratos',
    'Ervas, extratos e tinturas base',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    'Embalagens',
    'Frascos, potes e embalagens',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    'Outros',
    'Demais insumos',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    'Óleos Essenciais',
    'Óleos essenciais aromáticos e terapêuticos',
    '2026-03-21 02:47:17',
    '2026-03-21 02:47:17'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    'Essência Hidrossolúvel',
    'Essências solúveis em água para uso em formulações aquosas',
    '2026-04-03 01:43:34',
    '2026-04-03 01:43:34'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    11,
    'Corrante Hidrossolúvel',
    'Corrantes solúveis em água para formulações cosméticas',
    '2026-04-03 03:36:24',
    '2026-04-03 03:36:24'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    12,
    'Base Glicerinada',
    'Bases glicerinadas para sabonetes e cosméticos',
    '2026-04-03 03:36:24',
    '2026-04-03 03:36:24'
  );
INSERT INTO
  `categorias_mp` (
    `id`,
    `nome`,
    `descricao`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    13,
    'Pigmento',
    'Pigmentos para coloração de sabonetes e cosméticos',
    '2026-04-03 03:36:24',
    '2026-04-03 03:36:24'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: formulas
# ------------------------------------------------------------

INSERT INTO
  `formulas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria`,
    `rendimento_quantidade`,
    `rendimento_unidade_id`,
    `versao`,
    `status`,
    `instrucoes_producao`,
    `observacoes`,
    `usuario_criacao_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    '',
    'Pomada',
    '',
    'pomada',
    1000.000,
    2,
    2,
    'inativa',
    '',
    '',
    1,
    '2026-03-21 02:19:41',
    '2026-04-03 03:01:42'
  );
INSERT INTO
  `formulas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria`,
    `rendimento_quantidade`,
    `rendimento_unidade_id`,
    `versao`,
    `status`,
    `instrucoes_producao`,
    `observacoes`,
    `usuario_criacao_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'FSABREFRESCANTE',
    'Sabonete de Glicerina Refrescante',
    '',
    'sabonete',
    5.000,
    5,
    4,
    'ativa',
    '',
    '',
    1,
    '2026-04-03 04:10:52',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria`,
    `rendimento_quantidade`,
    `rendimento_unidade_id`,
    `versao`,
    `status`,
    `instrucoes_producao`,
    `observacoes`,
    `usuario_criacao_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    'FSABCAMESFO',
    'Sabonete de Camomila Esfoliante',
    '',
    'sabonete',
    10.000,
    5,
    2,
    'ativa',
    '',
    '',
    1,
    '2026-04-10 19:06:06',
    '2026-04-10 19:10:30'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: formulas_ingredientes
# ------------------------------------------------------------

INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    1,
    1,
    1.0000,
    4,
    NULL,
    'aquosa',
    1,
    NULL,
    '2026-03-21 02:21:39',
    '2026-03-21 02:21:39'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    27,
    3,
    16,
    1000.0000,
    2,
    NULL,
    'unica',
    1,
    NULL,
    '2026-04-10 19:09:14',
    '2026-04-10 19:09:14'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    28,
    3,
    13,
    10.0000,
    4,
    NULL,
    'oleosa',
    2,
    NULL,
    '2026-04-10 19:09:14',
    '2026-04-10 19:09:14'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    29,
    3,
    14,
    20.0000,
    4,
    NULL,
    'esfriamento',
    3,
    NULL,
    '2026-04-10 19:09:14',
    '2026-04-10 19:09:14'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    30,
    3,
    10,
    40.0000,
    4,
    NULL,
    'esfriamento',
    4,
    NULL,
    '2026-04-10 19:09:14',
    '2026-04-10 19:09:14'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    31,
    3,
    2,
    40.0000,
    4,
    NULL,
    'esfriamento',
    5,
    NULL,
    '2026-04-10 19:09:14',
    '2026-04-10 19:09:14'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    32,
    2,
    15,
    500.0000,
    2,
    NULL,
    'unica',
    1,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    33,
    2,
    13,
    5.0000,
    4,
    NULL,
    'oleosa',
    2,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    34,
    2,
    14,
    10.0000,
    4,
    NULL,
    'esfriamento',
    3,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    35,
    2,
    9,
    20.0000,
    4,
    NULL,
    'esfriamento',
    4,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    36,
    2,
    6,
    5.0000,
    4,
    NULL,
    'esfriamento',
    5,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    37,
    2,
    32,
    1.0000,
    4,
    NULL,
    'esfriamento',
    6,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );
INSERT INTO
  `formulas_ingredientes` (
    `id`,
    `formula_id`,
    `materia_prima_id`,
    `quantidade`,
    `unidade_medida_id`,
    `percentual`,
    `fase`,
    `ordem`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    38,
    2,
    29,
    2.0000,
    4,
    NULL,
    'esfriamento',
    7,
    NULL,
    '2026-04-10 19:09:26',
    '2026-04-10 19:09:26'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: formulas_versoes
# ------------------------------------------------------------

INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    1,
    1,
    1,
    '{\"nome\": \"Pomada\", \"codigo\": \"\", \"categoria\": \"pomada\", \"descricao\": \"\", \"observacoes\": \"\", \"ingredientes\": [{\"fase\": \"aquosa\", \"ordem\": 1, \"quantidade\": 10, \"materia_prima_id\": 1, \"unidade_medida_id\": 4}], \"motivo_alteracao\": \"\", \"instrucoes_producao\": \"\", \"rendimento_quantidade\": 1000, \"rendimento_unidade_id\": 2}',
    1,
    '2026-03-21 02:19:41',
    'Criação inicial',
    '2026-03-21 02:19:41'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    2,
    1,
    1,
    '{\"id\": 1, \"nome\": \"Pomada\", \"codigo\": \"\", \"status\": \"ativa\", \"versao\": 1, \"categoria\": \"pomada\", \"descricao\": \"\", \"created_at\": \"2026-03-21T02:19:41.000Z\", \"updated_at\": \"2026-03-21T02:20:42.000Z\", \"observacoes\": \"\", \"ingredientes\": [{\"id\": 1, \"fase\": \"aquosa\", \"ordem\": 1, \"created_at\": \"2026-03-21T02:19:41.000Z\", \"formula_id\": 1, \"percentual\": null, \"quantidade\": \"10.0000\", \"updated_at\": \"2026-03-21T02:19:41.000Z\", \"observacoes\": null, \"materia_prima_id\": 1, \"unidade_medida_id\": 4}], \"usuario_criacao_id\": 1, \"instrucoes_producao\": \"\", \"rendimento_quantidade\": \"1000.000\", \"rendimento_unidade_id\": 2}',
    1,
    '2026-03-21 02:21:39',
    'Alteração de fórmula',
    '2026-03-21 02:21:39'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    3,
    2,
    1,
    '{\"nome\": \"Sabonete de Glicerina Refrescante\", \"codigo\": \"SABREFRESCANTE\", \"categoria\": \"sabonete\", \"descricao\": \"\", \"observacoes\": \"\", \"ingredientes\": [{\"fase\": \"unica\", \"ordem\": 1, \"quantidade\": 500, \"materia_prima_id\": 15, \"unidade_medida_id\": 2}, {\"fase\": \"esfriamento\", \"ordem\": 3, \"quantidade\": 10, \"materia_prima_id\": 14, \"unidade_medida_id\": 4}, {\"fase\": \"esfriamento\", \"ordem\": 4, \"quantidade\": 20, \"materia_prima_id\": 9, \"unidade_medida_id\": 4}, {\"fase\": \"oleosa\", \"ordem\": 2, \"quantidade\": 5, \"materia_prima_id\": 13, \"unidade_medida_id\": 4}, {\"fase\": \"esfriamento\", \"ordem\": 5, \"quantidade\": 5, \"materia_prima_id\": 6, \"unidade_medida_id\": 4}], \"motivo_alteracao\": \"\", \"instrucoes_producao\": \"\", \"rendimento_quantidade\": 10, \"rendimento_unidade_id\": 5}',
    1,
    '2026-04-03 04:10:53',
    'Criação inicial',
    '2026-04-03 04:10:53'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    4,
    2,
    1,
    '{\"id\": 2, \"nome\": \"Sabonete de Glicerina Refrescante\", \"codigo\": \"SABREFRESCANTE\", \"status\": \"rascunho\", \"versao\": 1, \"categoria\": \"sabonete\", \"descricao\": \"\", \"created_at\": \"2026-04-03T04:10:52.000Z\", \"updated_at\": \"2026-04-03T04:10:52.000Z\", \"observacoes\": \"\", \"ingredientes\": [{\"id\": 3, \"fase\": \"unica\", \"ordem\": 1, \"created_at\": \"2026-04-03T04:10:53.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"500.0000\", \"updated_at\": \"2026-04-03T04:10:53.000Z\", \"observacoes\": null, \"materia_prima_id\": 15, \"unidade_medida_id\": 2}, {\"id\": 4, \"fase\": \"esfriamento\", \"ordem\": 3, \"created_at\": \"2026-04-03T04:10:53.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"10.0000\", \"updated_at\": \"2026-04-03T04:10:53.000Z\", \"observacoes\": null, \"materia_prima_id\": 14, \"unidade_medida_id\": 4}, {\"id\": 5, \"fase\": \"esfriamento\", \"ordem\": 4, \"created_at\": \"2026-04-03T04:10:53.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"20.0000\", \"updated_at\": \"2026-04-03T04:10:53.000Z\", \"observacoes\": null, \"materia_prima_id\": 9, \"unidade_medida_id\": 4}, {\"id\": 6, \"fase\": \"oleosa\", \"ordem\": 2, \"created_at\": \"2026-04-03T04:10:53.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"5.0000\", \"updated_at\": \"2026-04-03T04:10:53.000Z\", \"observacoes\": null, \"materia_prima_id\": 13, \"unidade_medida_id\": 4}, {\"id\": 7, \"fase\": \"esfriamento\", \"ordem\": 5, \"created_at\": \"2026-04-03T04:10:53.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"5.0000\", \"updated_at\": \"2026-04-03T04:10:53.000Z\", \"observacoes\": null, \"materia_prima_id\": 6, \"unidade_medida_id\": 4}], \"usuario_criacao_id\": 1, \"instrucoes_producao\": \"\", \"rendimento_quantidade\": \"10.000\", \"rendimento_unidade_id\": 5}',
    1,
    '2026-04-03 04:41:36',
    'Alteração de fórmula',
    '2026-04-03 04:41:36'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    5,
    2,
    2,
    '{\"id\": 2, \"nome\": \"Sabonete de Glicerina Refrescante\", \"codigo\": \"SABREFRESCANTE\", \"status\": \"rascunho\", \"versao\": 2, \"categoria\": \"sabonete\", \"descricao\": \"\", \"created_at\": \"2026-04-03T04:10:52.000Z\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": \"\", \"ingredientes\": [{\"id\": 8, \"fase\": \"unica\", \"ordem\": 1, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"500.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 15, \"unidade_medida_id\": 2}, {\"id\": 9, \"fase\": \"oleosa\", \"ordem\": 2, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"5.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 13, \"unidade_medida_id\": 4}, {\"id\": 10, \"fase\": \"esfriamento\", \"ordem\": 3, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"10.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 14, \"unidade_medida_id\": 4}, {\"id\": 11, \"fase\": \"esfriamento\", \"ordem\": 4, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"20.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 9, \"unidade_medida_id\": 4}, {\"id\": 12, \"fase\": \"esfriamento\", \"ordem\": 5, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"5.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 6, \"unidade_medida_id\": 4}, {\"id\": 13, \"fase\": \"esfriamento\", \"ordem\": 6, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"1.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 32, \"unidade_medida_id\": 4}, {\"id\": 14, \"fase\": \"esfriamento\", \"ordem\": 7, \"created_at\": \"2026-04-03T04:41:36.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"2.0000\", \"updated_at\": \"2026-04-03T04:41:36.000Z\", \"observacoes\": null, \"materia_prima_id\": 29, \"unidade_medida_id\": 4}], \"usuario_criacao_id\": 1, \"instrucoes_producao\": \"\", \"rendimento_quantidade\": \"10.000\", \"rendimento_unidade_id\": 5}',
    1,
    '2026-04-03 04:42:04',
    'Alteração de fórmula',
    '2026-04-03 04:42:04'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    6,
    3,
    1,
    '{\"nome\": \"Sabonete de Camomila Esfoliante\", \"codigo\": \"SABCAMESFO\", \"categoria\": \"sabonete\", \"descricao\": \"\", \"observacoes\": \"\", \"ingredientes\": [{\"fase\": \"unica\", \"ordem\": 1, \"quantidade\": 1000, \"materia_prima_id\": 16, \"unidade_medida_id\": 2}, {\"fase\": \"oleosa\", \"ordem\": 2, \"quantidade\": 10, \"materia_prima_id\": 13, \"unidade_medida_id\": 4}, {\"fase\": \"esfriamento\", \"ordem\": 3, \"quantidade\": 20, \"materia_prima_id\": 14, \"unidade_medida_id\": 4}, {\"fase\": \"esfriamento\", \"ordem\": 4, \"quantidade\": 40, \"materia_prima_id\": 10, \"unidade_medida_id\": 4}, {\"fase\": \"esfriamento\", \"ordem\": 5, \"quantidade\": 40, \"materia_prima_id\": 2, \"unidade_medida_id\": 4}], \"motivo_alteracao\": \"\", \"instrucoes_producao\": \"\", \"rendimento_quantidade\": 10, \"rendimento_unidade_id\": 5}',
    1,
    '2026-04-10 19:06:06',
    'Criação inicial',
    '2026-04-10 19:06:06'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    7,
    3,
    1,
    '{\"id\": 3, \"nome\": \"Sabonete de Camomila Esfoliante\", \"codigo\": \"SABCAMESFO\", \"status\": \"rascunho\", \"versao\": 1, \"categoria\": \"sabonete\", \"descricao\": \"\", \"created_at\": \"2026-04-10T19:06:06.000Z\", \"updated_at\": \"2026-04-10T19:06:06.000Z\", \"observacoes\": \"\", \"ingredientes\": [{\"id\": 22, \"fase\": \"unica\", \"ordem\": 1, \"created_at\": \"2026-04-10T19:06:06.000Z\", \"formula_id\": 3, \"percentual\": null, \"quantidade\": \"1000.0000\", \"updated_at\": \"2026-04-10T19:06:06.000Z\", \"observacoes\": null, \"materia_prima_id\": 16, \"unidade_medida_id\": 2}, {\"id\": 23, \"fase\": \"oleosa\", \"ordem\": 2, \"created_at\": \"2026-04-10T19:06:06.000Z\", \"formula_id\": 3, \"percentual\": null, \"quantidade\": \"10.0000\", \"updated_at\": \"2026-04-10T19:06:06.000Z\", \"observacoes\": null, \"materia_prima_id\": 13, \"unidade_medida_id\": 4}, {\"id\": 24, \"fase\": \"esfriamento\", \"ordem\": 3, \"created_at\": \"2026-04-10T19:06:06.000Z\", \"formula_id\": 3, \"percentual\": null, \"quantidade\": \"20.0000\", \"updated_at\": \"2026-04-10T19:06:06.000Z\", \"observacoes\": null, \"materia_prima_id\": 14, \"unidade_medida_id\": 4}, {\"id\": 25, \"fase\": \"esfriamento\", \"ordem\": 4, \"created_at\": \"2026-04-10T19:06:06.000Z\", \"formula_id\": 3, \"percentual\": null, \"quantidade\": \"40.0000\", \"updated_at\": \"2026-04-10T19:06:06.000Z\", \"observacoes\": null, \"materia_prima_id\": 10, \"unidade_medida_id\": 4}, {\"id\": 26, \"fase\": \"esfriamento\", \"ordem\": 5, \"created_at\": \"2026-04-10T19:06:06.000Z\", \"formula_id\": 3, \"percentual\": null, \"quantidade\": \"40.0000\", \"updated_at\": \"2026-04-10T19:06:06.000Z\", \"observacoes\": null, \"materia_prima_id\": 2, \"unidade_medida_id\": 4}], \"usuario_criacao_id\": 1, \"instrucoes_producao\": \"\", \"rendimento_quantidade\": \"10.000\", \"rendimento_unidade_id\": 5}',
    1,
    '2026-04-10 19:09:14',
    'Alteração de fórmula',
    '2026-04-10 19:09:14'
  );
INSERT INTO
  `formulas_versoes` (
    `id`,
    `formula_id`,
    `versao`,
    `snapshot_json`,
    `usuario_id`,
    `data_versao`,
    `motivo_alteracao`,
    `created_at`
  )
VALUES
  (
    8,
    2,
    3,
    '{\"id\": 2, \"nome\": \"Sabonete de Glicerina Refrescante\", \"codigo\": \"SABREFRESCANTE\", \"status\": \"ativa\", \"versao\": 3, \"categoria\": \"sabonete\", \"descricao\": \"\", \"created_at\": \"2026-04-03T04:10:52.000Z\", \"updated_at\": \"2026-04-10T18:57:16.000Z\", \"observacoes\": \"\", \"ingredientes\": [{\"id\": 15, \"fase\": \"unica\", \"ordem\": 1, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"500.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 15, \"unidade_medida_id\": 2}, {\"id\": 16, \"fase\": \"oleosa\", \"ordem\": 2, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"5.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 13, \"unidade_medida_id\": 4}, {\"id\": 17, \"fase\": \"esfriamento\", \"ordem\": 3, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"10.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 14, \"unidade_medida_id\": 4}, {\"id\": 18, \"fase\": \"esfriamento\", \"ordem\": 4, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"20.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 9, \"unidade_medida_id\": 4}, {\"id\": 19, \"fase\": \"esfriamento\", \"ordem\": 5, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"5.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 6, \"unidade_medida_id\": 4}, {\"id\": 20, \"fase\": \"esfriamento\", \"ordem\": 6, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"1.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 32, \"unidade_medida_id\": 4}, {\"id\": 21, \"fase\": \"esfriamento\", \"ordem\": 7, \"created_at\": \"2026-04-03T04:42:04.000Z\", \"formula_id\": 2, \"percentual\": null, \"quantidade\": \"2.0000\", \"updated_at\": \"2026-04-03T04:42:04.000Z\", \"observacoes\": null, \"materia_prima_id\": 29, \"unidade_medida_id\": 4}], \"usuario_criacao_id\": 1, \"instrucoes_producao\": \"\", \"rendimento_quantidade\": \"5.000\", \"rendimento_unidade_id\": 5}',
    1,
    '2026-04-10 19:09:26',
    'Alteração de fórmula',
    '2026-04-10 19:09:26'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: fornecedores
# ------------------------------------------------------------

INSERT INTO
  `fornecedores` (
    `id`,
    `razao_social`,
    `nome_fantasia`,
    `cnpj_cpf`,
    `telefone`,
    `email`,
    `site`,
    `endereco`,
    `cidade`,
    `estado`,
    `cep`,
    `ativo`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'Fornecedor Teste',
    'Essencias',
    '',
    '(45) 30252-809',
    'alexsandroduranti@gmail.com',
    'https://www.baindichero.com.br/',
    'Rua Quintino Bocaiúva, 1297',
    'Foz do Iguaçu',
    'PR',
    '85851-130',
    0,
    '',
    '2026-03-21 02:12:31',
    '2026-03-21 02:30:11'
  );
INSERT INTO
  `fornecedores` (
    `id`,
    `razao_social`,
    `nome_fantasia`,
    `cnpj_cpf`,
    `telefone`,
    `email`,
    `site`,
    `endereco`,
    `cidade`,
    `estado`,
    `cep`,
    `ativo`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'Bain Di Chero',
    'Bain Di Chero',
    '43.027.773/0001-74',
    '(11) 95830-9250',
    'atendimento@baindichero.com.br',
    'https://www.baindichero.com.br/',
    'Avenida Senador Vergueiro, 259',
    'São Bernardo do Campo',
    'SP',
    '09750-000',
    1,
    'Também vende pela Shopee',
    '2026-03-21 02:30:04',
    '2026-03-21 02:30:04'
  );
INSERT INTO
  `fornecedores` (
    `id`,
    `razao_social`,
    `nome_fantasia`,
    `cnpj_cpf`,
    `telefone`,
    `email`,
    `site`,
    `endereco`,
    `cidade`,
    `estado`,
    `cep`,
    `ativo`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    'Bottica Botanika',
    'Bottica Botanika',
    '47.893.639/0001-07',
    '(11) 91702-2633',
    'botticabotanika@gmail.com',
    'https://www.botticabotanika.com.br/',
    'Rua Afonso Pena',
    'Louveira ',
    'SP',
    '13290-300',
    1,
    '',
    '2026-04-03 02:29:44',
    '2026-04-03 02:29:44'
  );
INSERT INTO
  `fornecedores` (
    `id`,
    `razao_social`,
    `nome_fantasia`,
    `cnpj_cpf`,
    `telefone`,
    `email`,
    `site`,
    `endereco`,
    `cidade`,
    `estado`,
    `cep`,
    `ativo`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    'E-COMMERCE DO ARTESANATO',
    'E-COMMERCE DO ARTESANATO',
    '94.407.837/0001-01',
    '',
    '',
    'https://shopee.com.br/e.commerce65?entryPoint=OrderDetail',
    '',
    '',
    '',
    '',
    1,
    '',
    '2026-04-03 03:18:04',
    '2026-04-03 03:18:04'
  );
INSERT INTO
  `fornecedores` (
    `id`,
    `razao_social`,
    `nome_fantasia`,
    `cnpj_cpf`,
    `telefone`,
    `email`,
    `site`,
    `endereco`,
    `cidade`,
    `estado`,
    `cep`,
    `ativo`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    'Divina Essência ',
    'Divina Essência ',
    '52.839.508/0001-81',
    '',
    '',
    'https://shopee.com.br/divinaessencia?categoryId=100636&entryPoint=ShopByPDP&itemId=22598217167',
    '',
    '',
    '',
    '',
    1,
    'Shopee',
    '2026-04-03 03:48:12',
    '2026-04-03 03:48:12'
  );
INSERT INTO
  `fornecedores` (
    `id`,
    `razao_social`,
    `nome_fantasia`,
    `cnpj_cpf`,
    `telefone`,
    `email`,
    `site`,
    `endereco`,
    `cidade`,
    `estado`,
    `cep`,
    `ativo`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    'Bio Organics Brasil',
    'Bio Organics Brasil',
    '69.585.198/0001-19',
    '',
    '',
    'https://shopee.com.br/bioorganics?entryPoint=OrderDetail',
    '',
    '',
    '',
    '',
    1,
    'Shopee',
    '2026-04-03 04:16:50',
    '2026-04-03 04:16:50'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: lotes_produtos
# ------------------------------------------------------------

INSERT INTO
  `lotes_produtos` (
    `id`,
    `produto_id`,
    `ordem_producao_id`,
    `numero_lote`,
    `quantidade`,
    `data_fabricacao`,
    `data_validade`,
    `custo_unitario`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    3,
    3,
    'L100426B0001',
    10.000,
    '2026-04-10',
    NULL,
    4.3821,
    'disponivel',
    '2026-04-10 19:11:25',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `lotes_produtos` (
    `id`,
    `produto_id`,
    `ordem_producao_id`,
    `numero_lote`,
    `quantidade`,
    `data_fabricacao`,
    `data_validade`,
    `custo_unitario`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    2,
    2,
    'L100426A0001',
    5.000,
    '2026-04-10',
    NULL,
    4.5016,
    'disponivel',
    '2026-04-10 19:27:05',
    '2026-04-10 19:27:05'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: materias_primas
# ------------------------------------------------------------

INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'GG',
    'Essência de Lavanda',
    '',
    9,
    4,
    0.000,
    1.000,
    10.000,
    16.0100,
    0,
    '2026-03-21 02:14:10',
    '2026-04-03 02:14:54'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'EHCAMOMILA',
    'Essência Camomila - Hidrossolúvel',
    'Frasco de 100ml',
    10,
    4,
    60.000,
    1.000,
    200.000,
    0.2867,
    1,
    '2026-03-21 02:37:07',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    4,
    'EHLAVANDAFR',
    'Essência Lavanda Francesa - Hidrossolúvel  ',
    'Frasco de 100ml',
    10,
    4,
    100.000,
    1.000,
    200.000,
    0.2867,
    1,
    '2026-03-21 02:39:32',
    '2026-04-03 02:22:38'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    'EHCAPIMLIMAO',
    'Essência Capim Limão - Hidrossolúvel ',
    'Frasco de 100ml',
    10,
    4,
    95.000,
    1.000,
    200.000,
    0.2867,
    1,
    '2026-03-21 02:41:17',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    'PAMARELO',
    'Pigmento Cosmético Amarelo',
    '',
    13,
    4,
    30.000,
    0.000,
    0.000,
    0.6557,
    1,
    '2026-04-03 02:24:44',
    '2026-04-03 03:37:16'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    'EXTGLICEALOEVERA',
    'Extrato Glicerinado Aloe Vera',
    '',
    6,
    4,
    250.000,
    0.000,
    0.000,
    0.1039,
    1,
    '2026-04-03 02:32:08',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    'EXTGLICPEPINO',
    'Extrato Glicerinado Pepino',
    '',
    6,
    4,
    230.000,
    0.000,
    0.000,
    0.1062,
    1,
    '2026-04-03 02:32:51',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    'EXTGLICCAMOMILA',
    'Extrato Glicerinado Camomila',
    '',
    6,
    4,
    60.000,
    0.000,
    0.000,
    0.1298,
    1,
    '2026-04-03 02:33:25',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    11,
    'EXTGLICCALENDULA',
    'Extrato Glicerinado Calêndula',
    '',
    6,
    4,
    250.000,
    0.000,
    0.000,
    0.0864,
    1,
    '2026-04-03 02:33:51',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    12,
    'EXTGLICEAVEIA',
    'Extrato Glicerinado Aveia',
    '',
    6,
    4,
    100.000,
    0.000,
    0.000,
    0.1275,
    1,
    '2026-04-03 02:34:26',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    13,
    ' OVAB',
    'Óleo Vegetal de Abacate',
    '',
    1,
    4,
    85.000,
    0.000,
    0.000,
    0.1581,
    1,
    '2026-04-03 02:35:06',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    14,
    'LALIQVEGETAL',
    'Lauril Liquido 100% Vegetal V&G ',
    '',
    8,
    4,
    970.000,
    0.000,
    0.000,
    0.0340,
    1,
    '2026-04-03 03:19:52',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    15,
    'BSGLICTRANSP',
    'Base Gligerinada Transparente Hipo V&G',
    '',
    12,
    2,
    1500.000,
    0.000,
    0.000,
    0.0249,
    1,
    '2026-04-03 03:21:51',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    16,
    'BSGLICBRANCA',
    'Base Gligerinada Branca Hipo V&G',
    '',
    12,
    2,
    1000.000,
    0.000,
    0.000,
    0.0249,
    1,
    '2026-04-03 03:22:28',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    17,
    'COAMARELO',
    'Corante Amarelo Canário',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:38:49',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    18,
    'COAZULBEBE',
    'Corante Azul Bebê',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:39:25',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    19,
    'COAZULTURQ',
    'Corante Azul Turquesa',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:39:59',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    20,
    'COCHOC',
    'Corante Chocolate',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:40:28',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    21,
    'COLARANJA',
    'Corante Laranja',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:40:49',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    22,
    'COLILAS',
    'Corante Lilás',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:41:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    23,
    'COPINK',
    'Corante Pink',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:41:31',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    24,
    'COROSABEBE',
    'Corante Rosa Bebê',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:42:09',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    25,
    'COVERBAND',
    'Corante Verde Bandeira',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:42:43',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    26,
    'COVERMMORA',
    'Corante Vermelho Morango',
    '',
    11,
    4,
    100.000,
    0.000,
    0.000,
    0.0808,
    1,
    '2026-04-03 03:43:19',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    27,
    'OEALECRIM',
    'Óleo Essencial de Alecrim',
    '',
    9,
    4,
    10.000,
    0.000,
    0.000,
    1.5900,
    1,
    '2026-04-03 04:20:23',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    28,
    'OELAVFRAN',
    'Óleo Essencial de Lavanda Francesa',
    '',
    9,
    4,
    10.000,
    0.000,
    0.000,
    1.5900,
    1,
    '2026-04-03 04:21:10',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    29,
    'OEMENPIP',
    'Óleo Essencial de Menta Piperita',
    '',
    9,
    4,
    8.000,
    0.000,
    0.000,
    1.8900,
    1,
    '2026-04-03 04:21:53',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    30,
    'OETOMBRA',
    'Óleo Essencial de Tomilho Branco',
    '',
    9,
    4,
    10.000,
    0.000,
    0.000,
    2.2900,
    1,
    '2026-04-03 04:22:35',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    31,
    'OEGEREG',
    'Óleo Essencial de Gerânio Egito',
    '',
    9,
    4,
    10.000,
    0.000,
    0.000,
    2.4900,
    1,
    '2026-04-03 04:23:17',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `materias_primas` (
    `id`,
    `codigo`,
    `nome`,
    `descricao`,
    `categoria_id`,
    `unidade_medida_id`,
    `estoque_atual`,
    `estoque_minimo`,
    `estoque_maximo`,
    `custo_medio`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    32,
    'OEEUCGLO',
    'Óleo Essencial de Eucalipto Globulus',
    '',
    9,
    4,
    9.000,
    0.000,
    0.000,
    1.5900,
    1,
    '2026-04-03 04:32:34',
    '2026-04-10 18:58:23'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: materias_primas_fornecedores
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: movimentacoes_estoque
# ------------------------------------------------------------

INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    1,
    1,
    'entrada',
    60.001,
    16.0100,
    60.001,
    60.001,
    'compra',
    1,
    1,
    '2026-03-21 02:22:06',
    NULL,
    '2026-03-21 02:22:06'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    2,
    1,
    'saida',
    1.000,
    16.0100,
    59.001,
    59.001,
    'producao',
    1,
    1,
    '2026-03-21 02:23:14',
    NULL,
    '2026-03-21 02:23:14'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    3,
    2,
    'ajuste',
    100.000,
    NULL,
    0.000,
    100.000,
    'ajuste',
    NULL,
    1,
    '2026-03-21 02:48:43',
    'Carga inicial',
    '2026-03-21 02:48:43'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    4,
    6,
    'ajuste',
    100.000,
    NULL,
    0.000,
    100.000,
    'ajuste',
    NULL,
    1,
    '2026-03-21 02:49:08',
    'Carga inicial',
    '2026-03-21 02:49:08'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    5,
    4,
    'ajuste',
    100.000,
    NULL,
    0.000,
    100.000,
    'ajuste',
    NULL,
    1,
    '2026-03-21 02:49:31',
    'Carga inicial',
    '2026-03-21 02:49:31'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    6,
    2,
    'entrada',
    1.000,
    36.0000,
    101.000,
    101.000,
    'compra',
    2,
    1,
    '2026-03-21 03:21:55',
    NULL,
    '2026-03-21 03:21:55'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    7,
    6,
    'entrada',
    100.000,
    0.3650,
    200.000,
    200.000,
    'compra',
    3,
    1,
    '2026-03-21 03:39:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-03-21 03:39:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    8,
    2,
    'saida',
    1.000,
    16.5000,
    101.000,
    100.000,
    'ajuste',
    2,
    1,
    '2026-04-03 02:08:12',
    'Estorno - correção do pedido PC-2026-0002',
    '2026-04-03 02:08:12'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    9,
    2,
    'ajuste',
    100.000,
    NULL,
    100.000,
    200.000,
    'ajuste',
    NULL,
    1,
    '2026-04-03 02:10:16',
    'Ajuste',
    '2026-04-03 02:10:16'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    10,
    2,
    'ajuste',
    200.000,
    NULL,
    200.000,
    0.000,
    'ajuste',
    NULL,
    1,
    '2026-04-03 02:10:31',
    'Ajuste',
    '2026-04-03 02:10:31'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    11,
    2,
    'entrada',
    100.000,
    0.2867,
    100.000,
    100.000,
    'compra',
    2,
    1,
    '2026-04-03 02:11:31',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 02:11:31'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    12,
    6,
    'saida',
    100.000,
    0.1650,
    200.000,
    100.000,
    'ajuste',
    3,
    1,
    '2026-04-03 02:12:57',
    'Estorno - correção do pedido PC-2026-0003',
    '2026-04-03 02:12:57'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    13,
    6,
    'ajuste',
    100.000,
    NULL,
    100.000,
    0.000,
    'ajuste',
    NULL,
    1,
    '2026-04-03 02:13:18',
    'Ajuste',
    '2026-04-03 02:13:18'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    14,
    6,
    'entrada',
    100.000,
    0.2867,
    100.000,
    100.000,
    'compra',
    3,
    1,
    '2026-04-03 02:13:34',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 02:13:34'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    15,
    4,
    'ajuste',
    100.000,
    NULL,
    100.000,
    0.000,
    'ajuste',
    NULL,
    1,
    '2026-04-03 02:14:03',
    'Ajuste',
    '2026-04-03 02:14:03'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    16,
    1,
    'saida',
    60.001,
    16.0100,
    59.001,
    0.000,
    'ajuste',
    1,
    1,
    '2026-04-03 02:14:54',
    'Estorno - correção do pedido PC-2026-0001',
    '2026-04-03 02:14:54'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    17,
    4,
    'entrada',
    100.000,
    0.2867,
    100.000,
    100.000,
    'compra',
    1,
    1,
    '2026-04-03 02:22:38',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 02:22:38'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    18,
    7,
    'entrada',
    30.000,
    0.6557,
    30.000,
    30.000,
    'compra',
    4,
    1,
    '2026-04-03 02:26:47',
    '1 frasco × 30 = 30 em estoque',
    '2026-04-03 02:26:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    19,
    8,
    'entrada',
    250.000,
    0.1039,
    250.000,
    250.000,
    'compra',
    5,
    1,
    '2026-04-03 02:47:47',
    '1 frasco × 250 = 250 em estoque',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    20,
    9,
    'entrada',
    250.000,
    0.1062,
    250.000,
    250.000,
    'compra',
    5,
    1,
    '2026-04-03 02:47:47',
    '1 frasco × 250 = 250 em estoque',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    21,
    10,
    'entrada',
    100.000,
    0.1298,
    100.000,
    100.000,
    'compra',
    5,
    1,
    '2026-04-03 02:47:47',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    22,
    11,
    'entrada',
    250.000,
    0.0864,
    250.000,
    250.000,
    'compra',
    5,
    1,
    '2026-04-03 02:47:47',
    '1 frasco × 250 = 250 em estoque',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    23,
    12,
    'entrada',
    100.000,
    0.1275,
    100.000,
    100.000,
    'compra',
    5,
    1,
    '2026-04-03 02:47:47',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    24,
    13,
    'entrada',
    100.000,
    0.1581,
    100.000,
    100.000,
    'compra',
    5,
    1,
    '2026-04-03 02:47:47',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    25,
    14,
    'entrada',
    1000.000,
    0.0340,
    1000.000,
    1000.000,
    'compra',
    7,
    1,
    '2026-04-03 03:33:31',
    '1 frasco × 1000 = 1000 em estoque',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    26,
    16,
    'entrada',
    2000.000,
    0.0249,
    2000.000,
    2000.000,
    'compra',
    7,
    1,
    '2026-04-03 03:33:31',
    '2 kg × 1000 = 2000 em estoque',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    27,
    15,
    'entrada',
    2000.000,
    0.0249,
    2000.000,
    2000.000,
    'compra',
    7,
    1,
    '2026-04-03 03:33:31',
    '2 kg × 1000 = 2000 em estoque',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    28,
    17,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    29,
    18,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    30,
    19,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    31,
    20,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    32,
    21,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    33,
    22,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    34,
    23,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    35,
    24,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    36,
    25,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    37,
    26,
    'entrada',
    100.000,
    0.0808,
    100.000,
    100.000,
    'compra',
    8,
    1,
    '2026-04-03 04:04:30',
    '1 frasco × 100 = 100 em estoque',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    38,
    27,
    'entrada',
    10.000,
    1.5900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:26:55',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:26:55'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    39,
    28,
    'entrada',
    10.000,
    1.5900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:26:55',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:26:55'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    40,
    29,
    'entrada',
    10.000,
    1.8900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:26:55',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:26:55'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    41,
    30,
    'entrada',
    10.000,
    2.2900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:26:55',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:26:55'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    42,
    31,
    'entrada',
    1.000,
    24.9000,
    1.000,
    1.000,
    'compra',
    9,
    1,
    '2026-04-03 04:26:55',
    NULL,
    '2026-04-03 04:26:55'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    43,
    27,
    'saida',
    10.000,
    1.5900,
    10.000,
    0.000,
    'ajuste',
    9,
    1,
    '2026-04-03 04:27:42',
    'Estorno - correção do pedido PC-2026-0009',
    '2026-04-03 04:27:42'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    44,
    28,
    'saida',
    10.000,
    1.5900,
    10.000,
    0.000,
    'ajuste',
    9,
    1,
    '2026-04-03 04:27:42',
    'Estorno - correção do pedido PC-2026-0009',
    '2026-04-03 04:27:42'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    45,
    29,
    'saida',
    10.000,
    1.8900,
    10.000,
    0.000,
    'ajuste',
    9,
    1,
    '2026-04-03 04:27:42',
    'Estorno - correção do pedido PC-2026-0009',
    '2026-04-03 04:27:42'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    46,
    30,
    'saida',
    10.000,
    2.2900,
    10.000,
    0.000,
    'ajuste',
    9,
    1,
    '2026-04-03 04:27:42',
    'Estorno - correção do pedido PC-2026-0009',
    '2026-04-03 04:27:42'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    47,
    31,
    'saida',
    1.000,
    24.9000,
    1.000,
    0.000,
    'ajuste',
    9,
    1,
    '2026-04-03 04:27:42',
    'Estorno - correção do pedido PC-2026-0009',
    '2026-04-03 04:27:42'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    48,
    27,
    'entrada',
    10.000,
    1.5900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:28:03',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    49,
    28,
    'entrada',
    10.000,
    1.5900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:28:03',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    50,
    29,
    'entrada',
    10.000,
    1.8900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:28:03',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    51,
    30,
    'entrada',
    10.000,
    2.2900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:28:03',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    52,
    31,
    'entrada',
    10.000,
    2.4900,
    10.000,
    10.000,
    'compra',
    9,
    1,
    '2026-04-03 04:28:03',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    53,
    32,
    'entrada',
    10.000,
    1.5900,
    10.000,
    10.000,
    'compra',
    10,
    1,
    '2026-04-03 04:33:45',
    '1 frasco × 10 = 10 em estoque',
    '2026-04-03 04:33:45'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    54,
    15,
    'saida',
    500.000,
    0.0249,
    1500.000,
    1500.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    55,
    13,
    'saida',
    5.000,
    0.1581,
    95.000,
    95.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    56,
    14,
    'saida',
    10.000,
    0.0340,
    990.000,
    990.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    57,
    9,
    'saida',
    20.000,
    0.1062,
    230.000,
    230.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    58,
    6,
    'saida',
    5.000,
    0.2867,
    95.000,
    95.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    59,
    32,
    'saida',
    1.000,
    1.5900,
    9.000,
    9.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    60,
    29,
    'saida',
    2.000,
    1.8900,
    8.000,
    8.000,
    'producao',
    2,
    1,
    '2026-04-10 18:58:23',
    NULL,
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    61,
    16,
    'saida',
    1000.000,
    0.0249,
    1000.000,
    1000.000,
    'producao',
    3,
    1,
    '2026-04-10 19:11:25',
    NULL,
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    62,
    13,
    'saida',
    10.000,
    0.1581,
    85.000,
    85.000,
    'producao',
    3,
    1,
    '2026-04-10 19:11:25',
    NULL,
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    63,
    14,
    'saida',
    20.000,
    0.0340,
    970.000,
    970.000,
    'producao',
    3,
    1,
    '2026-04-10 19:11:25',
    NULL,
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    64,
    10,
    'saida',
    40.000,
    0.1298,
    60.000,
    60.000,
    'producao',
    3,
    1,
    '2026-04-10 19:11:25',
    NULL,
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `movimentacoes_estoque` (
    `id`,
    `materia_prima_id`,
    `tipo`,
    `quantidade`,
    `custo_unitario`,
    `saldo_anterior`,
    `saldo_posterior`,
    `origem_tipo`,
    `origem_id`,
    `usuario_id`,
    `data_movimentacao`,
    `observacoes`,
    `created_at`
  )
VALUES
  (
    65,
    2,
    'saida',
    40.000,
    0.2867,
    60.000,
    60.000,
    'producao',
    3,
    1,
    '2026-04-10 19:11:25',
    NULL,
    '2026-04-10 19:11:25'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: ordens_producao
# ------------------------------------------------------------

INSERT INTO
  `ordens_producao` (
    `id`,
    `numero`,
    `formula_id`,
    `produto_id`,
    `usuario_responsavel_id`,
    `quantidade_planejada`,
    `quantidade_produzida`,
    `status`,
    `data_planejada`,
    `data_inicio`,
    `data_conclusao`,
    `custo_total_calculado`,
    `lote`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'OP-2026-0001',
    1,
    NULL,
    1,
    1000.000,
    1000.000,
    'concluida',
    '2026-03-20',
    '2026-03-21 02:23:01',
    '2026-03-21 02:23:14',
    16.0100,
    '',
    '',
    '2026-03-21 02:22:46',
    '2026-03-21 02:23:14'
  );
INSERT INTO
  `ordens_producao` (
    `id`,
    `numero`,
    `formula_id`,
    `produto_id`,
    `usuario_responsavel_id`,
    `quantidade_planejada`,
    `quantidade_produzida`,
    `status`,
    `data_planejada`,
    `data_inicio`,
    `data_conclusao`,
    `custo_total_calculado`,
    `lote`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'OP-2026-0002',
    2,
    2,
    1,
    5.000,
    5.000,
    'concluida',
    '2026-04-09',
    '2026-04-10 18:58:00',
    '2026-04-10 18:58:23',
    22.5080,
    '',
    '',
    '2026-04-10 18:57:44',
    '2026-04-10 19:27:05'
  );
INSERT INTO
  `ordens_producao` (
    `id`,
    `numero`,
    `formula_id`,
    `produto_id`,
    `usuario_responsavel_id`,
    `quantidade_planejada`,
    `quantidade_produzida`,
    `status`,
    `data_planejada`,
    `data_inicio`,
    `data_conclusao`,
    `custo_total_calculado`,
    `lote`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    'OP-2026-0003',
    3,
    3,
    1,
    10.000,
    10.000,
    'concluida',
    '2026-04-09',
    '2026-04-10 19:11:12',
    '2026-04-10 19:11:25',
    43.8210,
    '',
    '',
    '2026-04-10 19:11:06',
    '2026-04-10 19:11:25'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: ordens_producao_insumos
# ------------------------------------------------------------

INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    1,
    1,
    1.0000,
    1.0000,
    16.0100,
    16.0100,
    '2026-03-21 02:22:46',
    '2026-03-21 02:23:14'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    2,
    15,
    500.0000,
    500.0000,
    0.0249,
    12.4500,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    2,
    13,
    5.0000,
    5.0000,
    0.1581,
    0.7905,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    4,
    2,
    14,
    10.0000,
    10.0000,
    0.0340,
    0.3400,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    2,
    9,
    20.0000,
    20.0000,
    0.1062,
    2.1240,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    2,
    6,
    5.0000,
    5.0000,
    0.2867,
    1.4335,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    2,
    32,
    1.0000,
    1.0000,
    1.5900,
    1.5900,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    2,
    29,
    2.0000,
    2.0000,
    1.8900,
    3.7800,
    '2026-04-10 18:57:44',
    '2026-04-10 18:58:23'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    3,
    16,
    1000.0000,
    1000.0000,
    0.0249,
    24.9000,
    '2026-04-10 19:11:06',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    3,
    13,
    10.0000,
    10.0000,
    0.1581,
    1.5810,
    '2026-04-10 19:11:06',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    11,
    3,
    14,
    20.0000,
    20.0000,
    0.0340,
    0.6800,
    '2026-04-10 19:11:06',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    12,
    3,
    10,
    40.0000,
    40.0000,
    0.1298,
    5.1920,
    '2026-04-10 19:11:06',
    '2026-04-10 19:11:25'
  );
INSERT INTO
  `ordens_producao_insumos` (
    `id`,
    `ordem_id`,
    `materia_prima_id`,
    `quantidade_planejada`,
    `quantidade_real_usada`,
    `custo_unitario`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    13,
    3,
    2,
    40.0000,
    40.0000,
    0.2867,
    11.4680,
    '2026-04-10 19:11:06',
    '2026-04-10 19:11:25'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: pedidos_compra
# ------------------------------------------------------------

INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'PC-2026-0001',
    2,
    1,
    'recebido',
    '2026-03-17',
    '2026-03-27',
    '2026-04-02',
    28.67,
    4.77,
    '',
    '2026-03-21 02:18:15',
    '2026-04-03 02:22:38'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'PC-2026-0002',
    2,
    1,
    'recebido',
    '2026-03-18',
    '2026-03-19',
    '2026-04-02',
    28.67,
    4.77,
    '',
    '2026-03-21 03:15:56',
    '2026-04-03 02:11:31'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    'PC-2026-0003',
    2,
    1,
    'recebido',
    '2026-03-19',
    '2026-03-20',
    '2026-04-02',
    28.67,
    4.77,
    '',
    '2026-03-21 03:39:07',
    '2026-04-03 02:13:34'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    4,
    'PC-2026-0004',
    2,
    1,
    'recebido',
    '2026-03-02',
    '2026-03-15',
    '2026-04-02',
    19.67,
    4.77,
    '',
    '2026-04-03 02:26:29',
    '2026-04-03 02:26:47'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    'PC-2026-0005',
    3,
    1,
    'recebido',
    '2026-03-01',
    '2026-03-21',
    '2026-04-02',
    115.66,
    17.66,
    '',
    '2026-04-03 02:37:19',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    'PC-2026-0006',
    3,
    1,
    'cancelado',
    '2026-03-02',
    '2026-03-22',
    NULL,
    25.44,
    2.94,
    '',
    '2026-04-03 02:38:09',
    '2026-04-03 02:43:36'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    'PC-2026-0007',
    6,
    1,
    'recebido',
    '2026-03-02',
    '2026-04-05',
    '2026-04-03',
    133.73,
    0.00,
    '',
    '2026-04-03 03:32:17',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    'PC-2026-0008',
    7,
    1,
    'recebido',
    '2026-03-01',
    '2026-03-14',
    '2026-04-03',
    80.80,
    0.00,
    '',
    '2026-04-03 03:53:01',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    'PC-2026-0009',
    8,
    1,
    'recebido',
    '2026-03-01',
    '2026-04-11',
    '2026-04-03',
    98.50,
    0.00,
    '',
    '2026-04-03 04:26:19',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `pedidos_compra` (
    `id`,
    `numero`,
    `fornecedor_id`,
    `usuario_id`,
    `status`,
    `data_pedido`,
    `data_previsao`,
    `data_recebimento`,
    `valor_total`,
    `valor_frete`,
    `observacoes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    'PC-2026-0010',
    8,
    1,
    'recebido',
    '2026-03-02',
    '2026-05-10',
    '2026-04-03',
    15.90,
    0.00,
    '',
    '2026-04-03 04:33:35',
    '2026-04-03 04:33:45'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: pedidos_compra_itens
# ------------------------------------------------------------

INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    2,
    2,
    1.000,
    1.000,
    23.9000,
    100.0000,
    'frasco',
    23.90,
    '2026-04-03 02:08:12',
    '2026-04-03 02:11:31'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    3,
    6,
    1.000,
    1.000,
    23.9000,
    100.0000,
    'frasco',
    23.90,
    '2026-04-03 02:12:57',
    '2026-04-03 02:13:34'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    1,
    4,
    1.000,
    1.000,
    23.9000,
    100.0000,
    'frasco',
    23.90,
    '2026-04-03 02:22:19',
    '2026-04-03 02:22:38'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    4,
    7,
    1.000,
    1.000,
    14.9000,
    30.0000,
    'frasco',
    14.90,
    '2026-04-03 02:26:29',
    '2026-04-03 02:26:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    12,
    6,
    9,
    1.000,
    0.000,
    22.5000,
    250.0000,
    'frasco',
    22.50,
    '2026-04-03 02:38:09',
    '2026-04-03 02:38:09'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    13,
    5,
    8,
    1.000,
    1.000,
    22.0000,
    250.0000,
    'frasco',
    22.00,
    '2026-04-03 02:47:29',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    14,
    5,
    9,
    1.000,
    1.000,
    22.5000,
    250.0000,
    'frasco',
    22.50,
    '2026-04-03 02:47:29',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    15,
    5,
    10,
    1.000,
    1.000,
    11.0000,
    100.0000,
    'frasco',
    11.00,
    '2026-04-03 02:47:29',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    16,
    5,
    11,
    1.000,
    1.000,
    18.3000,
    250.0000,
    'frasco',
    18.30,
    '2026-04-03 02:47:29',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    17,
    5,
    12,
    1.000,
    1.000,
    10.8000,
    100.0000,
    'frasco',
    10.80,
    '2026-04-03 02:47:29',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    18,
    5,
    13,
    1.000,
    1.000,
    13.4000,
    100.0000,
    'frasco',
    13.40,
    '2026-04-03 02:47:29',
    '2026-04-03 02:47:47'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    19,
    7,
    14,
    1.000,
    1.000,
    33.9900,
    1000.0000,
    'frasco',
    33.99,
    '2026-04-03 03:32:17',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    20,
    7,
    16,
    2.000,
    2.000,
    24.9300,
    1000.0000,
    'kg',
    49.86,
    '2026-04-03 03:32:17',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    21,
    7,
    15,
    2.000,
    2.000,
    24.9400,
    1000.0000,
    'kg',
    49.88,
    '2026-04-03 03:32:17',
    '2026-04-03 03:33:31'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    32,
    8,
    17,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    33,
    8,
    18,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    34,
    8,
    19,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    35,
    8,
    20,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    36,
    8,
    21,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    37,
    8,
    22,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    38,
    8,
    23,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    39,
    8,
    24,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    40,
    8,
    25,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    41,
    8,
    26,
    1.000,
    1.000,
    8.0800,
    100.0000,
    'frasco',
    8.08,
    '2026-04-03 04:04:12',
    '2026-04-03 04:04:30'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    47,
    9,
    27,
    1.000,
    1.000,
    15.9000,
    10.0000,
    'frasco',
    15.90,
    '2026-04-03 04:27:42',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    48,
    9,
    28,
    1.000,
    1.000,
    15.9000,
    10.0000,
    'frasco',
    15.90,
    '2026-04-03 04:27:42',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    49,
    9,
    29,
    1.000,
    1.000,
    18.9000,
    10.0000,
    'frasco',
    18.90,
    '2026-04-03 04:27:42',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    50,
    9,
    30,
    1.000,
    1.000,
    22.9000,
    10.0000,
    'frasco',
    22.90,
    '2026-04-03 04:27:42',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    51,
    9,
    31,
    1.000,
    1.000,
    24.9000,
    10.0000,
    'frasco',
    24.90,
    '2026-04-03 04:27:42',
    '2026-04-03 04:28:03'
  );
INSERT INTO
  `pedidos_compra_itens` (
    `id`,
    `pedido_id`,
    `materia_prima_id`,
    `quantidade_pedida`,
    `quantidade_recebida`,
    `preco_unitario`,
    `fator_conversao`,
    `unidade_compra`,
    `subtotal`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    52,
    10,
    32,
    1.000,
    1.000,
    15.9000,
    10.0000,
    'frasco',
    15.90,
    '2026-04-03 04:33:35',
    '2026-04-03 04:33:45'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: produtos
# ------------------------------------------------------------

INSERT INTO
  `produtos` (
    `id`,
    `codigo`,
    `nome`,
    `formula_id`,
    `unidade_medida_id`,
    `preco_custo`,
    `preco_venda`,
    `estoque_atual`,
    `estoque_minimo`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    '',
    'Perfume',
    NULL,
    4,
    8.0000,
    15.00,
    0.000,
    1.000,
    1,
    '2026-03-21 02:24:03',
    '2026-03-21 02:24:32'
  );
INSERT INTO
  `produtos` (
    `id`,
    `codigo`,
    `nome`,
    `formula_id`,
    `unidade_medida_id`,
    `preco_custo`,
    `preco_venda`,
    `estoque_atual`,
    `estoque_minimo`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'SABGLIREFRES',
    'Sabonete de Glicerina Refrescante ',
    NULL,
    5,
    4.5016,
    0.00,
    5.000,
    0.000,
    1,
    '2026-04-10 18:15:36',
    '2026-04-10 19:27:05'
  );
INSERT INTO
  `produtos` (
    `id`,
    `codigo`,
    `nome`,
    `formula_id`,
    `unidade_medida_id`,
    `preco_custo`,
    `preco_venda`,
    `estoque_atual`,
    `estoque_minimo`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    'SABCAMESFO',
    'Sabonete Camomila Esfoliante',
    NULL,
    5,
    4.3821,
    0.00,
    10.000,
    0.000,
    1,
    '2026-04-10 19:10:22',
    '2026-04-10 19:11:25'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sequelizemeta
# ------------------------------------------------------------

INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('001-create-usuarios.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('002-create-fornecedores.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('003-create-unidades-categorias.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('004-create-materias-primas.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('005-create-compras.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('006-create-formulas.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('007-create-producao-produtos.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('008-add-site-to-fornecedores.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('009-add-frete-to-pedidos-compra.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('010-add-fator-conversao-to-itens-compra.js');
INSERT INTO
  `sequelizemeta` (`name`)
VALUES
  ('011-add-produto-id-to-ordens-producao.js');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: unidades_medida
# ------------------------------------------------------------

INSERT INTO
  `unidades_medida` (`id`, `nome`, `sigla`, `created_at`, `updated_at`)
VALUES
  (
    1,
    'Quilograma',
    'kg',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `unidades_medida` (`id`, `nome`, `sigla`, `created_at`, `updated_at`)
VALUES
  (
    2,
    'Grama',
    'g',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `unidades_medida` (`id`, `nome`, `sigla`, `created_at`, `updated_at`)
VALUES
  (
    3,
    'Litro',
    'L',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `unidades_medida` (`id`, `nome`, `sigla`, `created_at`, `updated_at`)
VALUES
  (
    4,
    'Mililitro',
    'ml',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `unidades_medida` (`id`, `nome`, `sigla`, `created_at`, `updated_at`)
VALUES
  (
    5,
    'Unidade',
    'un',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );
INSERT INTO
  `unidades_medida` (`id`, `nome`, `sigla`, `created_at`, `updated_at`)
VALUES
  (
    6,
    'Peça',
    'pc',
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: usuarios
# ------------------------------------------------------------

INSERT INTO
  `usuarios` (
    `id`,
    `nome`,
    `email`,
    `senha_hash`,
    `perfil`,
    `ativo`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'Administrador',
    'admin@fabrica.com',
    '$2b$10$MMaI2f8OOeicaRGV.enMQun3JAtpUAyOWbunRlod8vxtgJNPFgXdu',
    'admin',
    1,
    '2026-03-21 01:21:54',
    '2026-03-21 01:21:54'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
