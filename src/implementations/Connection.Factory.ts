import { injectable, inject, optional } from 'inversify';
import { Observable, from, of } from 'rxjs';
import { tap, map, mergeMap } from 'rxjs/operators';
import { promisify } from 'util';
import fs from 'fs';
import { ConnectionFactory } from '../interfaces/Connection.Factory';
import { Connection } from '../interfaces/Connection';
import { AppSettings } from '../interfaces/Connection.Factory.Settings';
import { ErrorHandler } from '../interfaces/Error.Handler';
import { Escape } from '../types/Escape';
import { ConnectionFactorySymbols } from '../symbols';
import { SecretService } from '../interfaces/Secret.Service';
import { CreatePool } from '../types/Create.Pool';
import { ConnectionImpl } from './Connection.Impl';

@injectable()
export class ConnectionFactoryImpl implements ConnectionFactory {
    private readonly connections: Map<string, Connection> = new Map<string, Connection>();

    public constructor(
        @inject(ConnectionFactorySymbols.SecretService) private secretService: SecretService,
        @inject(ConnectionFactorySymbols.AppSettings) private appSettings: AppSettings,
        @inject(ConnectionFactorySymbols.CreatePool) private createPool: CreatePool,
        @inject(ConnectionFactorySymbols.Escape) private escapeId: Escape,
        @inject(ConnectionFactorySymbols.ErrorHandler) @optional() private errorHandler?: ErrorHandler
    ) {}

    public get(name: string): Observable<Connection> {
        const p = this.connections.get(name);
        if(p) {
            return of(p);
        }
        return this.createConnection(name)
            .pipe(tap(connection => this.connections.set(name, connection)));
    }

    private createConnection(name: string): Observable<Connection> {
        const poolConfig = {
            connectionLimit: this.appSettings.connectionFactory.connections[name].connectionLimit,
            host: this.appSettings.connectionFactory.connections[name].host,
            port: this.appSettings.connectionFactory.connections[name].port,
            database: this.appSettings.connectionFactory.connections[name].database,
            user: this.appSettings.connectionFactory.connections[name].user
        };
        return this.secretService.get(this.appSettings.connectionFactory.connections[name].secretName)
            .pipe(
                map(pass => {
                    (<any>poolConfig).password = pass;
                    return this.appSettings.connectionFactory.connections[name].ssl
                }),
                mergeMap(ssl => {
                    if(ssl) {
                        return from(promisify(fs.readFile)(ssl, {encoding: 'utf8'}));
                    } else {
                        return of(undefined);
                    }
                }),
                map(ssl => {
                    if(ssl) {
                        (<any>poolConfig).ssl = {
                            ca: ssl
                        };
                    }
                    return poolConfig;
                }),
                map(config => this.createPool(config)),
                map(pool => new ConnectionImpl(pool, this.escapeId, this.errorHandler))
            )

    }
}