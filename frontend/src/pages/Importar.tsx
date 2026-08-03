import { Upload, FileText, CheckCircle, AlertCircle, Clock, Loader2, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import { importApi, type ImportSession, type Dataset } from '../lib/api';

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

export default function Importar() {
  const [dragging, setDragging] = useState(false);
  const [session, setSession] = useState<ImportSession | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [committingId, setCommittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Uma sessão agrupa os arquivos enviados nesta visita à página — nada
  // entra nas tabelas reais até você clicar em "Confirmar" em cada dataset.
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
      // A partir daqui o CDC (Debezium -> Kafka -> cdc-worker) reindexa no
      // Elasticsearch e invalida o cache do indicators-service em tempo
      // real — o Dashboard já reflete o dado novo na próxima visita, sem
      // precisar reiniciar nada.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao confirmar importação.');
      setDatasets(prev => prev.map(d => d.id === datasetId ? { ...d, status: 'erro' } : d));
    } finally {
      setCommittingId(null);
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

        {/* Colunas esperadas por tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Dados Epidemiológicos', desc: 'Colunas: municipio, agravo, competencia, casos, obitos' },
            { label: 'Dados Climáticos', desc: 'Colunas: municipio, data, chuva_mm, temp_media, temp_max, temp_min, umidade_pct' },
            { label: 'Vulnerabilidade', desc: 'Colunas: municipio, dimensao, valor, competencia' },
          ].map(t => (
            <div key={t.label} className="bg-surface-card border border-border rounded-md px-4 py-3.5">
              <p className="text-[13px] font-semibold text-text-primary mb-1">{t.label}</p>
              <p className="text-xs text-text-muted leading-relaxed">{t.desc}</p>
            </div>
          ))}
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
