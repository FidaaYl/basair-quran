const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const modalPath = path.join(rootDir, 'src', 'components', 'RestApiExplorerModal.jsx');

let code = fs.readFileSync(modalPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add download export handler
const targetClear = "const handleClear = () => {";
const exportFunc = `  const handleExportSessionReport = () => {
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
    a.download = \`basair-rest-api-audit-\${Date.now()}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };\n\n  const handleClear = () => {`;

if (!code.includes('handleExportSessionReport')) {
  code = code.replace(targetClear, exportFunc);
}

// 2. Add Export button in Footer actions
const footerTarget = `<button
              type="button"
              onClick={handleClear}
              className="clear-logs-btn"`;

const newButton = `<button
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
              className="clear-logs-btn"`;

if (!code.includes('handleExportSessionReport()') && !code.includes('تصدير تقرير الفحص')) {
  code = code.replace(footerTarget, newButton);
}

fs.writeFileSync(modalPath, code, 'utf8');
console.log('RestApiExplorerModal.jsx updated with Export Session Report');

