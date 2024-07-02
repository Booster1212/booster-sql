import * as mysql from "mysql";

export class BoosterSQL {
  private connection: mysql.Connection;

  // Constructor
  constructor(config: mysql.ConnectionConfig) {
    this.connection = mysql.createConnection(config);
    this.connection.connect((err: { stack: any }) => {
      if (err) {
        console.error("Error connecting to the database:", err.stack);
        return;
      }
      console.log("Connected to the database as ID", this.connection.threadId);
    });
  }

  // Custom Query
  query(sql: string, args?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err: any, results: any) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  // Creates Table if not existent
  createTable(table: string, tableDefinition: string): Promise<any> {
    const sql = `CREATE TABLE IF NOT EXISTS ${table} (${tableDefinition})`;
    return this.query(sql);
  }

  // Creates Entry
  create(table: string, data: object): Promise<any> {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    return this.query(sql, values);
  }

  // Read Everything from table
  read(table: string, conditions?: object): Promise<any> {
    let sql = `SELECT * FROM ${table}`;
    let values: any[] = [];
    if (conditions) {
      const conditionString = Object.keys(conditions)
        .map((key) => `${key} = ?`)
        .join(" AND ");
      values = Object.values(conditions);
      sql += ` WHERE ${conditionString}`;
    }
    return this.query(sql, values);
  }

  // Creates non existing entry or update existing entry.
  createOrUpdate(table: string, data: object): Promise<any> {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map(() => "?").join(", ");
    const updateString = Object.keys(data)
      .map((key) => `${key} = VALUES(${key})`)
      .join(", ");
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateString}`;
    return this.query(sql, values);
  }

  // Updates Tables
  update(table: string, data: object, conditions: object): Promise<any> {
    const updateString = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(data);
    const conditionString = Object.keys(conditions)
      .map((key) => `${key} = ?`)
      .join(" AND ");
    const conditionValues = Object.values(conditions);
    const sql = `UPDATE ${table} SET ${updateString} WHERE ${conditionString}`;
    return this.query(sql, [...values, ...conditionValues]);
  }

  // Deletes entry by condition string from table
  delete(table: string, conditions: object): Promise<any> {
    const conditionString = Object.keys(conditions)
      .map((key) => `${key} = ?`)
      .join(" AND ");
    const values = Object.values(conditions);
    const sql = `DELETE FROM ${table} WHERE ${conditionString}`;
    return this.query(sql, values);
  }

  // Closes Database Connection
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}
