import 'reflect-metadata';
import fs from 'fs';
import { ConnectionFactoryImpl } from '../../src/implementations/Connection.Factory';
import { of } from 'rxjs';
import { ConnectionImpl } from '../../src/implementations/Connection.Impl';
import { mergeMap } from 'rxjs/operators';

const appSettings = {
    connectionFactory: {
        connections: {
            test: {
                secretName: 'test',
                connectionLimit: 1,
                host: 'localhost',
                port: 3306,
                database: 'azimuth',
                user: 'test_user'
            },
            testSSL: {
                secretName: 'testSSL',
                connectionLimit: 2,
                host: 'localhost',
                port: 3307,
                database: 'azimuth',
                user: 'test_user',
                ssl: 'C:\\path\\to\\ssl'
            }
        }
    }
};

class SecretService {
    get = jest.fn()
}

const createPool = jest.fn();
const escapeId = jest.fn();
const errorHandler = {
    handleError: jest.fn()
};

const _sslData = 'ssl-data';
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    readFile: jest.fn().mockImplementation((sslPath, options, callback) => {
        expect(sslPath).toBe(appSettings.connectionFactory.connections.testSSL.ssl);
        expect(options).toBeDefined();
        expect(options.encoding).toBe('utf8');
        callback(undefined, _sslData);
    })
}));

beforeEach(() => {
    (<jest.Mock><any>fs.readFile).mockClear();
    createPool.mockClear();
    escapeId.mockClear();
    errorHandler.handleError.mockClear();
});

test('Test Connection Get', (done) => {
    const secretService = new SecretService();
    secretService.get.mockImplementation(name => {
        expect(name).toBe('test');
        return of('plaintext');
    });

    createPool.mockImplementation(options => {
        expect(options).toBeDefined();
        expect(options.connectionLimit).toBe(appSettings.connectionFactory.connections.test.connectionLimit);
        expect(options.host).toBe(appSettings.connectionFactory.connections.test.host);
        expect(options.port).toBe(appSettings.connectionFactory.connections.test.port);
        expect(options.database).toBe(appSettings.connectionFactory.connections.test.database);
        expect(options.user).toBe(appSettings.connectionFactory.connections.test.user);
        expect(options.password).toBe('plaintext');
        return {
            query: jest.fn()
        };
    })
    const connectionFactory = new ConnectionFactoryImpl(secretService, appSettings, createPool, escapeId);
    connectionFactory.get('test')
        .subscribe(connection => {
            expect(secretService.get).toHaveBeenCalledTimes(1);
            expect(createPool).toHaveBeenCalledTimes(1);
            expect(connection).toBeDefined();
            expect(fs.readFile).toHaveBeenCalledTimes(0);
            expect(connection).toBeInstanceOf(ConnectionImpl);
            done();
        });
});


test('Test Connection Caching', (done) => {
    const secretService = new SecretService();
    secretService.get.mockImplementation(name => {
        expect(name).toBe('test');
        return of('plaintext');
    });

    createPool.mockImplementation(options => {
        expect(options).toBeDefined();
        expect(options.connectionLimit).toBe(appSettings.connectionFactory.connections.test.connectionLimit);
        expect(options.host).toBe(appSettings.connectionFactory.connections.test.host);
        expect(options.port).toBe(appSettings.connectionFactory.connections.test.port);
        expect(options.database).toBe(appSettings.connectionFactory.connections.test.database);
        expect(options.user).toBe(appSettings.connectionFactory.connections.test.user);
        expect(options.password).toBe('plaintext');
        return {
            query: jest.fn()
        };
    })
    const connectionFactory = new ConnectionFactoryImpl(secretService, appSettings, createPool, escapeId);
    connectionFactory.get('test')
        .pipe(mergeMap(() => connectionFactory.get('test')))
        .subscribe(connection => {
            expect(secretService.get).toHaveBeenCalledTimes(1);
            expect(createPool).toHaveBeenCalledTimes(1);
            expect(connection).toBeDefined();
            expect(fs.readFile).toHaveBeenCalledTimes(0);
            expect(connection).toBeInstanceOf(ConnectionImpl);
            done();
        });
});


test('Test Connection Get SSL', (done) => {
    const secretService = new SecretService();
    secretService.get.mockImplementation(name => {
        expect(name).toBe('testSSL');
        return of('plaintext');
    });

    createPool.mockImplementation(options => {
        expect(options).toBeDefined();
        expect(options.connectionLimit).toBe(appSettings.connectionFactory.connections.testSSL.connectionLimit);
        expect(options.host).toBe(appSettings.connectionFactory.connections.testSSL.host);
        expect(options.port).toBe(appSettings.connectionFactory.connections.testSSL.port);
        expect(options.database).toBe(appSettings.connectionFactory.connections.testSSL.database);
        expect(options.user).toBe(appSettings.connectionFactory.connections.testSSL.user);
        expect(options.password).toBe('plaintext');
        return {
            query: jest.fn()
        };
    })
    const connectionFactory = new ConnectionFactoryImpl(secretService, appSettings, createPool, escapeId);
    connectionFactory.get('testSSL')
        .subscribe(connection => {
            expect(secretService.get).toHaveBeenCalledTimes(1);
            expect(createPool).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(connection).toBeDefined();
            expect(connection).toBeInstanceOf(ConnectionImpl);
            done();
        });
});

test('Test Connection Get SSL Error Handler', (done) => {
    const secretService = new SecretService();
    secretService.get.mockImplementation(name => {
        expect(name).toBe('testSSL');
        return of('plaintext');
    });

    createPool.mockImplementation(options => {
        expect(options).toBeDefined();
        expect(options.connectionLimit).toBe(appSettings.connectionFactory.connections.testSSL.connectionLimit);
        expect(options.host).toBe(appSettings.connectionFactory.connections.testSSL.host);
        expect(options.port).toBe(appSettings.connectionFactory.connections.testSSL.port);
        expect(options.database).toBe(appSettings.connectionFactory.connections.testSSL.database);
        expect(options.user).toBe(appSettings.connectionFactory.connections.testSSL.user);
        expect(options.password).toBe('plaintext');
        return {
            query: jest.fn()
        };
    })
    const connectionFactory = new ConnectionFactoryImpl(secretService, appSettings, createPool, escapeId, errorHandler);
    connectionFactory.get('testSSL')
        .subscribe(connection => {
            expect(secretService.get).toHaveBeenCalledTimes(1);
            expect(createPool).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(connection).toBeDefined();
            expect(connection).toBeInstanceOf(ConnectionImpl);
            done();
        });
});