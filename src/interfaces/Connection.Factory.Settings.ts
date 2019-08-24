export interface AppSettings {
    connectionFactory: ConnectionFactorySettings;
}
export interface ConnectionFactorySettings {
    connections: {[key: string]: ConnectionSetting};
}

export interface ConnectionSetting {
    secretName: string;
    connectionLimit: number;
    host: string;
    port: number;
    database: string;
    user: string;
    ssl?: string;
}
