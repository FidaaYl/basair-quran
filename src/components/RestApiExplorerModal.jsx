import React, { useState, useEffect } from 'react';
import { X, Terminal, Server, Activity, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { restApiLogs, subscribeToApiLogs } from '../services/quranApi';

export default function RestApiExplorerModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([...restApiLogs]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return subscribeToApiLogs((newLogs) => {
      setLogs([...newLogs]);
      if (!selectedLog && newLogs.length > 0) {
        setSelectedLog(newLogs[0]);
      }
    });
  }, [selectedLog]);

  useEffect(() => {
    if (logs.length > 0 && !selectedLog) {
      setSelectedLog(logs[0]);
    }
  }, [logs, selectedLog]);

  if (!isOpen) return null;

  const currentItem = selectedLog || logs[0];

  const handleCopyCurl = (item) => {
    if (!item) return;
    const curl = `curl -X ${item.method} "${item.url}" -H "Accept: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="rest-explorer-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Terminal size={22} className="modal-icon text-emerald" />
            <div>
              <h2 className="modal-title">مستكشف واجهات برمجة التطبيقات (REST API Inspector)</h2>
              <p className="modal-subtitle">
                تطبيق مباشر لمفاهيم مادة REST APIs & Microservices (TryHackMe): تتبع الطلبات، الأكواد، والأحمال اللحظية
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق المستكشف">
            <X size={20} />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="rest-stats-bar">
          <div className="rest-stat-item">
            <Activity size={16} className="text-emerald" />
            <span>إجمالي الطلبات (Total Requests): <strong>{logs.length}</strong></span>
          </div>
          <div className="rest-stat-item">
            <Server size={16} className="text-gold" />
            <span>البروتوكول: <strong>HTTP/2 over TLS (HTTPS)</strong></span>
          </div>
          <div className="rest-stat-item">
            <ShieldCheck size={16} className="text-emerald" />
            <span>المعمارية: <strong>Stateless REST / Microservices</strong></span>
          </div>
        </div>

        {/* Main Body: Logs List (Left) & Inspector (Right) */}
        <div className="rest-explorer-body">
          {/* Logs List */}
          <div className="rest-logs-list">
            <div className="logs-header-title">سجل الطلبات الحية (Live Traffic Log)</div>
            {logs.length === 0 ? (
              <div className="empty-logs">قم بتصفح السور لبدء تسجيل الطلبات...</div>
            ) : (
              logs.map((log) => {
                const isSelected = currentItem?.id === log.id;
                const is200 = log.status >= 200 && log.status < 300;

                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`rest-log-row ${isSelected ? 'active' : ''}`}
                  >
                    <div className="log-row-top">
                      <span className={`method-badge ${log.method.toLowerCase()}`}>{log.method}</span>
                      <span className={`status-badge ${is200 ? 'status-ok' : 'status-err'}`}>
                        {log.status} {is200 ? 'OK' : 'ERR'}
                      </span>
                      <span className="log-duration">{log.durationMs}ms</span>
                    </div>
                    <div className="log-url-snippet" title={log.url}>
                      {log.url.replace(/^https?:\/\/[^/]+/, '')}
                    </div>
                    <div className="log-row-meta">
                      <span>{log.payloadSize}</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Details & JSON Viewer */}
          <div className="rest-details-panel">
            {currentItem ? (
              <div className="details-wrapper">
                <div className="details-header-row">
                  <div>
                    <span className="details-url-label">Endpoint URL:</span>
                    <p className="details-full-url">{currentItem.url}</p>
                  </div>
                  <button onClick={() => handleCopyCurl(currentItem)} className="copy-curl-btn" title="نسخ أمر curl لتجربته في الطرفية">
                    {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copied ? 'تم نسخ أمر cURL' : 'نسخ cURL'}</span>
                  </button>
                </div>

                <div className="rest-meta-grid">
                  <div className="meta-box">
                    <span className="meta-key">HTTP Method</span>
                    <span className="meta-val method">{currentItem.method}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-key">Status Code</span>
                    <span className="meta-val status">{currentItem.status} OK</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-key">Response Time</span>
                    <span className="meta-val">{currentItem.durationMs} ms</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-key">Payload Size</span>
                    <span className="meta-val">{currentItem.payloadSize}</span>
                  </div>
                </div>

                <div className="json-viewer-box">
                  <div className="json-viewer-header">
                    <span>استجابة الخادم (Response Payload - JSON):</span>
                  </div>
                  <pre className="json-code-block">
                    {JSON.stringify(currentItem.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="no-log-selected">اختر طلباً من القائمة لعرض تفاصيله</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="rest-footer">
          <p className="rest-note">
            💡 يتم استهلاك هذه الواجهات مباشرة من <strong>AlQuran Cloud</strong> و <strong>Quran.com API v4</strong> مع كاش محلي ذكي (In-Memory / LocalStorage) لتقليل زمن الاستجابة (Latency) وتحقيق خاصية Cacheability المنصوص عليها في معايير REST.
          </p>
        </div>
      </div>
    </div>
  );
}
