const de = {

  config: {

    continue: 'Continue %s',
    needed: 'Sie benötigen Ihren Benutzernamen, Ihr Passwort und Ihre Client-ID/Geheimnis von %s',
    support: 'Für Hilfe und Unterstützung besuchen Sie bitte %s',
    thankYou: 'Danke für die Installation homebridge-flume',

    description: {
      clientSecret: 'Ihre Flume-Client-ID und Ihr Client-Secret finden Sie unter https://portal.flumetech.com',
      disableDeviceLogging: 'Wenn wahr, werden Änderungen am Zubehörstatus nicht protokolliert',
      excludeDevices: 'Suchen Sie in den Protokollen nach "Neues Gerät hinzufügen: [Geräte-ID]"',
      refreshInterval: 'Anzahl der Minuten zwischen den Anfragen an Flume nach Leckinformationen',
      units: 'Volumeneinheiten, die für benutzerdefinierte Merkmale verwendet werden',
      verbose: 'Zusätzliche Debug-Protokollierung aktivieren',
    },

    enumNames: {
      gallons: 'Gallonen',
      liters: 'Liter',
      cubicFeet: 'Kubikfuß',
      cubicMeters: 'Kubikmeter',
    },

    title: {
      clientId: 'Client ID',
      clientSecret: 'Kundengeheimnis',
      deviceId: 'Geräte-ID',
      disableDeviceLogging: 'Geräteprotokollierung Deaktivieren',
      excludeDevices: 'Geräte ausschließen',
      password: 'Flume-Passwort',
      refreshInterval: 'Intervall Aktualisierung',
      units: 'Einheiten',
      username: 'Flume-Benutzername',
      verbose: 'Verbose',
    },
  },

  customChar: {
    lastMonth: 'Letzten Monat',
    monthUsage: 'Diesen Monat',
    todayUsage: 'Heute',
  },

  errors: {
    badConfig: 'Eine oder mehrere erforderliche Variablen fehlen in der Konfiguration. Bitte überprüfen Sie die Dokumentation.',
    httpRetry: 'Anfrage fehlgeschlagen. Erneuter Versuch in %s Minuten...',
    noDataReceived: 'Keine Daten von http-Anfrage erhalten',
    noDevices: 'Es wurden keine Geräte in Ihrem Konto gefunden',
    noRefreshToken: 'Es wurde kein Aktualisierungstoken abgerufen. Führen Sie stattdessen volle Auth durch...',
  },

  general: {
    brand: 'Flume',
    redacted: '****Redigiert****',
  },

  startup: {
    complete: '✓ Einrichtung abgeschlossen.',
    newDevice: 'Neues Gerät hinzufügen:',
    removeDevice: 'Gerät entfernen:',
    restoringDevice: 'Gerät wiederherstellen:',
    welcome: [
      'Bitte ★ dieses Plugin auf GitHub, wenn Sie es nützlich finden! https://github.com/mpatfield/homebridge-flume',
      'Möchten Sie dieses Plugin sponsern? https://github.com/sponsors/mpatfield',
    ],
  },

  status: {
    batteryLow: 'Die Batterie ist fast leer',
    batteryNormal: 'Batterie ist normal',
    connectionFault: 'Keine Verbindung gefunden',
    connectionNormal: 'Verbindung wiederhergestellt',
    leakDetected: 'Leck erkannt!',
    leakNotDetected: 'Keine Lecks festgestellt',
  },
};

export default de;