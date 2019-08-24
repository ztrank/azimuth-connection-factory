import { Container } from 'inversify';
import { SecretService } from './interfaces/Secret.Service';
import { Constructor } from './types/Constructor';
import { ErrorHandler } from './interfaces/Error.Handler';
import { Escape } from './types/Escape';
import { CreatePool } from './types/Create.Pool';
import { ConnectionFactorySymbols } from './symbols';

function constantOrConstructor<T extends object, Y extends Constructor<T>, Z>(container: Container, sym: string | symbol, item: T|Y): void {
    if(typeof item === 'function') {
        container.bind<Z>(sym).to(<any>item);
    } else {
        container.bind<Z>(sym).toConstantValue(<any>item);
    }
}

export function Bind(
    container: Container,
    secretService: SecretService | Constructor<SecretService>,
    escapeId: Escape,
    createPool: CreatePool,
    errorHandler?: ErrorHandler | Constructor<ErrorHandler>
): void {
    constantOrConstructor(container, ConnectionFactorySymbols.SecretService, secretService);
    container.bind<Escape>(ConnectionFactorySymbols.Escape).toFunction(escapeId);
    container.bind<CreatePool>(ConnectionFactorySymbols.CreatePool).toFunction(createPool);

    if(errorHandler) {
        constantOrConstructor(container, ConnectionFactorySymbols.ErrorHandler, errorHandler);
    }
}