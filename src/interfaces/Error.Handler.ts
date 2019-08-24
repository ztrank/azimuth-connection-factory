import { Observable } from 'rxjs';

export interface ErrorHandler {
    handleError(error?:any): Observable<never>;
}