declare module "typescript-sql" {
  import * as mysql from "mysql";

  export class TypeScriptSQL {
    constructor(config: mysql.ConnectionConfig);
    create(table: string, data: object): Promise<any>;
    createTable(table: string, tableDefinition: string): Promise<any>;
    createOrUpdate(table: string, data: object): Promise<any>;
    update(table: string, data: object, conditions: object): Promise<any>;
    read(table: string, conditions?: object): Promise<any>;
    delete(table: string, conditions: object): Promise<any>;
    query(sql: string, args?: any[]): Promise<any>;
    close(): Promise<void>;
  }
}
