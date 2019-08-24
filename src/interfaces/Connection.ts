import { Observable } from 'rxjs';
import { ProcedureResult } from '../types/Procedure.Result';


export interface Connection {
    execute(schema: string, procedure: string, ...inputs: any[]): Observable<ProcedureResult>;
}