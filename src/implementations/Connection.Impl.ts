import { Connection } from '../interfaces/Connection';
import { Querier } from '../interfaces/Querier';
import { ErrorHandler } from '../interfaces/Error.Handler';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProcedureResult } from '../types/Procedure.Result';
import { Escape } from '../types/Escape';

export class ConnectionImpl implements Connection {
    public constructor(
        private querier: Querier, 
        private escapeId: Escape,
        private errorHandler: ErrorHandler = {handleError: throwError}
    ) {}

    public execute(schema: string, procedure: string, ...args: any[]): Observable<ProcedureResult> {
        return from(new Promise<ProcedureResult>((resolve, reject) => {
            this.querier.query(
                `${this.escapeId(schema)}.${this.escapeId(procedure)}(${args.map(() => '?').join(',')})`,
                args,
                (err, results) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            )})).pipe(catchError(err => this.errorHandler.handleError(err)));
    }
}