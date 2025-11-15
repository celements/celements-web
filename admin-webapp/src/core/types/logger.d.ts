type LogType =
  | 'silent'
  | 'fatal'
  | 'error'
  | 'warn'
  | 'log'
  | 'info'
  | 'success'
  | 'fail'
  | 'ready'
  | 'start'
  | 'box'
  | 'debug'
  | 'trace'
  | 'verbose';
type LogLevel = 0 | 1 | 2 | 3 | 4 | 5;
interface InputLogObject {
  level?: LogLevel;
  tag?: string;
  type?: LogType;
  message?: string;
  additional?: string | string[];
  args?: unknown[];
  date?: Date;
}
interface LogFn {
  (message: InputLogObject | string, ...args: unkown[]): void;
}

type Logger = Record<LogType, LogFn>;

export { Logger };
