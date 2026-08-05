-- ================================================================
-- Seed: PET-Saúde Clima — Territórios do Piauí
-- Rodar com: docker exec -i postgres psql -U petsaude -d petsaude < backend/migrations/seeds/seed_pet_saude.sql
-- ================================================================

-- ── Municípios (coordenadas e dados usados hoje como mock no frontend) ──
INSERT INTO municipios (id, nome, uf, lat, lng, populacao) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Teresina',     'PI', -5.0892, -42.8019, 868075),
  ('10000000-0000-0000-0000-000000000002', 'Parnaíba',     'PI', -2.9047, -41.7769, 153482),
  ('10000000-0000-0000-0000-000000000003', 'Picos',        'PI', -7.0769, -41.4666, 78383),
  ('10000000-0000-0000-0000-000000000004', 'Floriano',     'PI', -6.7670, -43.0225, 60906),
  ('10000000-0000-0000-0000-000000000005', 'Campo Maior',  'PI', -4.8272, -42.1693, 47958),
  ('10000000-0000-0000-0000-000000000006', 'Barras',       'PI', -4.2432, -42.2939, 46499)
ON CONFLICT DO NOTHING;

-- ── Indicadores epidemiológicos: série mensal Dez–Jul, dengue e leptospirose ──
-- (equivalente ao monthlyData hoje hardcoded em frontend/src/data/Data.ts)
DO $$
DECLARE
  meses  DATE[]  := ARRAY['2025-12-01','2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01','2026-07-01']::DATE[];
  dengue INT[]   := ARRAY[1200,1800,3100,4800,3600,2200,1400,1900];
  lepto  INT[]   := ARRAY[340,420,710,1100,950,640,390,460];
  chuva  NUMERIC[] := ARRAY[110,190,280,380,312,210,85,60];
  m      UUID := '10000000-0000-0000-0000-000000000001'; -- Teresina como referência estadual
  i      INT;
BEGIN
  FOR i IN 1..8 LOOP
    INSERT INTO indicadores_epidemiologicos (municipio_id, agravo, competencia, casos, obitos, incidencia_100k, fonte)
    VALUES (m, 'dengue', meses[i], dengue[i], GREATEST(dengue[i]/400,0), ROUND((dengue[i]::NUMERIC / 868075) * 100000, 2), 'SINAN')
    ON CONFLICT (municipio_id, agravo, competencia) DO UPDATE SET casos = EXCLUDED.casos;

    INSERT INTO indicadores_epidemiologicos (municipio_id, agravo, competencia, casos, obitos, incidencia_100k, fonte)
    VALUES (m, 'leptospirose', meses[i], lepto[i], GREATEST(lepto[i]/200,0), ROUND((lepto[i]::NUMERIC / 868075) * 100000, 2), 'SINAN')
    ON CONFLICT (municipio_id, agravo, competencia) DO UPDATE SET casos = EXCLUDED.casos;

    INSERT INTO indicadores_climaticos (municipio_id, data_ref, chuva_mm, temp_media, fonte)
    VALUES (m, meses[i], chuva[i], 28.5, 'INMET')
    ON CONFLICT (municipio_id, data_ref) DO UPDATE SET chuva_mm = EXCLUDED.chuva_mm;
  END LOOP;
END $$;

-- ── Casos por município (mapa de risco) ──────────────────────────
INSERT INTO indicadores_epidemiologicos (municipio_id, agravo, competencia, casos, incidencia_100k, fonte) VALUES
  ('10000000-0000-0000-0000-000000000002', 'dengue', '2026-07-01', 1204, ROUND(1204.0/153482*100000,2), 'SINAN'),
  ('10000000-0000-0000-0000-000000000003', 'dengue', '2026-07-01', 987,  ROUND(987.0/78383*100000,2),  'SINAN'),
  ('10000000-0000-0000-0000-000000000004', 'dengue', '2026-07-01', 432,  ROUND(432.0/60906*100000,2),  'SINAN'),
  ('10000000-0000-0000-0000-000000000005', 'dengue', '2026-07-01', 321,  ROUND(321.0/47958*100000,2),  'SINAN'),
  ('10000000-0000-0000-0000-000000000006', 'dengue', '2026-07-01', 198,  ROUND(198.0/46499*100000,2),  'SINAN')
ON CONFLICT (municipio_id, agravo, competencia) DO UPDATE SET casos = EXCLUDED.casos;

-- ── Vulnerabilidade socioambiental ────────────────────────────────
INSERT INTO indices_vulnerabilidade (municipio_id, dimensao, valor, competencia) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Exposição climática', 81, '2026-07-01'),
  ('10000000-0000-0000-0000-000000000001', 'Saneamento básico',   72, '2026-07-01'),
  ('10000000-0000-0000-0000-000000000001', 'Renda familiar',      65, '2026-07-01'),
  ('10000000-0000-0000-0000-000000000001', 'Acesso à saúde',      58, '2026-07-01'),
  ('10000000-0000-0000-0000-000000000001', 'Cobertura vacinal',   44, '2026-07-01')
ON CONFLICT (municipio_id, dimensao, competencia) DO UPDATE SET valor = EXCLUDED.valor;

-- ── Alertas ────────────────────────────────────────────────────────
INSERT INTO alertas (municipio_id, titulo, nivel, descricao, status) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Surto de dengue — Teresina',            'alto',  'Aumento expressivo de notificações na última semana epidemiológica.', 'ativo'),
  ('10000000-0000-0000-0000-000000000002', 'Chuvas intensas — Parnaíba',            'medio', 'Volume pluviométrico acima da média histórica para o período.', 'ativo'),
  ('10000000-0000-0000-0000-000000000001', 'Leptospirose — Zona Norte',             'alto',  'Casos concentrados em áreas de alagamento recorrente.', 'ativo'),
  ('10000000-0000-0000-0000-000000000004', 'Monitorar situação — Floriano',         'baixo', 'Sem indicativo de agravamento no momento.', 'ativo'),
  ('10000000-0000-0000-0000-000000000003', 'Dengue tipo 3 confirmado — Picos',      'alto',  'Confirmação laboratorial de sorotipo circulante.', 'ativo'),
  ('10000000-0000-0000-0000-000000000005', 'Índice de mosquito elevado',            'medio', 'Levantamento entomológico indica infestação predial acima do limiar.', 'ativo')
ON CONFLICT DO NOTHING;

-- ── GATs (Grupos de Aprendizagem Tutorial) — conforme plano de trabalho ──
INSERT INTO gats (numero, eixo, nome, objetivo) VALUES
  (1, 'I',   'Vigilância Epidemiológica e Mudanças Climáticas', 'Monitorar impactos climáticos sobre o perfil epidemiológico.'),
  (2, 'I',   'Território, Geoprocessamento e Vulnerabilidades Socioambientais', 'Mapear vulnerabilidades socioambientais e territoriais.'),
  (3, 'II',  'Promoção da Saúde e Prevenção de Agravos', 'Fortalecer práticas de cuidado e educação em saúde.'),
  (4, 'II',  'Educação em Saúde', 'Educação em saúde e fortalecimento das práticas de cuidado.'),
  (5, 'III', 'Gestão, Inovação e Integração Ensino-Serviço-Comunidade', 'Comunicação e disseminação de conhecimentos.')
ON CONFLICT (numero) DO NOTHING;

-- ── Pesquisadores/alunos vinculados a cada GAT (tela Pesquisadores) ──
DO $$
DECLARE
  g1 UUID := (SELECT id FROM gats WHERE numero = 1);
  g2 UUID := (SELECT id FROM gats WHERE numero = 2);
  g3 UUID := (SELECT id FROM gats WHERE numero = 3);
  g4 UUID := (SELECT id FROM gats WHERE numero = 4);
  g5 UUID := (SELECT id FROM gats WHERE numero = 5);
  teresina UUID := '10000000-0000-0000-0000-000000000001';
  parnaiba UUID := '10000000-0000-0000-0000-000000000002';
  picos    UUID := '10000000-0000-0000-0000-000000000003';
BEGIN
  INSERT INTO pesquisadores (gat_id, nome, perfil, curso, instituicao, municipio_id) VALUES
    (g1, 'Profª. Ana Beatriz Coelho',   'Tutora',                'Enfermagem',            'UESPI', teresina),
    (g1, 'Lucas Ferreira Nunes',        'Aluno',                 'Enfermagem',            'UESPI', teresina),
    (g1, 'Mariana Sales Rocha',         'Aluno',                 'Medicina',              'UESPI', teresina),
    (g2, 'Prof. Ricardo Pontes Lima',   'Tutor Coordenador',     'Geografia',             'UESPI', teresina),
    (g2, 'João Vitor Araújo Melo',      'Aluno',                 'Geografia',             'UESPI', parnaiba),
    (g3, 'Profª. Camila dos Santos',    'Preceptora',            'Fisioterapia',          'UESPI', teresina),
    (g3, 'Beatriz Lima Carvalho',       'Aluno',                 'Fisioterapia',          'UESPI', picos),
    (g4, 'Prof. Eduardo Nascimento',    'Orientador de Serviço', 'Odontologia',           'UESPI', teresina),
    (g4, 'Rafaela Moura Batista',       'Aluno',                 'Odontologia',           'UESPI', teresina),
    (g5, 'Profª. Patrícia Alves Souza', 'Tutora',                'Sistemas de Informação','UESPI', teresina),
    (g5, 'Gabriel Henrique Rodrigues',  'Aluno',                 'Sistemas de Informação','UESPI', teresina)
  ON CONFLICT DO NOTHING;
END $$;

-- ── Conteúdos de orientação (tela Prevenção — plataforma dos alunos) ──
-- Fichas de referência das 4 doenças (equivalente ao preventionContent
-- hardcoded que existia em data/Data.ts) já entram como conteúdo real,
-- publicadas pela coordenação; os alunos passam a poder complementar
-- com vídeos/relatos/dicas próprios via POST /api/conteudos.
INSERT INTO conteudos_orientacao (titulo, tipo, doenca, resumo, corpo, url, autor_nome, autor_perfil, status) VALUES
  ('Dengue: o que é e como se prevenir', 'artigo', 'Dengue',
   'Doença viral transmitida pelo mosquito Aedes aegypti. Sintomas: febre alta, dores no corpo e manchas na pele.',
   'Medidas de prevenção: eliminar água parada em recipientes; usar repelente regularmente; instalar telas em janelas e portas; verificar calhas e pneus.',
   'https://www.gov.br/saude/dengue', 'Coordenação PET-Saúde', 'Tutor', 'publicado'),
  ('Leptospirose: cuidados em época de enchente', 'artigo', 'Leptospirose',
   'Doença bacteriana transmitida pela urina de ratos. O risco aumenta em períodos de enchentes.',
   'Medidas de prevenção: evitar contato com água de enchente; usar botas e luvas ao limpar locais alagados; vacinar animais domésticos; controle de roedores.',
   'https://www.gov.br/saude/leptospirose', 'Coordenação PET-Saúde', 'Tutor', 'publicado'),
  ('Malária: transmissão e prevenção', 'artigo', 'Malária',
   'Doença parasitária transmitida pelo mosquito Anopheles. Sintomas: febre, calafrios e anemia.',
   'Medidas de prevenção: usar mosquiteiros tratados com inseticida; aplicar repelente após o entardecer; tratamento profilático em áreas endêmicas; diagnóstico precoce.',
   'https://www.gov.br/saude/malaria', 'Coordenação PET-Saúde', 'Tutor', 'publicado'),
  ('Chikungunya: sintomas e cuidados', 'artigo', 'Chikungunya',
   'Vírus transmitido pelo Aedes aegypti e Aedes albopictus. Causa febre e dores articulares intensas.',
   'Medidas de prevenção: mesmas medidas de combate ao mosquito da dengue; repouso e hidratação; evitar aspirina como analgésico; monitoramento médico.',
   'https://www.gov.br/saude/chikungunya', 'Coordenação PET-Saúde', 'Tutor', 'publicado'),
  ('Relato de campo: ação de combate à dengue em Teresina', 'relato', 'Dengue',
   'Relato de visita domiciliar do GAT de Vigilância Epidemiológica em bairro com alta incidência.',
   'Durante a visita, identificamos criadouros em vasos de planta e caixas d''água sem tampa. Orientamos 32 famílias sobre eliminação de focos.',
   NULL, 'Lucas Ferreira Nunes', 'Aluno', 'publicado'),
  ('Dica rápida: como identificar focos do mosquito em casa', 'dica', 'Dengue',
   'Checklist simples para inspeção residencial semanal.',
   'Verifique pratinhos de vaso, calhas, garrafas viradas para baixo, ralos com tela e caixas d''água sempre tampadas.',
   NULL, 'Mariana Sales Rocha', 'Aluno', 'publicado')
ON CONFLICT DO NOTHING;
