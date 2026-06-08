import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight, Trash2 } from 'lucide-react';

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
  return { headers, rows };
}

export default function CsvImportModal({ open, onClose, onImport, fields, title, helpText }) {
  const [step, setStep] = useState('upload'); // upload | preview | mapping | done
  const [csvData, setCsvData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef(null);

  const resetState = () => {
    setStep('upload');
    setCsvData(null);
    setMapping({});
    setError('');
    setImportedCount(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Selecione um arquivo .csv');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { headers, rows } = parseCsv(e.target.result);
        if (headers.length === 0 || rows.length === 0) {
          setError('Arquivo CSV vazio ou formato inválido.');
          return;
        }
        setCsvData({ headers, rows, fileName: file.name });

        // Auto-map columns
        const autoMap = {};
        fields.forEach(field => {
          const matchHeader = headers.find(h =>
            h.toLowerCase().replace(/[_\s-]/g, '') === field.key.toLowerCase().replace(/[_\s-]/g, '') ||
            (field.aliases || []).some(a => h.toLowerCase().replace(/[_\s-]/g, '').includes(a.toLowerCase().replace(/[_\s-]/g, '')))
          );
          if (matchHeader) autoMap[field.key] = matchHeader;
        });
        setMapping(autoMap);
        setStep('preview');
      } catch (err) {
        setError('Erro ao processar o arquivo CSV.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  }, [fields]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleFileInput = (e) => {
    processFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!csvData) return;
    const requiredFields = fields.filter(f => f.required);
    const missingRequired = requiredFields.filter(f => !mapping[f.key]);
    if (missingRequired.length > 0) {
      setError(`Mapeie os campos obrigatórios: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    const mapped = csvData.rows.map(row => {
      const item = {};
      fields.forEach(field => {
        const csvCol = mapping[field.key];
        if (csvCol && row[csvCol] !== undefined) {
          let val = row[csvCol];
          if (field.type === 'number') {
            val = val.replace(/[^\d.,-]/g, '').replace(',', '.');
            val = parseFloat(val) || 0;
          }
          item[field.key] = val;
        } else if (field.defaultValue !== undefined) {
          item[field.key] = field.defaultValue;
        }
      });
      return item;
    }).filter(item => {
      // Filter out rows where required number fields are 0 or empty
      return requiredFields.every(f => {
        if (f.type === 'number') return item[f.key] > 0;
        return item[f.key] && item[f.key].toString().trim() !== '';
      });
    });

    if (mapped.length === 0) {
      setError('Nenhum registro válido encontrado no CSV.');
      return;
    }

    onImport(mapped);
    setImportedCount(mapped.length);
    setStep('done');
  };

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={handleClose} />
      <div className="drawer animate-slide csv-import-drawer">
        <div className="drawer-title">
          <span><FileSpreadsheet size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />{title || 'Importar CSV'}</span>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}><X size={18} /></button>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="csv-upload-step">
            <div
              className={`csv-dropzone ${dragOver ? 'csv-dropzone-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="csv-dropzone-icon">
                <Upload size={32} />
              </div>
              <p className="csv-dropzone-text">Arraste seu arquivo CSV aqui</p>
              <p className="csv-dropzone-sub">ou clique para selecionar</p>
              <span className="badge badge-muted" style={{ marginTop: 12 }}>.CSV</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            {helpText && (
              <div className="csv-help-box">
                <p className="csv-help-title">Formato esperado</p>
                <p className="csv-help-desc">{helpText}</p>
                <div className="csv-fields-list">
                  {fields.map(f => (
                    <span key={f.key} className={`badge ${f.required ? 'badge-coral' : 'badge-muted'}`}>
                      {f.label}{f.required ? ' *' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="csv-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview & Mapping */}
        {step === 'preview' && csvData && (
          <div className="csv-preview-step">
            <div className="csv-file-info">
              <FileSpreadsheet size={18} style={{ color: 'var(--green)' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{csvData.fileName}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{csvData.rows.length} registros · {csvData.headers.length} colunas</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={resetState} style={{ marginLeft: 'auto' }}>
                <Trash2 size={12} /> Trocar
              </button>
            </div>

            <div className="csv-mapping-section">
              <p className="csv-section-label">Mapeamento de Colunas</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                Associe cada campo do sistema a uma coluna do seu CSV
              </p>
              {fields.map(field => (
                <div key={field.key} className="csv-mapping-row">
                  <div className="csv-mapping-field">
                    <span className="csv-mapping-name">{field.label}</span>
                    {field.required && <span className="csv-required-dot" />}
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <select
                    className="select-input csv-mapping-select"
                    value={mapping[field.key] || ''}
                    onChange={e => setMapping({ ...mapping, [field.key]: e.target.value })}
                  >
                    <option value="">— Ignorar —</option>
                    {csvData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview table */}
            <div className="csv-section-label" style={{ marginTop: 20 }}>Pré-visualização (5 primeiros)</div>
            <div className="csv-table-wrapper">
              <table className="csv-table">
                <thead>
                  <tr>
                    {csvData.headers.map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {csvData.rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {csvData.headers.map(h => <td key={h}>{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="csv-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={resetState} style={{ flex: 1 }}>Voltar</button>
              <button className="btn btn-primary" onClick={handleImport} style={{ flex: 2 }}>
                <Upload size={14} /> Importar {csvData.rows.length} registros
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div className="csv-done-step">
            <div className="csv-done-icon">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="csv-done-title">Importação Concluída</h3>
            <p className="csv-done-desc">
              {importedCount} {importedCount === 1 ? 'registro importado' : 'registros importados'} com sucesso.
            </p>
            <button className="btn btn-primary" onClick={handleClose} style={{ marginTop: 20, width: '100%' }}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
