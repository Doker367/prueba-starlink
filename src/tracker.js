// ============================================
// STARLINK ADVANCED VISITOR TRACKER v3.0
// Captura máxima de información del visitante
// ============================================

(function () {
  'use strict';

  const tracker = {
    sessionId: generateId(),
    startTime: Date.now(),
    data: {},
    events: [],

    logEvent(name, payload) {
      this.events.push({ name, payload, timestamp: new Date().toISOString() });
    },

    save() {
      try {
        const stored = JSON.parse(localStorage.getItem('starlink_tracker_data') || '{"visitors":[]}');
        stored.visitors.push({
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          data: this.data,
          events: this.events
        });
        if (stored.visitors.length > 100) stored.visitors = stored.visitors.slice(-100);
        localStorage.setItem('starlink_tracker_data', JSON.stringify(stored));
      } catch (e) { console.error('Tracker save error:', e); }
    }
  };

  window.__tracker = tracker;

  function generateId() {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Desconocido';
  }

  function getBrowserVersion() {
    const ua = navigator.userAgent;
    let match;
    if ((match = ua.match(/(?:Firefox|Edg|OPR|Chrome|Safari)\/(\d+)/))) return match[1];
    return 'N/A';
  }

  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10')) return 'Windows 10/11';
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) {
      const v = ua.match(/Mac OS X (\d+[._]\d+[._\d]*)/);
      return v ? 'macOS ' + v[1].replace(/_/g, '.') : 'macOS';
    }
    if (ua.includes('Android')) {
      const v = ua.match(/Android (\d+[\.\d]*)/);
      return v ? 'Android ' + v[1] : 'Android';
    }
    if (ua.includes('iPhone') || ua.includes('iPad')) {
      const v = ua.match(/OS (\d+_\d+)/);
      return v ? 'iOS ' + v[1].replace('_', '.') : 'iOS';
    }
    if (ua.includes('CrOS')) return 'Chrome OS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Desconocido';
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'Tablet';
    if (/Mobile|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'Móvil';
    return 'Escritorio';
  }

  function getDeviceBrand() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) return 'Apple';
    if (/Samsung/i.test(ua)) return 'Samsung';
    if (/Huawei/i.test(ua)) return 'Huawei';
    if (/Xiaomi|Redmi|POCO/i.test(ua)) return 'Xiaomi';
    if (/Pixel/i.test(ua)) return 'Google Pixel';
    if (/OnePlus/i.test(ua)) return 'OnePlus';
    if (/Motorola/i.test(ua)) return 'Motorola';
    if (/LG/i.test(ua)) return 'LG';
    if (/OPPO/i.test(ua)) return 'OPPO';
    if (/vivo/i.test(ua)) return 'Vivo';
    if (/Realme/i.test(ua)) return 'Realme';
    if (/Macintosh|Mac OS/i.test(ua)) return 'Apple';
    if (/Windows/i.test(ua)) return 'PC Windows';
    if (/Linux/i.test(ua)) return 'Linux PC';
    return 'Desconocido';
  }

  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Starlink!@#$', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Cwm fjordbank \ud83d\ude03 glyphs vext quiz', 4, 35);
      return canvas.toDataURL().slice(-40);
    } catch (e) {
      return 'No disponible';
    }
  }

  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: 'N/A', renderer: 'N/A', version: 'N/A' };
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION)
      };
    } catch (e) {
      return { vendor: 'N/A', renderer: 'N/A', version: 'N/A' };
    }
  }

  function getAudioFingerprint() {
    try {
      const ac = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(10000, ac.currentTime);
      const compressor = ac.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, ac.currentTime);
      compressor.knee.setValueAtTime(40, ac.currentTime);
      compressor.ratio.setValueAtTime(12, ac.currentTime);
      compressor.attack.setValueAtTime(0, ac.currentTime);
      compressor.release.setValueAtTime(0.25, ac.currentTime);
      osc.connect(compressor);
      compressor.connect(ac.destination);
      osc.start(0);
      return new Promise(resolve => {
        ac.startRendering().then(buffer => {
          let sum = 0;
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
          resolve(sum.toFixed(6));
        }).catch(() => resolve('N/A'));
      });
    } catch (e) {
      return Promise.resolve('N/A');
    }
  }

  function detectFonts() {
    try {
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const testFonts = [
        'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
        'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Impact',
        'Lucida Console', 'Tahoma', 'Trebuchet MS', 'Segoe UI',
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald',
        'Consolas', 'Monaco', 'Menlo', 'SF Pro Display'
      ];
      const container = document.createElement('span');
      container.style.cssText = 'position:absolute;left:-9999px;font-size:72px';
      container.innerHTML = 'mmmmmmmmmmlli';
      document.body.appendChild(container);
      const baseWidths = {};
      baseFonts.forEach(f => { container.style.fontFamily = f; baseWidths[f] = container.offsetWidth; });
      const detected = testFonts.filter(font => {
        return baseFonts.some(base => {
          container.style.fontFamily = `'${font}', ${base}`;
          return container.offsetWidth !== baseWidths[base];
        });
      });
      document.body.removeChild(container);
      return detected;
    } catch (e) {
      return [];
    }
  }

  function getNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return 'No soportado';
    return {
      tipo: conn.effectiveType || 'N/A',
      velocidad: conn.downlink ? conn.downlink + ' Mbps' : 'N/A',
      latencia: conn.rtt ? conn.rtt + ' ms' : 'N/A',
      ahorroDatos: conn.saveData ? 'Sí' : 'No'
    };
  }

  async function getBattery() {
    try {
      if (navigator.getBattery) {
        const b = await navigator.getBattery();
        return {
          nivel: Math.round(b.level * 100) + '%',
          cargando: b.charging ? 'Sí' : 'No'
        };
      }
    } catch (e) {}
    return 'No soportado';
  }

  async function getMediaDevices() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return {
          total: devices.length,
          microfonos: devices.filter(d => d.kind === 'audioinput').length,
          parlantes: devices.filter(d => d.kind === 'audiooutput').length,
          camaras: devices.filter(d => d.kind === 'videoinput').length
        };
      }
    } catch (e) {}
    return 'No soportado';
  }

  async function getPermissions() {
    const result = {};
    for (const name of ['geolocation', 'notifications', 'camera', 'microphone']) {
      try {
        result[name] = (await navigator.permissions.query({ name })).state;
      } catch (e) {
        result[name] = 'N/A';
      }
    }
    return result;
  }

  // Multi-API IP fetching
  async function fetchIPData() {
    const apis = [
      { url: 'https://ipapi.co/json/', parser: parseIpnCo },
      { url: 'https://ipwhois.app/json/', parser: parseIpWhois },
      { url: 'https://ipinfo.io/json', parser: parseIpInfo },
      { url: 'https://api.my-ip.io/v2/ip.json', parser: parseMyIp }
    ];

    for (const api of apis) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(api.url, { signal: ctrl.signal });
        clearTimeout(timer);
        if (res.ok) {
          const raw = await res.json();
          const parsed = api.parser(raw);
          if (parsed && parsed.ip) {
            parsed._source = new URL(api.url).hostname;
            return parsed;
          }
        }
      } catch (e) {
        continue;
      }
    }
    return { error: 'Todas las APIs fallaron', ip: 'No detectada' };
  }

  function parseIpnCo(d) {
    return {
      ip: d.ip, version: d.version, ciudad: d.city, region: d.region,
      regionCode: d.region_code, pais: d.country_name, paisCode: d.country_code,
      continente: d.continent_code, codigoPostal: d.postal,
      latitud: d.latitude, longitud: d.longitude,
      zonaHoraria: d.timezone, utcOffset: d.utc_offset,
      proveedor: d.org, asn: d.asn, enUe: d.in_eu
    };
  }

  function parseIpWhois(d) {
    return {
      ip: d.ip, version: d.type, ciudad: d.city, region: d.region,
      pais: d.country, paisCode: d.country_code, codigoPostal: d.postal,
      latitud: d.latitude, longitud: d.longitude,
      zonaHoraria: d.timezone ? d.timezone.id : 'N/A',
      utcOffset: d.timezone ? d.timezone.utc : 'N/A',
      proveedor: d.connection ? d.connection.org : 'N/A',
      asn: d.connection ? d.connection.asn : 'N/A',
      isp: d.connection ? d.connection.isp : 'N/A'
    };
  }

  function parseIpInfo(d) {
    const [lat, lon] = (d.loc || ',').split(',');
    return {
      ip: d.ip, ciudad: d.city, region: d.region, pais: d.country,
      codigoPostal: d.postal, latitud: lat, longitud: lon,
      zonaHoraria: d.timezone, proveedor: d.org,
      asn: d.org ? d.org.split(' ')[0] : 'N/A', isp: d.org
    };
  }

  function parseMyIp(d) {
    return {
      ip: d.ip, ciudad: d.city, region: d.region, pais: d.country,
      paisCode: d.country_code, codigoPostal: d.postal_code,
      latitud: d.latitude, longitud: d.longitude,
      zonaHoraria: d.time_zone, proveedor: d.autonomous_system_organization,
      asn: d.autonomous_system_number, isp: d.autonomous_system_organization
    };
  }

  // ============ MAIN INIT ============
  async function init() {
    console.log('%c📡 Iniciando tracker...', 'color: #00d4ff; font-size: 14px');

    // Collect all data in parallel
    const [ipData, battery, mediaDevices, audioFp, permissions] = await Promise.all([
      fetchIPData(),
      getBattery(),
      getMediaDevices(),
      getAudioFingerprint(),
      getPermissions()
    ]);

    const webgl = getWebGLInfo();

    tracker.data = {
      sesion: {
        id: tracker.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || 'Tráfico directo',
        titulo: document.title,
        idioma: navigator.language,
        idiomas: navigator.languages ? navigator.languages.join(', ') : 'N/A',
        zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offsetZona: new Date().getTimezoneOffset(),
        cookies: navigator.cookieEnabled,
        online: navigator.onLine
      },

      ip_red: ipData,

      dispositivo: {
        tipo: getDeviceType(),
        marca: getDeviceBrand(),
        sistemaOperativo: getOS(),
        navegador: getBrowser(),
        versionNavegador: getBrowserVersion(),
        userAgent: navigator.userAgent
      },

      hardware: {
        cpuCores: navigator.hardwareConcurrency || 'N/A',
        ramGB: navigator.deviceMemory || 'N/A',
        touchPoints: navigator.maxTouchPoints || 0,
        plataforma: navigator.platform || 'N/A',
        pdfViewer: navigator.pdfViewerEnabled || false
      },

      pantalla: {
        ancho: screen.width,
        alto: screen.height,
        disponibleAncho: screen.availWidth,
        disponibleAlto: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        viewportAncho: window.innerWidth,
        viewportAlto: window.innerHeight,
        orientacion: screen.orientation ? screen.orientation.type : 'N/A',
        touch: 'ontouchstart' in window
      },

      red: getNetworkInfo(),
      bateria: battery,
      dispositivosMedia: mediaDevices,
      permisos: permissions,

      fingerprint: {
        canvas: getCanvasFingerprint(),
        audio: audioFp,
        webglVendor: webgl.vendor,
        webglRenderer: webgl.renderer,
        webglVersion: webgl.version,
        fonts: detectFonts(),
        idiomas: navigator.languages ? navigator.languages.length : 0,
        plugins: navigator.plugins ? navigator.plugins.length : 0
      },

      capacidades: {
        webgl: !!document.createElement('canvas').getContext('webgl'),
        webgl2: !!document.createElement('canvas').getContext('webgl2'),
        webWorker: typeof Worker !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        webRTC: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),
        indexedDB: 'indexedDB' in navigator,
        bluetooth: 'bluetooth' in navigator,
        usb: 'usb' in navigator,
        gamepad: 'getGamepads' in navigator,
        share: 'share' in navigator,
        webAssembly: typeof WebAssembly !== 'undefined',
        crypto: 'crypto' in window
      }
    };

    tracker.save();

    // ====== DISPLAY ALL DATA ======
    console.log('');
    console.log('%c ╔══════════════════════════════════════════════════╗', 'color: #00d4ff');
    console.log('%c ║    📡 STARLINK TRACKER - DATOS DEL VISITANTE     ║', 'color: #00d4ff; font-weight: bold');
    console.log('%c ╚══════════════════════════════════════════════════╝', 'color: #00d4ff');
    console.log('');

    console.log('%c🌐 IP & UBICACIÓN', 'color: #22c55e; font-weight: bold; font-size: 14px; background: #0a2e1a; padding: 4px 12px; border-radius: 4px');
    console.table(tracker.data.ip_red);

    console.log('');
    console.log('%c💻 DISPOSITIVO', 'color: #a855f7; font-weight: bold; font-size: 14px; background: #1a0a2e; padding: 4px 12px; border-radius: 4px');
    console.table(tracker.data.dispositivo);

    console.log('');
    console.log('%c🔧 HARDWARE', 'color: #f59e0b; font-weight: bold; font-size: 14px; background: #2e1a0a; padding: 4px 12px; border-radius: 4px');
    console.table(tracker.data.hardware);

    console.log('');
    console.log('%c📐 PANTALLA', 'color: #06b6d4; font-weight: bold; font-size: 14px; background: #0a1e2e; padding: 4px 12px; border-radius: 4px');
    console.table(tracker.data.pantalla);

    console.log('');
    console.log('%c🎨 FINGERPRINT (identificador único)', 'color: #ef4444; font-weight: bold; font-size: 14px; background: #2e0a0a; padding: 4px 12px; border-radius: 4px');
    console.table({
      canvas: tracker.data.fingerprint.canvas,
      audio: tracker.data.fingerprint.audio,
      webglVendor: tracker.data.fingerprint.webglVendor,
      webglRenderer: tracker.data.fingerprint.webglRenderer,
      fontsDetectadas: tracker.data.fingerprint.fonts.length + ' fuentes',
      fontList: tracker.data.fingerprint.fonts.join(', ')
    });

    console.log('');
    console.log('%c🔋 BATERÍA & MEDIA', 'color: #8b5cf6; font-weight: bold; font-size: 14px; background: #1a0a2e; padding: 4px 12px; border-radius: 4px');
    console.table({
      bateria: typeof tracker.data.bateria === 'object' ? tracker.data.bateria.nivel : 'N/A',
      cargando: typeof tracker.data.bateria === 'object' ? tracker.data.bateria.cargando : 'N/A',
      microfonos: typeof tracker.data.dispositivosMedia === 'object' ? tracker.data.dispositivosMedia.microfonos : 'N/A',
      camaras: typeof tracker.data.dispositivosMedia === 'object' ? tracker.data.dispositivosMedia.camaras : 'N/A',
      parlantes: typeof tracker.data.dispositivosMedia === 'object' ? tracker.data.dispositivosMedia.parlantes : 'N/A'
    });

    console.log('');
    console.log('%c✅ PERMISOS DEL NAVEGADOR', 'color: #10b981; font-weight: bold; font-size: 14px; background: #0a2e1a; padding: 4px 12px; border-radius: 4px');
    console.table(tracker.data.permisos);

    console.log('');
    console.log('%c══════════════════════════════════════════════════', 'color: #00d4ff');
    console.log('%c 💾 Guardado en localStorage → starlink_tracker_data', 'color: #666; font-size: 12px');
    console.log('%c 📋 Copiar todo: copiar(JSON.stringify(__tracker.data, null, 2))', 'color: #666; font-size: 12px');
    console.log('%c══════════════════════════════════════════════════', 'color: #00d4ff');

    // Track user interactions
    document.addEventListener('click', e => {
      tracker.logEvent('click', {
        x: e.clientX, y: e.clientY,
        tag: e.target.tagName,
        texto: (e.target.textContent || '').substring(0, 80).trim(),
        href: e.target.href || null,
        clase: e.target.className || null
      });
    });

    document.addEventListener('visibilitychange', () => {
      tracker.logEvent('visibility', {
        hidden: document.hidden,
        segundosEnPagina: Math.round((Date.now() - tracker.startTime) / 1000)
      });
    });

    let scrollMax = 0;
    window.addEventListener('scroll', () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (pct > scrollMax) scrollMax = pct;
    });

    window.addEventListener('beforeunload', () => {
      tracker.data._resumen = {
        tiempoEnPagina: Math.round((Date.now() - tracker.startTime) / 1000),
        scrollMaximo: scrollMax,
        totalClicks: tracker.events.filter(e => e.name === 'click').length
      };
      tracker.save();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
