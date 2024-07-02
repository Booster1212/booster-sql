"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoosterSQL = void 0;
const mysql = __importStar(require("mysql"));
class BoosterSQL {
    connection;
    // Constructor
    constructor(config) {
        this.connection = mysql.createConnection(config);
        this.connection.connect((err) => {
            if (err) {
                console.error("Error connecting to the database:", err.stack);
                return;
            }
            console.log("Connected to the database as ID", this.connection.threadId);
        });
    }
    // Custom Query
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    }
    // Creates Table if not existent
    createTable(table, tableDefinition) {
        const sql = `CREATE TABLE IF NOT EXISTS ${table} (${tableDefinition})`;
        return this.query(sql);
    }
    // Creates Entry
    create(table, data) {
        const columns = Object.keys(data).join(", ");
        const values = Object.values(data);
        const placeholders = values.map(() => "?").join(", ");
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        return this.query(sql, values);
    }
    // Read Everything from table
    read(table, conditions) {
        let sql = `SELECT * FROM ${table}`;
        let values = [];
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
    createOrUpdate(table, data) {
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
    update(table, data, conditions) {
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
    delete(table, conditions) {
        const conditionString = Object.keys(conditions)
            .map((key) => `${key} = ?`)
            .join(" AND ");
        const values = Object.values(conditions);
        const sql = `DELETE FROM ${table} WHERE ${conditionString}`;
        return this.query(sql, values);
    }
    // Closes Database Connection
    close() {
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
exports.BoosterSQL = BoosterSQL;
