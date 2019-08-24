import { Container, interfaces } from 'inversify';
import { SecretService } from './interfaces/Secret.Service';
import { ErrorHandler } from './interfaces/Error.Handler';
import { Escape } from './types/Escape';
import { CreatePool } from './types/Create.Pool';
import { ConnectionFactorySymbols } from './symbols';
import { ConnectionFactory } from './interfaces/Connection.Factory';
import { ConnectionFactoryImpl } from './implementations/Connection.Factory';
import { isSymbol } from 'util';

export function ConnectionFactoryBind(
    container: Container,
    appSettings: string | symbol | interfaces.Abstract<SecretService> | interfaces.Newable<SecretService>,
    secretService: string | symbol | interfaces.Abstract<SecretService> | interfaces.Newable<SecretService>,
    escapeId: string | symbol | Escape,
    createPool: string | symbol | CreatePool,
    errorHandler?: string | symbol | interfaces.Abstract<ErrorHandler> | interfaces.Newable<ErrorHandler>
): symbol {
    container.bind(ConnectionFactorySymbols.AppSettings).toService(appSettings);
    container.bind(ConnectionFactorySymbols.SecretService).toService(secretService);

    if(typeof escapeId === 'string' || isSymbol(escapeId)) {
        container.bind(ConnectionFactorySymbols.Escape).toService(escapeId);
    } else {
        container.bind(ConnectionFactorySymbols.Escape).toFunction(escapeId);
    }

    if(typeof createPool === 'string' || isSymbol(createPool)) {
        container.bind(ConnectionFactorySymbols.CreatePool).toService(createPool);
    } else {
        container.bind(ConnectionFactorySymbols.CreatePool).toFunction(createPool);
    }
    

    if(errorHandler) {
        container.bind(ConnectionFactorySymbols.ErrorHandler).toService(errorHandler);
    }

    container.bind<ConnectionFactory>(ConnectionFactorySymbols.ConnectionFactory).to(ConnectionFactoryImpl).inSingletonScope();
    return ConnectionFactorySymbols.ConnectionFactory;
}