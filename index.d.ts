export type SqliteNativeValue = null | number | bigint | string | Uint8Array;
export type QueryMode = "run" | "all" | "values" | "get";

export type RunResult = {
  readonly changes: number | bigint;
  readonly lastInsertRowid: number | bigint;
};

export type QueryResult<M extends QueryMode> = M extends "run"
  ? RunResult
  : M extends "all"
    ? Array<Record<string, SqliteNativeValue>>
    : M extends "values"
      ? SqliteNativeValue[][]
      : Record<string, SqliteNativeValue> | null;

export type DatabaseSyncOptions = {
  readonly open?: boolean;
  readonly readOnly?: boolean;
  readonly enableForeignKeyConstraints?: boolean;
  readonly enableDoubleQuotedStringLiterals?: boolean;
  readonly allowExtension?: boolean;
  readonly timeout?: number;
};

export class DatabaseSync {
  static staticExtensions(): ReadonlyArray<string>;
  constructor(location: string, options?: DatabaseSyncOptions);
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  exec(sql: string): void;
  prepare(sql: string): StatementSync;
  query<M extends QueryMode = "all">(
    sql: string,
    params?: ReadonlyArray<SqliteNativeValue | ArrayBuffer>,
    mode?: M,
  ): QueryResult<M>;
  enableLoadExtension(allow: boolean): void;
  loadExtension(path: string, entryPoint?: string | null): void;
  loadStaticExtension(name: string): void;
}

export class StatementSync {
  readonly sourceSQL: string;
  readonly expandedSQL: string | null;
  all(...params: ReadonlyArray<unknown>): Array<Record<string, SqliteNativeValue>>;
  values(...params: ReadonlyArray<unknown>): SqliteNativeValue[][];
  get(...params: ReadonlyArray<unknown>): Record<string, SqliteNativeValue> | undefined;
  run(...params: ReadonlyArray<unknown>): RunResult;
  columns(): ReadonlyArray<{
    readonly column: string | null;
    readonly name: string | null;
    readonly database: string | null;
    readonly table: string | null;
    readonly type: string | null;
  }>;
  setReadBigInts(enabled: boolean): void;
  setAllowBareNamedParameters(allow: boolean): void;
  setAllowUnknownNamedParameters(allow: boolean): void;
}
