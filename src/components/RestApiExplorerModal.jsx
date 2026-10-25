import React, { useState, useEffect } from 'react';
import { ICONS } from './common/IconSystem';
import { restApiLogs, subscribeToApiLogs } from '../services/quranApi';

export default function RestApiExplorerModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState(() => [...restApiLogs]);
  const [selectedLog, setSelectedLog] = useState(() => restApiLogs[0] || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return subscribeToApiLogs((newLogs) => {
      setLogs([...newLogs]);
      setSelectedLog((prev) => prev || newLogs[0] || null);
    });
  }, []);

  if (!isOpen) return null;

  const currentItem = selectedLog || logs[0];

  const TerminalIcon = ICONS.terminal;
  const CloseIcon = ICONS.close;
  const ServerIcon = ICONS.server;
  const ActivityIcon = ICONS.activity;
  const ShieldCheckIcon = ICONS.shieldCheck;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;

  const handleCopyCurl = (item) => {
    if (!item) return;
    const curl = `curl -X ${item.method} "${item.url}" -H "Accept: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div 
        className="rest-explorer-modal animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-inspector-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <TerminalIcon size={20} strokeWidth={1.8} className="modal-icon text-emerald" />
            <div>
              <h2 id="rest-inspector-title" className="modal-title font-calligraphy">
                مستكشف واجهات برمجة التطبيقات (REST API Inspector)
              </h2>
              <p className="modal-subtitle">
                فحص طلبات HTTP الحية، الترويسات (Headers)، وزمن الاستجابة لمساق TryHackMe REST APIs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق مستكشف REST APIs">
            <CloseIcon size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="rest-modal-body">
          {/* Left: Requests Log List */}
          <div className="rest-requests-sidebar" role="listbox" aria-label="سجل طلبات واجهات البرمجة">
            <div className="sidebar-list-header">
              <span>سجل الطلبات المتزامنة ({logs.length})</span>
              <span className="live-pulse-badge">مباشر</span>
            </div>

            <div className="rest-logs-scroll">
              {logs.map((item) => {
                const isSelected = currentItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLog(item)}
                    className={`rest-log-row ${isSelected ? 'active' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="log-row-top">
                      <span className="method-badge">{item.method}</span>
                      <span className={`status-badge ${item.status < 400 ? 'status-ok' : 'status-err'}`}>
                        {item.status || 200}
                      </span>
                      <span className="log-duration">{item.duration}ms</span>
                    </div>
                    <div className="log-url-snippet font-ui" title={item.url}>
                      {item.url}
                    </div>
                    <div className="log-row-meta">
                      <span className="log-time">{item.time}</span>
                      <span className="log-endpoint">{item.endpoint}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Request Details & JSON */}
          <div className="rest-details-panel">
            {currentItem ? (
              <div className="details-wrapper">
                <div className="details-header-row">
                  <div>
                    <span className="details-url-label">Endpoint URL:</span>
                    <p className="details-full-url font-ui">{currentItem.url}</p>
                  </div>
                  <button
                    onClick={() => handleCopyCurl(currentItem)}
                    className="copy-curl-btn"
                    title="نسخ أمر cURL للاختبار في Terminal"
                    aria-label="نسخ أمر cURL"
                  >
                    {copied ? (
                      <CheckIcon size={14} strokeWidth={1.8} className="text-emerald" />
                    ) : (
                      <CopyIcon size={14} strokeWidth={1.8} />
                    )}
                    <span>{copied ? 'تم نسخ cURL' : 'نسخ cURL'}</span>
                  </button>
                </div>

                {/* Metadata Cards */}
                <div className="rest-meta-grid">
                  <div className="meta-box">
                    <span className="meta-key">Method</span>
                    <span className="meta-val method">{currentItem.method}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-key">HTTP Status</span>
                    <span className="meta-val status">{currentItem.status || 200} OK</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-key">Response Time</span>
                    <span className="meta-val">{currentItem.duration} ms</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-key">Payload Format</span>
                    <span className="meta-val">application/json</span>
                  </div>
                </div>

                {/* Response Payload Viewer */}
                <div className="json-viewer-box">
                  <div className="json-viewer-header">
                    <span>Response Body (AlQuran Cloud REST API):</span>
                  </div>
                  <pre className="json-code-block">
                    <code>{JSON.stringify(currentItem.data, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="no-request-selected">
                <p>اختر طلباً من القائمة اليسرى لمعاينة البيانات.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="rest-footer">
          <p className="rest-note">
            تم بناء هذا المستكشف لتطبيق المعايير العملية لمساق "REST APIs & Microservices" لجامعة البليدة 2 (تحت إشراف د. صحراوي محمد) — الطالب: فداء يعلاوي.
          </p>
        </div>
      </div>
    </div>
  );
}
