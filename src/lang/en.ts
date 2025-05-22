const langEn = {
  
  // General
  brand: 'Flume',
  redacted: 'redacted',

  // Startup
  beta: 'This is a beta version of Flume. You will experience more logging than normal.',
  complete: '✓ Setup complete.',
  newDevice: 'Adding new device:',
  removeDevice: 'Removing device:',
  restoringDevice: 'Restoring device:',
  welcomeMessages: [
    'Please ★ this plugin on GitHub if you\'re finding it useful! https://github.com/mpatfield/homebridge-flume',
    'Would you like to sponsor this plugin? https://github.com/sponsors/mpatfield',
    'This plugin currently has a 4★ rating on HOOBS! https://bit.ly/hb-flume-review',
    'Want to see this plugin in your own language? Please create a ticket! https://github.com/mpatfield/homebridge-flume/issues',
  ],

  // Errors
  badConfig: 'One or more required variables are missing from the config. Please check the documentation. https://github.com/mpatfield/homebridge-flume',
  noDataReceived: 'No data received from http request',
  noDevices: 'No devices were found in your account',
  noRefreshToken: 'No refresh token has been retrieved. Performing full auth instead…',
  httpRetry: 'Request failed. Retrying in %s seconds…',

  // Status
  batteryLow: 'Battery is low',
  batteryNormal: 'Battery is normal',
  connectionFault: 'No connection detected',
  connectionNormal: 'Connection restored',
  leakDetected: 'Leak detected!',
  leakNotDetected: 'No leaks detected',

  // Custom Characteristic
  customCharMonthUsage: 'Month Usage',
  customCharLastMonth: 'Last Month',
  customCharTodayUsage: 'Today Usage',
  customCharUnits: 'Gallons',
};

export default langEn;