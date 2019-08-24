export interface Querier {
    query(query: string, callback: (err: any, results: any) => void): void;
    query(query: string, inputs: any | any[], callback: (err: any, results: any) => void): void;
}