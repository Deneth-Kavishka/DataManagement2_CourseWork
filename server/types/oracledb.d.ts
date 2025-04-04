declare module 'oracledb' {
  export const OUT_FORMAT_OBJECT: number;
  export const BIND_OUT: number;
  export const CURSOR: number;
  export const NUMBER: number;
  export const STRING: number;
  
  export let autoCommit: boolean;
  
  export interface ConnectionAttributes {
    user?: string;
    password?: string;
    connectString?: string;
    externalAuth?: boolean;
    [key: string]: any;
  }
  
  export interface PoolAttributes extends ConnectionAttributes {
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    queueTimeout?: number;
    [key: string]: any;
  }
  
  export interface ExecuteOptions {
    autoCommit?: boolean;
    bindDefs?: any;
    fetchArraySize?: number;
    maxRows?: number;
    outFormat?: number;
    [key: string]: any;
  }
  
  export interface ResultSet {
    close(): Promise<void>;
    getRow(): Promise<any[]>;
    getRows(count: number): Promise<any[]>;
  }
  
  export interface Connection {
    execute(
      sql: string,
      bindParams?: any,
      options?: ExecuteOptions
    ): Promise<any>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    getStatementInfo(sql: string): Promise<any>;
    [key: string]: any;
  }
  
  export interface Pool {
    close(drainTime?: number): Promise<void>;
    getConnection(): Promise<Connection>;
    [key: string]: any;
  }
  
  export function createPool(poolAttributes: PoolAttributes): Promise<Pool>;
  export function getConnection(connectionAttributes?: ConnectionAttributes): Promise<Connection>;
  export function getPool(poolAlias?: string): Pool;
}