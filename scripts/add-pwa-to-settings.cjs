const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const settingsPath = path.join(
  rootDir,
  "src",
  "components",
  "SettingsView.jsx",
);

let code = fs.readFileSync(settingsPath, "utf8").replace(/\r\n/g, "\n");

// 1. Add install prompt state
const stateTarget = "const [savedSuccess, setSavedSuccess] = useState(false);";
const newState =
  stateTarget +
  "\n  const [deferredPrompt, setDeferredPrompt] = useState(null);\n  const [isAppInstalled, setIsAppInstalled] = useState(false);\n\n  useEffect(() => {\n    const handler = (e) => {\n      e.preventDefault();\n      setDeferredPrompt(e);\n    };\n    window.addEventListener('beforeinstallprompt', handler);\n    if (window.matchMedia('(display-mode: standalone)').matches) {\n      setIsAppInstalled(true);\n    }\n    return () => window.removeEventListener('beforeinstallprompt', handler);\n  }, []);\n\n  const handleInstallPwa = async () => {\n    if (!deferredPrompt) return;\n    deferredPrompt.prompt();\n    const { outcome } = await deferredPrompt.userChoice;\n    if (outcome === 'accepted') {\n      setIsAppInstalled(true);\n      setDeferredPrompt(null);\n    }\n  };";

if (!code.includes("handleInstallPwa")) {
  code = code.replace(stateTarget, newState);
}

// 2. Add PWA Section in JSX before Save Button Floating
const pwaSection = `
      {/* PWA & Offline Support Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <DownloadIcon size={20} strokeWidth={1.8} className="settings-header-icon" />
          <div>
            <h3 className="section-title">التطبيق التقدمي والعمل دون اتصال (PWA)</h3>
            <p className="section-desc">تثبيت منصة بَصَائِر على حاسوبك أو هاتفك والوصول السريع لآيات القرآن دون إنترنت</p>
          </div>
        </div>

        <div className="settings-controls-list">
          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">حالة التثبيت على الجهاز</span>
              <span className="control-hint">
                {isAppInstalled
                  ? 'منصة بَصَائِر مثبتة كـ Web App مستقل على جهازك'
                  : 'يمكنك تثبيت التطبيق للتشغيل السريع بملء الشاشة مع حفظ البيانات محلياً'}
              </span>
            </div>
            <div className="settings-actions-group">
              {isAppInstalled ? (
                <span className="settings-pill-btn active" style={{ cursor: 'default' }}>
                  <CheckIcon size={16} /> مثبت كـ تطبيق
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  disabled={!deferredPrompt}
                  className="settings-action-btn export"
                  title={deferredPrompt ? 'تثبيت بَصَائِر' : 'التطبيق جاهز للتثبيت من شريط المتصفح'}
                >
                  <DownloadIcon size={16} strokeWidth={1.8} />
                  <span>{deferredPrompt ? 'تثبيت المنصة الآن' : 'جاهز للتثبيت (PWA)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
`;

const renderTarget = "{/* Save Button Floating / Bottom Bar */}";
if (!code.includes("التطبيق التقدمي والعمل دون اتصال (PWA)")) {
  code = code.replace(renderTarget, pwaSection + "\n      " + renderTarget);
}

fs.writeFileSync(settingsPath, code, "utf8");
console.log("SettingsView.jsx updated with PWA controls");
