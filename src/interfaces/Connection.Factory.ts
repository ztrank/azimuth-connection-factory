import { Observable } from 'rxjs';
import { Connection } from './Connection';

export interface ConnectionFactory {
    get(name: string): Observable<Connection>;
}