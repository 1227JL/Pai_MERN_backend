import { LogLevel } from '@azure/msal-node';

export const msalConfig = {
  auth: {
    clientId: "6b13d0ca-646a-4a53-8f79-37136e11ab66",
    authority: "https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a",
    clientSecret: "13cd0bb3-35ba-4a58-ae45-71eb6ed09fa1" // solo necesario para ciertos flujos
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose, // Usar LogLevel importado directamente
    }
  }
};
