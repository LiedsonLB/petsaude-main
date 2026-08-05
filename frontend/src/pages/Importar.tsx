import { Upload, FileText, CheckCircle, AlertCircle, Clock, Loader2, ChevronRight, Download, FileSpreadsheet, Info } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import { importApi, type ImportSession, type Dataset } from '../lib/api';
import * as XLSX from 'xlsx';

const statusConfig = {
  processado: { classes: 'text-success bg-success-bg', label: 'Processado', Icon: CheckCircle },
  pendente:   { classes: 'text-warning bg-warning-bg', label: 'Pendente em revisão', Icon: Clock },
  erro:       { classes: 'text-danger bg-danger-bg', label: 'Erro', Icon: AlertCircle },
};

const tipoLabel: Record<string, string> = {
  epidemiologico: 'Epidemiológico',
  climatico: 'Climático',
  vulnerabilidade: 'Vulnerabilidade',
};

// Templates com os nomes de colunas EXATOS que o backend espera (sem acentos)
const templates: Record<string, { columns: string[], headers: string[] }> = {
  epidemiologico: {
    columns: ['municipio', 'agravo', 'competencia', 'casos', 'obitos'],
    headers: ['municipio', 'agravo', 'competencia', 'casos', 'obitos'], // nomes EXATOS
  },
  climatico: {
    columns: ['municipio', 'data', 'chuva_mm', 'temp_media', 'temp_max', 'temp_min', 'umidade_pct'],
    headers: ['municipio', 'data', 'chuva_mm', 'temp_media', 'temp_max', 'temp_min', 'umidade_pct'], // nomes EXATOS
  },
  vulnerabilidade: {
    columns: ['municipio', 'dimensao', 'valor', 'competencia'],
    headers: ['municipio', 'dimensao', 'valor', 'competencia'], // nomes EXATOS
  }
};

// Exemplos para exibir na tela (com descrições amigáveis)
const exemplosPorTipo: Record<string, { descricao: string, exemplo: Record<string, any>, colunasAmigaveis: Record<string, string> }> = {
  epidemiologico: {
    descricao: 'Registros de casos e óbitos por agravo',
    colunasAmigaveis: {
      municipio: 'Município',
      agravo: 'Agravo',
      competencia: 'Competência (ano-mês)',
      casos: 'Casos',
      obitos: 'Óbitos'
    },
    exemplo: {
      municipio: 'Teresina',
      agravo: 'Dengue',
      competencia: '2026-01',
      casos: 120,
      obitos: 2
    }
  },
  climatico: {
    descricao: 'Dados meteorológicos por município e data',
    colunasAmigaveis: {
      municipio: 'Município',
      data: 'Data (YYYY-MM-DD)',
      chuva_mm: 'Chuva (mm)',
      temp_media: 'Temp. Média (°C)',
      temp_max: 'Temp. Máxima (°C)',
      temp_min: 'Temp. Mínima (°C)',
      umidade_pct: 'Umidade (%)'
    },
    exemplo: {
      municipio: 'Teresina',
      data: '2026-01-01',
      chuva_mm: 18.5,
      temp_media: 29.3,
      temp_max: 34.2,
      temp_min: 24.1,
      umidade_pct: 74
    }
  },
  vulnerabilidade: {
    descricao: 'Índices de vulnerabilidade por dimensão',
    colunasAmigaveis: {
      municipio: 'Município',
      dimensao: 'Dimensão',
      valor: 'Valor (0-1)',
      competencia: 'Competência (ano-mês)'
    },
    exemplo: {
      municipio: 'Teresina',
      dimensao: 'Saneamento',
      valor: 0.72,
      competencia: '2026-01'
    }
  }
};

export default function Importar() {
  const [dragging, setDragging] = useState(false);
  const [session, setSession] = useState<ImportSession | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [committingId, setCommittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'epidemiologico' | 'climatico' | 'vulnerabilidade'>('epidemiologico');
  const [selectedExtensao, setSelectedExtensao] = useState<'csv' | 'xlsx'>('csv');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    importApi.createSession().then(setSession).catch(() => setError(
      'Não foi possível abrir uma sessão de importação — verifique se o import-service está no ar.'
    ));
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !session) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const dataset = await importApi.upload(session.id, file);
        setDatasets(prev => [dataset, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  }, [session]);

  const handleCommit = async (datasetId: string) => {
    setCommittingId(datasetId);
    setError(null);
    try {
      await importApi.commitDataset(datasetId);
      setDatasets(prev => prev.map(d => d.id === datasetId ? { ...d, status: 'processado' } : d));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao confirmar importação.');
      setDatasets(prev => prev.map(d => d.id === datasetId ? { ...d, status: 'erro' } : d));
    } finally {
      setCommittingId(null);
    }
  };

  const downloadTemplate = () => {
    const template = templates[selectedTemplate];
    // Apenas cabeçalhos (nomes EXATOS que o backend espera)
    const data: any[][] = [template.headers];

    // Adiciona 10 linhas em branco para preenchimento
    for (let i = 0; i < 10; i++) {
      data.push(template.columns.map(() => ''));
    }

    if (selectedExtensao === 'csv') {
      const csvContent = data.map(row => 
        row.map(cell => {
          const strCell = String(cell);
          return strCell.includes(',') || strCell.includes('"') || strCell.includes('\n') 
            ? `"${strCell.replace(/"/g, '""')}"` 
            : strCell;
        }).join(',')
      ).join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_${selectedTemplate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = template.columns.map(() => ({ wch: 20 }));
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template_${selectedTemplate}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        setError('Erro ao gerar arquivo XLSX. Verifique se a biblioteca xlsx está instalada corretamente.');
        console.error('XLSX error:', err);
      }
    }
  };

  return (
    <>
      <Topbar title="Importar Dados" subtitle="Carregue planilhas CSV/XLSX com dados epidemiológicos, climáticos ou de vulnerabilidade" />
      <main className="p-5 flex flex-col gap-4 overflow-y-auto">

        {error && (
          <div className="rounded-lg border border-danger bg-danger-bg text-danger text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`rounded-lg border-2 border-dashed px-5 py-10 text-center cursor-pointer transition-colors
            ${dragging ? 'border-primary bg-primary-light' : 'border-border bg-surface-card'}`}
        >
          {uploading ? (
            <Loader2 size={32} className="mx-auto mb-3 animate-spin text-primary" />
          ) : (
            <Upload size={32} className={`mx-auto mb-3 ${dragging ? 'text-primary' : 'text-text-muted'}`} aria-hidden="true" />
          )}
          <p className="text-sm font-medium text-text-primary mb-1.5">
            {uploading ? 'Enviando e validando...' : 'Arraste planilhas aqui ou clique para selecionar'}
          </p>
          <p className="text-xs text-text-muted">
            .csv ou .xlsx — o tipo (epidemiológico / climático / vulnerabilidade) é detectado pelas colunas
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {/* Colunas esperadas por tipo com exemplo inline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { 
              key: 'epidemiologico',
              label: 'Dados Epidemiológicos', 
              desc: 'municipio, agravo, competencia, casos, obitos',
              exemplo: exemplosPorTipo.epidemiologico
            },
            { 
              key: 'climatico',
              label: 'Dados Climáticos', 
              desc: 'municipio, data, chuva_mm, temp_media, temp_max, temp_min, umidade_pct',
              exemplo: exemplosPorTipo.climatico
            },
            { 
              key: 'vulnerabilidade',
              label: 'Vulnerabilidade', 
              desc: 'municipio, dimensao, valor, competencia',
              exemplo: exemplosPorTipo.vulnerabilidade
            },
          ].map(t => (
            <div key={t.key} className="bg-surface-card border border-border rounded-md px-4 py-3.5 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-text-primary mb-1">{t.label}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed font-mono">{t.desc}</p>
                </div>
                <div className="relative">
                  <Info size={14} className="text-text-muted cursor-help flex-shrink-0 mt-0.5" />
                  <div className="absolute right-0 top-6 w-72 bg-surface-card border border-border rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <p className="text-[10px] font-medium text-text-secondary mb-1.5">Exemplo de preenchimento:</p>
                    <div className="bg-surface-input rounded p-2 text-[10px] font-mono text-text-primary">
                      {Object.entries(t.exemplo.exemplo).map(([key, value]) => {
                        const labelAmigavel = t.exemplo.colunasAmigaveis[key] || key;
                        return (
                          <div key={key} className="flex justify-between gap-4 py-0.5 border-b border-border/30 last:border-0">
                            <span className="text-text-muted">{labelAmigavel}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5">
                      ⚠️ Use exatamente os nomes das colunas em minúsculo e sem acentos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Template Download */}
        <div className="bg-surface-card border border-border rounded-lg px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <FileSpreadsheet size={18} className="text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-text-primary">Baixar template de planilha</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value as any)}
                className="bg-surface-input border border-border rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="epidemiologico">Epidemiológico</option>
                <option value="climatico">Climático</option>
                <option value="vulnerabilidade">Vulnerabilidade</option>
              </select>
              <select
                value={selectedExtensao}
                onChange={e => setSelectedExtensao(e.target.value as any)}
                className="bg-surface-input border border-border rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="csv">.CSV</option>
                <option value="xlsx">.XLSX</option>
              </select>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1.5 bg-primary text-white rounded px-4 py-1.5 text-xs font-medium hover:bg-primary-dark transition-colors"
              >
                <Download size={14} />
                Baixar template
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Info size={12} className="text-text-muted flex-shrink-0" />
            <p className="text-[11px] text-text-muted">
              O template usa os nomes de colunas <strong>exatos</strong> que o sistema espera (minúsculo, sem acentos).
              Passe o mouse no ícone <Info size={10} className="inline text-text-muted" /> dos cards acima para ver exemplos.
            </p>
          </div>
        </div>

        {/* Datasets desta sessão */}
        <Card title="Conjuntos de Dados desta Sessão" icon={<FileText size={15} />} noPad>
          {datasets.length === 0 ? (
            <p className="text-xs text-text-muted px-4 py-6 text-center">
              Nenhum arquivo enviado ainda nesta sessão.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Nome do arquivo', 'Tipo', 'Registros', 'Inválidos', 'Status', ''].map(h => (
                      <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-semibold text-text-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasets.map(d => {
                    const cfg = statusConfig[d.status] ?? statusConfig.pendente;
                    return (
                      <tr key={d.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                        <td className="px-3.5 py-2.5 text-text-primary font-medium">{d.nome_arquivo}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="bg-surface-input rounded px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                            {tipoLabel[d.tipo] ?? d.tipo}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-text-secondary">{d.registros.toLocaleString('pt-BR')}</td>
                        <td className="px-3.5 py-2.5 text-text-secondary">
                          {d.registros_invalidos > 0
                            ? <span className="text-warning font-medium">{d.registros_invalidos}</span>
                            : '—'}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>
                            <cfg.Icon size={10} aria-hidden="true" /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          {d.status === 'pendente' && (
                            <button
                              onClick={() => handleCommit(d.id)}
                              disabled={committingId === d.id || d.registros_invalidos === d.registros}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:bg-primary-light rounded px-2 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {committingId === d.id ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />}
                              Confirmar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}