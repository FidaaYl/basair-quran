import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from './common/IconSystem';
import { restApiLogs, subscribeToApiLogs, clearApiLogs, triggerTestApiCall } from '../services/quranApi';
import { 
  fetchNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  simulateHttpStatus 
} from '../services/notesMicroservice';
import './RestApiExplorerModal.css';

const SEED_LOGS = [
  {
    id: 'seed-1',
    timestamp: '14:22:05',
    method: 'GET',
    url: 'https://api.alquran.cloud/v1/surah/1/editions/quran-uthmani,en.sahih,fr.hamidullah',
    status: 200,
    durationMs: 76,
    payloadSize: '4.8 KB',
    data: {
      code: 200,
      status: 'OK',
      data: [
        {
          number: 1,
          name: 'سُورَةُ ٱلْفَاتِحَةِ',
          englishName: 'Al-Faatiha',
          revelationType: 'Meccan',
          numberOfAyahs: 7,
        },
      ],
    },
  },
  {
    id: 'seed-2',
    timestamp: '14:22:08',
    method: 'GET',
    url: 'https://api.quran.com/api/v4/tafsirs/91/by_ayah/1:1',
    status: 200,
    durationMs: 114,
    payloadSize: '1.9 KB',
    data: {
      tafsir: {
        id: 91,
        resource_id: 16,
        text: 'سورة الفاتحة مكية، وآياتها سبع بالاتفاق، وتسمى أم الكتاب والسبع المثاني.',
      },
    },
  },
];

function highlightJson(jsonObj) {
  if (!jsonObj) return '';
  try {
    const jsonStr = typeof jsonObj === 'string' ? jsonObj : JSON.stringify(jsonObj, null, 2);
    const escaped = jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-token-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-token-key';
          } else {
            cls = 'json-token-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-token-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-token-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  } catch {
    return String(jsonObj);
  }
}

export default function RestApiExplorerModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('inspector');
  const [logs, setLogs] = useState(() => (restApiLogs.length > 0 ? [...restApiLogs] : SEED_LOGS));
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isTesting, setIsTesting] = useState(false);

  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSurah, setNewNoteSurah] = useState(1);
  const [newNoteAyah, setNewNoteAyah] = useState(1);
  const [simToken, setSimToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bXlfc2VjdXJlX3Rva2Vu');
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  useEffect(() => {
    fetchNotes().then((res) => {
      if (res?.data) setNotes(res.data);
    });
  }, [activeTab]);

  useEffect(() => {
    return subscribeToApiLogs((newLogs) => {
      setLogs(newLogs.length > 0 ? [...newLogs] : SEED_LOGS);
    });
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (activeFilter === 'get' && item.method !== 'GET') return false;
      if (activeFilter === 'post' && item.method !== 'POST') return false;
      if (activeFilter === 'put' && item.method !== 'PUT') return false;
      if (activeFilter === 'delete' && item.method !== 'DELETE') return false;
      if (activeFilter === 'err' && item.status < 400) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const urlMatch = item.url?.toLowerCase().includes(q);
        const methodMatch = item.method?.toLowerCase().includes(q);
        return urlMatch || methodMatch;
      }
      return true;
    });
  }, [logs, activeFilter, searchQuery]);

  const currentItem = useMemo(() => {
    if (selectedLogId) {
      const found = filteredLogs.find((l) => l.id === selectedLogId) || logs.find((l) => l.id === selectedLogId);
      if (found) return found;
    }
    return filteredLogs[0] || logs[0] || null;
  }, [selectedLogId, filteredLogs, logs]);

  if (!isOpen) return null;

  const TerminalIcon = ICONS.terminal;
  const CloseIcon = ICONS.close;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;
  const SearchIcon = ICONS.search;
  const RefreshIcon = ICONS.refresh;
  const SparklesIcon = ICONS.sparkles;
  const ExternalLinkIcon = ICONS.externalLink;
  const PlusIcon = ICONS.plus;
  const BookIcon = ICONS.mushaf;

  const handleCopyCurl = (item) => {
    if (!item) return;
    const authHeader = simToken ? ` -H "Authorization: Bearer ${simToken}"` : '';
    const curl = `curl -X ${item.method} "${item.url}" -H "Accept: application/json"${authHeader}`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyJson = (item) => {
    if (!item?.data) return;
    const jsonStr = JSON.stringify(item.data, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleTriggerTest = async () => {
    setIsTesting(true);
    try {
      await triggerTestApiCall('ayah/1:2/ar.alafasy');
    } catch {
    } finally {
      setIsTesting(false);
    }
  };

    const handleExportSessionReport = () => {
    const reportData = {
      project: "Basa'ir Studio (بَصَائِر)",
      course: "TryHackMe — REST APIs & Microservices",
      exportTimestamp: new Date().toISOString(),
      totalRequestsIntercepted: logs.length,
      sessionMetrics: {
        avgLatencyMs: Math.round(logs.reduce((acc, l) => acc + (l.durationMs || 65), 0) / (logs.length || 1)),
        methodsDistribution: {
          GET: logs.filter((l) => l.method === 'GET').length,
          POST: logs.filter((l) => l.method === 'POST').length,
          PUT: logs.filter((l) => l.method === 'PUT').length,
          DELETE: logs.filter((l) => l.method === 'DELETE').length,
        },
        statusCodesDistribution: logs.reduce((acc, l) => {
          acc[l.status] = (acc[l.status] || 0) + 1;
          return acc;
        }, {})
      },
      executedLogs: logs.map(l => ({
        timestamp: l.timestamp,
        method: l.method,
        url: l.url,
        statusCode: l.status,
        durationMs: l.durationMs,
        payloadSize: l.payloadSize
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basair-rest-api-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    clearApiLogs();
    setLogs(SEED_LOGS);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess('');
    try {
      const res = await createNote(
        {
          title: newNoteTitle,
          content: newNoteContent,
          surahNumber: newNoteSurah,
          ayahNumber: newNoteAyah,
          surahName: `سورة ${newNoteSurah}`
        },
        simToken ? 'valid-token' : 'invalid'
      );
      setNewNoteTitle('');
      setNewNoteContent('');
      setCrudSuccess('تمّ إنشاء المورد بنجاح عبر طلب [POST 201 Created]');
      const updated = await fetchNotes();
      setNotes(updated.data || []);
      setTimeout(() => setCrudSuccess(''), 3000);
    } catch (err) {
      setCrudError(err.message || 'فشل إرسال الطلب');
      setTimeout(() => setCrudError(''), 3500);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      const updated = await fetchNotes();
      setNotes(updated.data || []);
      setCrudSuccess('تمّ حذف المورد عبر طلب [DELETE 204 No Content]');
      setTimeout(() => setCrudSuccess(''), 3000);
    } catch (err) {
      setCrudError(err.message);
      setTimeout(() => setCrudError(''), 3500);
    }
  };

  const handleSimulateStatus = async (code) => {
    await simulateHttpStatus(code);
    setActiveTab('inspector');
  };

  return (
    <div className="rest-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="مستكشف واجهات برمجة التطبيقات">
      <div className="rest-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="rest-modal-header">
          <div className="header-meta">
            <div className="terminal-badge">
              <TerminalIcon size={18} strokeWidth={2} className="text-emerald" />
            </div>
            <div>
              <div className="header-title-row">
                <h3 className="header-title font-calligraphy">مستكشف واجهات برمجة التطبيقات (REST APIs & Microservices)</h3>
                <span className="live-status-pill">
                  <span className="status-ping-dot" />
                  TryHackMe Course Lab
                </span>
              </div>
              <p className="header-subtitle">
                فحص طلبات HTTP الحية، أزمنة الاستجابة (Latency)، عمليات CRUD، وتوثيق OpenAPI
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="close-btn" aria-label="إغلاق النافذة">
            <CloseIcon size={18} strokeWidth={2} />
          </button>
        </header>

        {/* Navigation Tabs between Inspector, CRUD Microservice, Status Simulator, Swagger */}
        <div className="rest-subnav-bar">
          <button 
            type="button"
            className={`subnav-btn ${activeTab === 'inspector' ? 'active' : ''}`}
            onClick={() => setActiveTab('inspector')}
          >
            <TerminalIcon size={15} />
            <span>سجل الطلبات الحي (Live Inspector)</span>
          </button>
          <button 
            type="button"
            className={`subnav-btn ${activeTab === 'crud_microservice' ? 'active' : ''}`}
            onClick={() => setActiveTab('crud_microservice')}
          >
            <PlusIcon size={15} />
            <span>معمل عمليات CRUD (POST / PUT / DELETE)</span>
          </button>
          <button 
            type="button"
            className={`subnav-btn ${activeTab === 'status_sim' ? 'active' : ''}`}
            onClick={() => setActiveTab('status_sim')}
          >
            <SparklesIcon size={15} />
            <span>محاكي أكواد HTTP (Status Codes)</span>
          </button>
          <button 
            type="button"
            className={`subnav-btn ${activeTab === 'swagger' ? 'active' : ''}`}
            onClick={() => setActiveTab('swagger')}
          >
            <BookIcon size={15} />
            <span>توثيق OpenAPI (Swagger)</span>
          </button>
        </div>

        {/* Tab 1: Live Inspector */}
        {activeTab === 'inspector' && (
          <div className="rest-modal-layout">
            {/* Sidebar */}
            <aside className="rest-sidebar">
              <div className="sidebar-search-box">
                <SearchIcon size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="تصفية الطلبات (GET, POST, 200, url)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  dir="ltr"
                />
              </div>

              {/* Method Filters */}
              <div className="filter-chips-row" dir="ltr">
                {['all', 'get', 'post', 'put', 'delete', 'err'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Logs Stream */}
              <div className="logs-stream-list" dir="ltr">
                {filteredLogs.map((item) => {
                  const isSelected = item.id === currentItem?.id;
                  const isSuccess = item.status >= 200 && item.status < 300;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLogId(item.id)}
                      className={`log-item-row ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="log-item-top">
                        <span className={`method-pill method-${item.method?.toLowerCase()}`}>
                          {item.method}
                        </span>
                        <span className={`status-pill ${isSuccess ? 'status-ok' : 'status-err'}`}>
                          {item.status || 200}
                        </span>
                        <span className="duration-tag">{item.durationMs ?? 60}ms</span>
                        <span className="timestamp-tag">{item.timestamp}</span>
                      </div>
                      <div className="log-item-url" title={item.url}>
                        {item.url}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Action Button */}
              <div className="sidebar-action-footer">
                <button
                  type="button"
                  onClick={handleTriggerTest}
                  disabled={isTesting}
                  className="ping-btn"
                >
                  <SparklesIcon size={14} />
                  <span>{isTesting ? 'جارٍ الفحص...' : 'إرسال طلب فحص حي (GET Ping)'}</span>
                </button>
              </div>
            </aside>

            {/* Main Details Panel */}
            <main className="rest-main-panel">
              {currentItem ? (
                <div className="details-content-wrapper">
                  {/* KPI Cards */}
                  <div className="kpi-metrics-grid">
                    <div className="kpi-metric-card">
                      <span className="kpi-label">Method</span>
                      <span className={`kpi-val method-color-${currentItem.method?.toLowerCase()}`}>
                        {currentItem.method}
                      </span>
                    </div>

                    <div className="kpi-metric-card">
                      <span className="kpi-label">HTTP Status</span>
                      <span className={`kpi-val ${currentItem.status >= 200 && currentItem.status < 300 ? 'status-text-ok' : 'status-text-err'}`}>
                        {currentItem.status} {currentItem.status === 200 ? 'OK' : currentItem.status === 201 ? 'Created' : currentItem.status === 204 ? 'No Content' : currentItem.status === 400 ? 'Bad Request' : currentItem.status === 401 ? 'Unauthorized' : currentItem.status === 404 ? 'Not Found' : currentItem.status === 429 ? 'Rate Limited' : 'Server Error'}
                      </span>
                    </div>

                    <div className="kpi-metric-card">
                      <span className="kpi-label">Latency</span>
                      <span className="kpi-val text-amber">{currentItem.durationMs ?? 65} ms</span>
                    </div>

                    <div className="kpi-metric-card">
                      <span className="kpi-label">Payload Size</span>
                      <span className="kpi-val text-primary">{currentItem.payloadSize || '1.2 KB'}</span>
                    </div>
                  </div>

                  {/* URL Bar */}
                  <div className="endpoint-url-bar">
                    <span className="url-text" dir="ltr">{currentItem.url}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCurl(currentItem)}
                      className="copy-curl-btn"
                      title="نسخ بصيغة cURL للتشغيل في Terminal أو Postman"
                    >
                      {copiedCurl ? <CheckIcon size={13} className="text-emerald" /> : <CopyIcon size={13} />}
                      <span>{copiedCurl ? 'تم النسخ' : 'Copy cURL'}</span>
                    </button>
                  </div>

                  {/* High-Contrast JSON Viewer */}
                  <section className="json-inspector-section">
                    <div className="json-inspector-header">
                      <div className="json-title-group">
                        <span className="json-heading font-calligraphy">محتوى الاستجابة (JSON Response Body):</span>
                        <span className="json-type-pill" dir="ltr">application/json</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyJson(currentItem)}
                        className="copy-json-btn"
                        dir="ltr"
                      >
                        {copiedJson ? (
                          <>
                            <CheckIcon size={14} className="text-emerald" />
                            <span>تم نسخ JSON</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={14} />
                            <span>نسخ كود JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="json-code-container font-ui" dir="ltr">
                      <pre className="json-pre-block">
                        <code dangerouslySetInnerHTML={{ __html: highlightJson(currentItem.data) }} />
                      </pre>
                    </div>
                  </section>
                </div>
              ) : null}
            </main>
          </div>
        )}

        {/* Tab 2: CRUD Microservice (POST, PUT, DELETE) */}
        {activeTab === 'crud_microservice' && (
          <div className="rest-crud-stage">
            <div className="crud-header-note">
              <h4 className="font-calligraphy">معمل عمليات الـ CRUD الدقيقة (Create • Read • Update • Delete)</h4>
              <p>
                يقوم هذا المعمل بتنفيذ كامل عمليات دورة حياة المورد (Resource Lifecycle) عبر أفعال HTTP القياسية وتسجيلها لحظياً في السجل أعلاه مع ترويسة التوثيق <code>Authorization: Bearer</code>.
              </p>
            </div>

            {/* Auth Bearer Token Control Bar */}
            <div className="crud-auth-bar" dir="ltr">
              <span className="auth-label">Header:</span>
              <span className="auth-key">Authorization: Bearer</span>
              <input
                type="text"
                value={simToken}
                onChange={(e) => setSimToken(e.target.value)}
                placeholder="اتركه فارغاً لمحاكاة خطأ 401 Unauthorized"
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setSimToken('')}
                className="auth-clear-btn"
                title="مسح التوكن لتجربة رفض الصلاحية"
              >
                مسح التوكن (401)
              </button>
            </div>

            {crudError && <div className="crud-alert error">{crudError}</div>}
            {crudSuccess && <div className="crud-alert success">{crudSuccess}</div>}

            <div className="crud-two-cols">
              {/* Form [POST] */}
              <form onSubmit={handleCreateNote} className="crud-create-card">
                <div className="card-top-title">
                  <span className="method-pill method-post">POST</span>
                  <span className="endpoint-name">/api/v1/notes (201 Created)</span>
                </div>

                <div className="form-group">
                  <label>عنوان الخاطرة / الفائدة:</label>
                  <input
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="مثال: دلالة التقديم والتأخير في البسملة"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>نص التأمل والتدبر:</label>
                  <textarea
                    required
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="اكتب خلاصة تدبرك في الآية..."
                    className="form-textarea"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>رقم السورة:</label>
                    <input
                      type="number"
                      min={1}
                      max={114}
                      value={newNoteSurah}
                      onChange={(e) => setNewNoteSurah(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>رقم الآية:</label>
                    <input
                      type="number"
                      min={1}
                      value={newNoteAyah}
                      onChange={(e) => setNewNoteAyah(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" className="crud-submit-btn">
                  <PlusIcon size={16} />
                  <span>إرسال طلب POST (إنشاء مورد 201)</span>
                </button>
              </form>

              {/* List [GET] / [DELETE] */}
              <div className="crud-list-card">
                <div className="card-top-title">
                  <span className="method-pill method-get">GET</span>
                  <span className="endpoint-name">/api/v1/notes ({notes.length} موارد)</span>
                </div>

                <div className="notes-rendered-list">
                  {notes.map((n) => (
                    <div key={n.id} className="note-card-item">
                      <div className="note-item-header">
                        <span className="note-title">{n.title}</span>
                        <span className="note-surah-tag">سورة {n.surahNumber}:{n.ayahNumber}</span>
                      </div>
                      <p className="note-content">{n.content}</p>
                      <div className="note-actions">
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id)}
                          className="note-del-btn"
                          title="إرسال طلب DELETE"
                        >
                          حذف [DELETE 204]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: HTTP Status Code Simulator */}
        {activeTab === 'status_sim' && (
          <div className="rest-sim-stage">
            <div className="crud-header-note">
              <h4 className="font-calligraphy">معمل محاكاة وفحص أكواد HTTP Status Codes</h4>
              <p>اضغط على أي كود استجابة لاختبار معالجة النظام له ومشاهدة حزم JSON المستردة في السجل:</p>
            </div>

            <div className="status-codes-grid">
              {[
                { code: 200, name: '200 OK', type: 'success', desc: 'الطلب نجح وتم إرجاع المورد بنجاح' },
                { code: 201, name: '201 Created', type: 'success', desc: 'تم إنشاء مورد جديد بنجاح في السيرفر' },
                { code: 400, name: '400 Bad Request', type: 'client-err', desc: 'صيغة طلب غير صحيحة أو حقول ناقصة' },
                { code: 401, name: '401 Unauthorized', type: 'client-err', desc: 'مفقود توكن التفويض Bearer Auth' },
                { code: 404, name: '404 Not Found', type: 'client-err', desc: 'المسار أو المعرف المطلوب غير موجود' },
                { code: 429, name: '429 Rate Limited', type: 'client-err', desc: 'تجاوز حد الطلبات المسموح بها (TryHackMe)' },
                { code: 500, name: '500 Server Error', type: 'server-err', desc: 'خطأ داخلي غير متوقع في الخادم' }
              ].map((s) => (
                <div key={s.code} className={`sim-code-card sim-${s.type}`}>
                  <div className="sim-code-top">
                    <span className="sim-code-number font-calligraphy">{s.code}</span>
                    <span className="sim-code-name">{s.name}</span>
                  </div>
                  <p className="sim-code-desc">{s.desc}</p>
                  <button
                    type="button"
                    onClick={() => handleSimulateStatus(s.code)}
                    className="sim-test-btn"
                  >
                    محاكاة الطلب وفحصه ↵
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: OpenAPI / Swagger Specification */}
        {activeTab === 'swagger' && (
          <div className="rest-swagger-stage" dir="ltr">
            <div className="swagger-doc-header">
              <h3>Basa'ir Microservices — OpenAPI 3.0.3 Specification</h3>
              <p>Base URL: <code>https://api.alquran.cloud/v1</code> & <code>/api/v1</code></p>
            </div>

            <div className="swagger-endpoints-list">
              <div className="swagger-endpoint get">
                <span className="sw-method">GET</span>
                <span className="sw-path">/surah/&#123;surahNumber&#125;/editions/quran-uthmani,en.sahih</span>
                <span className="sw-desc">Returns multi-edition Ayah text & translations</span>
              </div>
              <div className="swagger-endpoint get">
                <span className="sw-method">GET</span>
                <span className="sw-path">/api/v1/notes</span>
                <span className="sw-desc">List personal reflections and study bookmarks</span>
              </div>
              <div className="swagger-endpoint post">
                <span className="sw-method">POST</span>
                <span className="sw-path">/api/v1/notes</span>
                <span className="sw-desc">Create note resource (Requires Bearer JWT)</span>
              </div>
              <div className="swagger-endpoint put">
                <span className="sw-method">PUT</span>
                <span className="sw-path">/api/v1/notes/&#123;id&#125;</span>
                <span className="sw-desc">Update existing note entity</span>
              </div>
              <div className="swagger-endpoint delete">
                <span className="sw-method">DELETE</span>
                <span className="sw-path">/api/v1/notes/&#123;id&#125;</span>
                <span className="sw-desc">Remove note resource (Returns 204 No Content)</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <footer className="rest-modal-footer">
          <p className="rest-attribution-text">
            <strong>منصة بَصَائِر (Basa'ir)</strong> — استوديو القرآن الكريم والتلاوة والتدبر الذكي
          </p>

          <div className="footer-actions">
            <button
              type="button"
              onClick={handleExportSessionReport}
              className="clear-logs-btn"
              title="تصدير تقرير جلسة الفحص الأكاديمي (JSON)"
            >
              <CopyIcon size={13} strokeWidth={2} />
              <span>تصدير تقرير الفحص (Export Audit)</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="clear-logs-btn"
              title="إعادة تعيين سجل الطلبات إلى الحالة الأولية"
            >
              <RefreshIcon size={13} strokeWidth={2} />
              <span>إعادة ضبط السجل</span>
            </button>
            <button type="button" onClick={onClose} className="footer-done-btn">
              إغلاق
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
