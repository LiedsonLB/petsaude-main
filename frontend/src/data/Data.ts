export const kpiData = [
  { label: 'Casos Notificados', value: '14.806', delta: '+8%', deltaType: 'up', sub: 'vs. semana anterior' },
  { label: 'Municípios em Alerta', value: '37', delta: '+5', deltaType: 'up', sub: 'municípios novos' },
  { label: 'Índice Pluviométrico', value: '312mm', delta: '–', deltaType: 'neutral', sub: 'Período chuvoso' },
  { label: 'Risco Climático', value: 'Alto', delta: '↑', deltaType: 'up', sub: 'Piauí / Maranhão' },
];

export const monthlyData = [
  { mes: 'Dez', dengue: 1200, lepto: 340, chuva: 110 },
  { mes: 'Jan', dengue: 1800, lepto: 420, chuva: 190 },
  { mes: 'Fev', dengue: 3100, lepto: 710, chuva: 280 },
  { mes: 'Mar', dengue: 4800, lepto: 1100, chuva: 380 },
  { mes: 'Abr', dengue: 3600, lepto: 950, chuva: 312 },
  { mes: 'Mai', dengue: 2200, lepto: 640, chuva: 210 },
  { mes: 'Jun', dengue: 1400, lepto: 390, chuva: 85 },
  { mes: 'Jul', dengue: 1900, lepto: 460, chuva: 60 },
];

export const alertsData = [
  { id: 1, title: 'Surto de dengue — Teresina', level: 'alto', time: '2h atrás', region: 'Teresina, PI' },
  { id: 2, title: 'Chuvas intensas — Parnaíba', level: 'medio', time: '5h atrás', region: 'Parnaíba, PI' },
  { id: 3, title: 'Leptospirose — Zona Norte PI', level: 'alto', time: '1d atrás', region: 'Norte PI' },
  { id: 4, title: 'Monitorar situação — Floriano', level: 'baixo', time: '1d atrás', region: 'Floriano, PI' },
  { id: 5, title: 'Temperatura +3°C acima da média', level: 'medio', time: '2d atrás', region: 'Centro-Norte PI' },
  { id: 6, title: 'Dengue tipo 3 confirmado — Picos', level: 'alto', time: '2d atrás', region: 'Picos, PI' },
  { id: 7, title: 'Índice de mosquito elevado — Campo Maior', level: 'medio', time: '3d atrás', region: 'Campo Maior, PI' },
];

export const vulnerabilityData = [
  { label: 'Exposição climática', value: 81, color: '#d03b3b' },
  { label: 'Saneamento básico', value: 72, color: '#d03b3b' },
  { label: 'Renda familiar', value: 65, color: '#eda100' },
  { label: 'Acesso à saúde', value: 58, color: '#eda100' },
  { label: 'Cobertura vacinal', value: 44, color: '#1baf7a' },
];

export const municipiosRisco = [
  { nome: 'Teresina', casos: 4823, risco: 'alto', lat: -5.0892, lng: -42.8019 },
  { nome: 'Parnaíba', casos: 1204, risco: 'medio', lat: -2.9047, lng: -41.7769 },
  { nome: 'Picos', casos: 987, risco: 'alto', lat: -7.0769, lng: -41.4666 },
  { nome: 'Floriano', casos: 432, risco: 'medio', lat: -6.7670, lng: -43.0225 },
  { nome: 'Campo Maior', casos: 321, risco: 'medio', lat: -4.8272, lng: -42.1693 },
  { nome: 'Barras', casos: 198, risco: 'baixo', lat: -4.2432, lng: -42.2939 },
];

export const stateIncidenceData = [
  { uf: 'PI', value: 7.1, casos: 14806 },
  { uf: 'MA', value: 15.5, casos: 48200 },
  { uf: 'CE', value: 11.3, casos: 32100 },
  { uf: 'RN', value: 20.9, casos: 45000 },
  { uf: 'PB', value: 11.2, casos: 22800 },
  { uf: 'PE', value: 10.1, casos: 36700 },
  { uf: 'AL', value: 15.1, casos: 24500 },
  { uf: 'SE', value: 4.4, casos: 10200 },
  { uf: 'BA', value: 9.6, casos: 42300 },
  { uf: 'GO', value: 39.6, casos: 112000 },
  { uf: 'MS', value: 42.9, casos: 98000 },
  { uf: 'MG', value: 37, casos: 234000 },
];

export const preventionContent = [
  {
    id: 1,
    doenca: 'Dengue',
    icon: '🦟',
    risco: 'alto',
    descricao: 'Doença viral transmitida pelo mosquito Aedes aegypti. Sintomas: febre alta, dores no corpo e manchas na pele.',
    prevencao: ['Eliminar água parada em recipientes', 'Usar repelente regularmente', 'Instalar telas em janelas e portas', 'Verificar calhas e pneus'],
    link: 'https://www.gov.br/saude/dengue',
  },
  {
    id: 2,
    doenca: 'Leptospirose',
    icon: '🌊',
    risco: 'alto',
    descricao: 'Doença bacteriana transmitida pela urina de ratos. Risco aumenta em períodos de enchentes.',
    prevencao: ['Evitar contato com água de enchente', 'Usar botas e luvas ao limpar locais alagados', 'Vacinar animais domésticos', 'Controle de roedores'],
    link: 'https://www.gov.br/saude/leptospirose',
  },
  {
    id: 3,
    doenca: 'Malária',
    icon: '🩸',
    risco: 'medio',
    descricao: 'Doença parasitária transmitida pelo mosquito Anopheles. Sintomas: febre, calafrios e anemia.',
    prevencao: ['Usar mosquiteiros tratados com inseticida', 'Aplicar repelente após o entardecer', 'Tratamento profilático para áreas endêmicas', 'Diagnóstico precoce'],
    link: 'https://www.gov.br/saude/malaria',
  },
  {
    id: 4,
    doenca: 'Chikungunya',
    icon: '🦴',
    risco: 'medio',
    descricao: 'Vírus transmitido pelo Aedes aegypti e Aedes albopictus. Causa febre e dores articulares intensas.',
    prevencao: ['Mesmas medidas que dengue', 'Repouso e hidratação', 'Evitar aspirina como analgésico', 'Monitoramento médico'],
    link: 'https://www.gov.br/saude/chikungunya',
  },
];

export const uploadedDatasets = [
  { id: 1, nome: 'sinan_dengue_2024_PI.csv', tipo: 'CSV', tamanho: '2.3 MB', status: 'processado', data: '2026-12-15', registros: 14806 },
  { id: 2, nome: 'clima_inmet_jan2025.xlsx', tipo: 'XLSX', tamanho: '1.1 MB', status: 'processado', data: '2025-01-10', registros: 4380 },
  { id: 3, nome: 'relatorio_campo_norte.txt', tipo: 'TXT', tamanho: '48 KB', status: 'pendente', data: '2025-01-18', registros: null },
  { id: 4, nome: 'vulnerabilidade_municipios.csv', tipo: 'CSV', tamanho: '890 KB', status: 'erro', data: '2025-01-19', registros: null },
];