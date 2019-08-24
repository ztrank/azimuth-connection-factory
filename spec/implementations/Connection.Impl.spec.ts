import 'reflect-metadata';
import { throwError } from 'rxjs';
import { ConnectionImpl } from '../../src/implementations/Connection.Impl';

const querier = {
    query: jest.fn()
};
const escapeId = jest.fn().mockImplementation(value => {
    return '`' + value + '`';
})
const errorHandler = {
    handleError: jest.fn().mockImplementation(err => {
        return throwError(err);
    })
};

beforeEach(() => {
    querier.query.mockReset();
    escapeId.mockClear();
    errorHandler.handleError.mockClear();
});

test('Execute - No Parameters', (done) => {
    const schema = 'test_interface';
    const procedure = 'test_procedure';
    const expected = 'CALL `test_interface`.`test_procedure`()';
    querier.query.mockImplementation((query, args, callback) => {
        expect(query).toBe(expected);
        expect(args).toHaveLength(0);
        expect(callback).toBeDefined();
        callback(undefined, [[{result: true}]]);
    });

    const connect = new ConnectionImpl(querier, escapeId, errorHandler);
    connect.execute(schema, procedure)
        .subscribe(res => {
            expect(querier.query).toHaveBeenCalledTimes(1);
            expect(errorHandler.handleError).toHaveBeenCalledTimes(0);
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0].result).toBe(true);
            done();
        });
});

test('Execute - Parameters', (done) => {
    const schema = 'test_interface';
    const procedure = 'test_procedure';
    const expected = 'CALL `test_interface`.`test_procedure`(?,?,?)';
    querier.query.mockImplementation((query, args, callback) => {
        expect(query).toBe(expected);
        expect(args).toHaveLength(3);
        expect(callback).toBeDefined();
        callback(undefined, [[{result: true}]]);
    });

    const connect = new ConnectionImpl(querier, escapeId, errorHandler);
    connect.execute(schema, procedure, 1, 2, 3)
        .subscribe(res => {
            expect(querier.query).toHaveBeenCalledTimes(1);
            expect(errorHandler.handleError).toHaveBeenCalledTimes(0);
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0].result).toBe(true);
            done();
        });
});

test('Execute - Error', (done) => {
    const schema = 'test_interface';
    const procedure = 'test_procedure';
    const expected = 'CALL `test_interface`.`test_procedure`(?,?,?)';
    querier.query.mockImplementation((query, args, callback) => {
        expect(query).toBe(expected);
        expect(args).toHaveLength(3);
        expect(callback).toBeDefined();
        callback(new Error('Whoops'));
    });

    const connect = new ConnectionImpl(querier, escapeId, errorHandler);
    connect.execute(schema, procedure, 1, 2, 3)
        .subscribe({
            next: () => done('whoops'),
            error: err => {
                expect(querier.query).toHaveBeenCalledTimes(1);
                expect(errorHandler.handleError).toHaveBeenCalledTimes(1);
                done();
            }
        });
})