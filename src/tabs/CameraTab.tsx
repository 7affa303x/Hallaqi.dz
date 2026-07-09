import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { mockBarbers } from '@/data/mockData';
import {
  Camera, QrCode, Scan, X, Flashlight, FlipHorizontal,
  Aperture, Share2, Download, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type CameraMode = 'scanner' | 'generator' | 'camera';

export default function CameraTab() {
  const { themeConfig, navigate } = useApp();
  const [mode, setMode] = useState<CameraMode>('scanner');
  const [scannedResult, setScannedResult] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(mockBarbers[0]?.id || '');
  const [flashOn, setFlashOn] = useState(false);
  const [frontCamera, setFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const selectedBarber = mockBarbers.find(b => b.id === selectedBarberId);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: frontCamera ? 'user' : 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraActive(false);
    }
  }, [frontCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (mode === 'scanner' || mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  const handleScan = () => {
    setScannedResult('https://hallaqi.app/barber/6');
  };

  const qrData = selectedBarber
    ? JSON.stringify({
        id: selectedBarber.id,
        name: selectedBarber.name,
        url: `https://hallaqi.app/barber/${selectedBarber.id}`,
        timestamp: Date.now(),
      })
    : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#000' }}>
      {/* Camera Viewfinder */}
      <div className="relative flex-1 bg-black overflow-hidden">
        {(mode === 'scanner' || mode === 'camera') && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Generator View */}
        {mode === 'generator' && selectedBarber && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: themeConfig.colors.background }}
          >
            {/* Hallaqi Logo */}
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo-symbol.png" alt="Hallaqi" className="w-8 h-8" />
              <span className="text-lg font-bold" style={{ color: themeConfig.colors.primary }}>HALLAQI</span>
            </div>

            {/* QR Code */}
            <div className="relative p-4 rounded-3xl bg-white shadow-xl">
              <QRCodeSVG
                value={qrData}
                size={220}
                bgColor="#FFFFFF"
                fgColor={themeConfig.colors.primary}
                level="H"
                imageSettings={{
                  src: '/logo-symbol.png',
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <div className="absolute inset-0 rounded-3xl border-2 pointer-events-none"
                style={{ borderColor: themeConfig.colors.primary + '20' }}
              />
            </div>

            <h3 className="text-lg font-bold mt-4" style={{ color: themeConfig.colors.text }}>
              {selectedBarber.name}
            </h3>
            <p className="text-xs mt-1" style={{ color: themeConfig.colors.textMuted }}>
              امسح QR Code لزيارة البروفايل
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => copyToClipboard(qrData)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: themeConfig.colors.primary + '10', color: themeConfig.colors.primary }}
              >
                <Copy size={16} />
                نسخ
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: themeConfig.colors.primary + '10', color: themeConfig.colors.primary }}
              >
                <Share2 size={16} />
                مشاركة
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: themeConfig.colors.primary + '10', color: themeConfig.colors.primary }}
              >
                <Download size={16} />
                حفظ
              </button>
            </div>
          </div>
        )}

        {/* Scan Frame Overlay */}
        {mode === 'scanner' && cameraActive && (
          <>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: themeConfig.colors.accent }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: themeConfig.colors.accent }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: themeConfig.colors.accent }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: themeConfig.colors.accent }} />
                {/* Scan line */}
                <div className="absolute left-0 right-0 h-0.5 animate-scan-line" style={{ backgroundColor: themeConfig.colors.accent, boxShadow: `0 0 10px ${themeConfig.colors.accent}` }} />
              </div>
            </div>
            <div className="absolute bottom-32 left-0 right-0 text-center">
              <p className="text-sm text-white/80 font-medium"> ضع QR Code داخل الإطار</p>
            </div>
          </>
        )}

        {/* Simulated Scan Result */}
        {scannedResult && (
          <div className="absolute bottom-24 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeConfig.colors.success + '15' }}>
                <Check size={24} style={{ color: themeConfig.colors.success }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: themeConfig.colors.text }}>تم المسح بنجاح!</p>
                <p className="text-xs truncate" style={{ color: themeConfig.colors.textMuted }}>{scannedResult}</p>
              </div>
              <button
                onClick={() => navigate('barber-detail', { barberId: '6' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: themeConfig.colors.primary }}
              >
                عرض
              </button>
              <button onClick={() => setScannedResult('')} className="flex-shrink-0">
                <X size={18} style={{ color: themeConfig.colors.textMuted }} />
              </button>
            </div>
          </div>
        )}

        {/* No Camera Fallback */}
        {!cameraActive && (mode === 'scanner' || mode === 'camera') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: themeConfig.colors.background }}>
            <img src="/logo-icon.png" alt="Hallaqi" className="w-20 h-20 mb-4 rounded-2xl" />
            <p className="text-sm font-bold" style={{ color: themeConfig.colors.text }}>
              {mode === 'scanner' ? 'ماسح QR Code' : 'الكاميرا'}
            </p>
            <p className="text-xs mt-2" style={{ color: themeConfig.colors.textMuted }}>
              يلزم إذن الوصول للكاميرا
            </p>
            <button
              onClick={startCamera}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: themeConfig.colors.primary }}
            >
              تشغيل الكاميرا
            </button>
            {mode === 'scanner' && (
              <button
                onClick={handleScan}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: themeConfig.colors.accent + '15', color: themeConfig.colors.accent }}
              >
                محاكاة مسح QR
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0 pb-8 pt-4 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { key: 'scanner' as CameraMode, icon: Scan, label: 'مسح QR' },
            { key: 'camera' as CameraMode, icon: Camera, label: 'كاميرا' },
            { key: 'generator' as CameraMode, icon: QrCode, label: 'إنشاء QR' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              style={{
                backgroundColor: mode === m.key ? 'rgba(255,255,255,0.15)' : 'transparent',
              }}
            >
              <m.icon size={20} style={{ color: mode === m.key ? '#F59E0B' : 'rgba(255,255,255,0.5)' }} />
              <span className="text-[10px] font-medium" style={{ color: mode === m.key ? '#F59E0B' : 'rgba(255,255,255,0.5)' }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setFlashOn(!flashOn)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: flashOn ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)' }}
          >
            <Flashlight size={22} style={{ color: flashOn ? '#F59E0B' : '#fff' }} />
          </button>

          {/* Shutter / Scan Button */}
          <button
            onClick={mode === 'scanner' ? handleScan : undefined}
            className="w-18 h-18 rounded-full flex items-center justify-center p-1"
            style={{
              border: mode === 'scanner' ? '3px solid #F59E0B' : '3px solid #fff',
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: mode === 'scanner' ? '#F59E0B' : '#fff' }}
            >
              {mode === 'scanner' ? (
                <Scan size={24} className="text-black" />
              ) : (
                <Aperture size={24} className="text-black" />
              )}
            </div>
          </button>

          <button
            onClick={() => setFrontCamera(!frontCamera)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <FlipHorizontal size={22} className="text-white" />
          </button>
        </div>

        {/* Barber Selector for Generator Mode */}
        {mode === 'generator' && (
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide px-2">
            {mockBarbers.map(barber => (
              <button
                key={barber.id}
                onClick={() => setSelectedBarberId(barber.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-shrink-0 transition-all"
                style={{
                  backgroundColor: selectedBarberId === barber.id ? themeConfig.colors.primary + '15' : themeConfig.colors.surface,
                  borderColor: selectedBarberId === barber.id ? themeConfig.colors.primary : themeConfig.colors.border,
                }}
              >
                <img src={barber.avatar} alt={barber.name} className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-xs font-bold whitespace-nowrap" style={{ color: themeConfig.colors.text }}>{barber.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
