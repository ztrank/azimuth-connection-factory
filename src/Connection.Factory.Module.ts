import { interfaces, ContainerModule } from 'inversify';
import { ErrorHandler } from './interfaces/Error.Handler';
import { Escape } from './types/Escape';
import { CreatePool } from './types/Create.Pool';
import { ConnectionFactorySymbols } from './symbols';
import { ConnectionFactory } from './interfaces/Connection.Factory';
import { ConnectionFactoryImpl } from './implementations/Connection.Factory';
import { TYPES } from './service-references/azimuth-types';

export function ConnectionFactoryModule(escapeId: Escape, createPool: CreatePool, errorHandler?: interfaces.Newable<ErrorHandler>): ContainerModule {
    return new ContainerModule(bind => {
        bind(ConnectionFactorySymbols.Escape).toFunction(escapeId);
        bind(ConnectionFactorySymbols.CreatePool).toFunction(createPool);
        if(errorHandler) {
            bind(ConnectionFactorySymbols.ErrorHandler).to(errorHandler);
        }
        bind<ConnectionFactory>(TYPES.ConnectionFactory).to(ConnectionFactoryImpl).inSingletonScope();
    });
}