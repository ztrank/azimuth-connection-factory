# azimuth-connection-factory

## Installation
COMING SOON!

## Use
1. Call `ConnectionFactoryBind(container, appSettingsSymbol, secretService, escapeId, createPool, errorHandler?)`
2. Use the returned symbol to bind in any other plugin's Bind function.

### Binding Example
```typescript
import 'reflect-metadata';
import { ConnectionFactoryBind } from 'azimuth-connection-factory';
import { SecretServiceBind } from 'azimuth-secrets';
import { escapeId, createPool } from 'mysql';
import { CustomErrorHandlerBind } from '???';


export function appStartup(): void {
    // ...any other setup here
    // Bind your kms and storage clients
    
    const secretServiceSymbol = SecretServiceBind(container, appSettingsSymbol, kmsClientSymbol, storageClientSymbol);
    const customErrorHandlerBind = CustomErrorHandlerBind(container);
    const connectionFactorySymbol = ConnectionFactoryBind(container, appSettingsSymbol, secretServiceSymbol, escapeId, createPool, customErrorHandlerSymbol);
    // ... finish any setup here
}
```

### Injection and Use Example
```typescript
import { ConnectionFactory, Connection, ProcedureResult } from 'azimuth-connection-factory';
import { injectable, inject } from 'inversify';
import { Observable } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';

@injectable()
export class Service {
    private _connection?: Connection;

    public constructor(
        @inject(MyAppOrPluginConnectionFactorySymbol) private connectionFactory: ConnectionFactory,
        @inject(MyAppOrPluginConnectionNameSymbol) private connectionName: string
    ) {}

    public connect(): Observable<Connection> {
        return this.connectionFactory.get(this.connectionName)
            .pipe(tap(connection => this._connection = connection));
    }

    public get connection(): Connection {
        if(!this._connection) {
            throw new Error('Unconnected!');
        }
        return this._connection;
    }

    public doSomeExecution(): Observable<ProcedureResult> {
        return this.connect()
            .pipe(
                mergeMap(() => this.connection.execute('test_schema', 'test_procedure', 1, 2, 3))
            )
    }
}
```
