import { Observable } from 'rxjs';

export interface SecretService {
    get(name: string): Observable<string>;
}