import { useState, useEffect, useCallback, useRef } from 'react';

export interface UsbSensorState {
  isSensorConnected: boolean;
  sensorName: string;
  isReadingData: boolean;
  detectUsbDevice: () => Promise<boolean>;
  lastDataRead: string | null;
}

export function useUsbBiometric(): UsbSensorState {
  const [isSensorConnected, setIsSensorConnected] = useState<boolean>(false);
  const [sensorName, setSensorName] = useState<string>('Optical Fingerprint Sensor');
  const [isReadingData, setIsReadingData] = useState<boolean>(false);
  const [lastDataRead, setLastDataRead] = useState<string | null>(null);

  const readingTimerRef = useRef<any>(null);

  // Check already-granted USB and HID devices on mount
  useEffect(() => {
    let isMounted = true;

    const checkDevices = async () => {
      try {
        const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
        if (!nav) return;

        // 1. Check WebUSB
        if (nav.usb && typeof nav.usb.getDevices === 'function') {
          const devices = await nav.usb.getDevices();
          if (devices.length > 0 && isMounted) {
            setIsSensorConnected(true);
            setSensorName(devices[0].productName || 'USB Biometric Reader');
            return;
          }
        }

        // 2. Check WebHID
        if (nav.hid && typeof nav.hid.getDevices === 'function') {
          const hidDevices = await nav.hid.getDevices();
          if (hidDevices.length > 0 && isMounted) {
            setIsSensorConnected(true);
            setSensorName(hidDevices[0].productName || 'USB HID Biometric Reader');
            return;
          }
        }
      } catch {
        // Fallback or permission check quiet
      }
    };

    checkDevices();

    // Listen for physical USB connect / disconnect
    const handleUsbConnect = (e: any) => {
      if (!isMounted) return;
      setIsSensorConnected(true);
      setSensorName(e?.device?.productName || 'USB Biometric Sensor');
    };

    const handleUsbDisconnect = () => {
      if (!isMounted) return;
      checkDevices();
    };

    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (nav?.usb && typeof nav.usb.addEventListener === 'function') {
      nav.usb.addEventListener('connect', handleUsbConnect);
      nav.usb.addEventListener('disconnect', handleUsbDisconnect);
    }

    if (nav?.hid && typeof nav.hid.addEventListener === 'function') {
      nav.hid.addEventListener('connect', handleUsbConnect);
      nav.hid.addEventListener('disconnect', handleUsbDisconnect);
    }

    return () => {
      isMounted = false;
      if (nav?.usb && typeof nav.usb.removeEventListener === 'function') {
        nav.usb.removeEventListener('connect', handleUsbConnect);
        nav.usb.removeEventListener('disconnect', handleUsbDisconnect);
      }
      if (nav?.hid && typeof nav.hid.removeEventListener === 'function') {
        nav.hid.removeEventListener('connect', handleUsbConnect);
        nav.hid.removeEventListener('disconnect', handleUsbDisconnect);
      }
    };
  }, []);

  // Listen for USB keyboard wedge / HID barcode & biometric scanner input
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't capture when typing in standard text inputs unless specifically formatted
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      // Optical scanners type rapidly (< 60ms between characters)
      if (diff > 250) {
        buffer = '';
      }

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          // Valid biometric stream read from USB
          setIsSensorConnected(true);
          setIsReadingData(true);
          setLastDataRead(buffer);

          if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
          readingTimerRef.current = setTimeout(() => {
            setIsReadingData(false);
          }, 1500);

          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
    };
  }, []);

  // One-click intuitive device detection
  const detectUsbDevice = useCallback(async (): Promise<boolean> => {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (!nav) return false;

    try {
      if (nav.usb && typeof nav.usb.requestDevice === 'function') {
        const device = await nav.usb.requestDevice({
          filters: []
        });
        if (device) {
          setIsSensorConnected(true);
          setSensorName(device.productName || 'USB Biometric Sensor');
          return true;
        }
      }
    } catch {
      // If user dismissed browser dialog
    }

    // Try WebHID
    try {
      if (nav.hid && typeof nav.hid.requestDevice === 'function') {
        const devices = await nav.hid.requestDevice({
          filters: []
        });
        if (devices && devices.length > 0) {
          setIsSensorConnected(true);
          setSensorName(devices[0].productName || 'USB HID Sensor');
          return true;
        }
      }
    } catch {
      // User cancelled
    }

    return false;
  }, []);

  return {
    isSensorConnected,
    sensorName,
    isReadingData,
    detectUsbDevice,
    lastDataRead
  };
}
