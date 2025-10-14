import { inspect } from "util";

export const logs: string[] = [];

export const createVmContext = () => {
  const safeConsole = {
    log: (...args: any[]) => logs.push(args.map(String).join(" ")),
    error: (...args: any[]) => logs.push("[error] " + args.map(String).join(" ")),
    warn: (...args: any[]) => logs.push("[warn] " + args.map(String).join(" ")),
    info: (...args: any[]) => logs.push("[info] " + args.map(String).join(" ")),
    table: (data: any) => logs.push(inspect(data, { depth: null })),
    dir: (obj: any) => logs.push(inspect(obj, { showHidden: true })),
    trace: (...args: any[]) => {
      const err = new Error();
      logs.push("[trace] " + args.map(String).join(" ") + "\n" + err.stack);
    },
    debug: (...args: any[]) => logs.push("[debug] " + args.map(String).join(" ")),
    assert: (condition: any, ...args: any[]) => {
      if (!condition) logs.push("[assert] " + args.map(String).join(" "));
    },
    count: (() => {
      const counters: Record<string, number> = {};
      return (label = "default") => {
        counters[label] = (counters[label] || 0) + 1;
        logs.push(`${label}: ${counters[label]}`);
      };
    })(),
    clear: () => {},
  };

  const safeObject = Object.freeze({
    keys: Object.keys,
    values: Object.values,
    entries: Object.entries,
    assign: Object.assign,
    fromEntries: Object.fromEntries,
    hasOwn: Object.hasOwn,
    is: Object.is,
    getPrototypeOf: Object.getPrototypeOf,
    getOwnPropertyNames: Object.getOwnPropertyNames,
    getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
    defineProperty: Object.defineProperty,
    defineProperties: Object.defineProperties,
    freeze: Object.freeze,
    seal: Object.seal,
    isFrozen: Object.isFrozen,
    isSealed: Object.isSealed,
    create: Object.create,
  });

  const safeArray = Object.freeze({
    isArray: Array.isArray,
    from: Array.from,
    of: Array.of,
  });

  const safeString = Object.freeze({
    fromCharCode: String.fromCharCode,
    fromCodePoint: String.fromCodePoint,
    raw: String.raw,
  });

  const safeNumber = Object.freeze({
    isFinite: Number.isFinite,
    isInteger: Number.isInteger,
    isNaN: Number.isNaN,
    isSafeInteger: Number.isSafeInteger,
    parseFloat: Number.parseFloat,
    parseInt: Number.parseInt,
  });

  const safeBoolean = Object.freeze({
    prototype: Boolean.prototype,
  });

  const safeRegExp = Object.freeze({
    prototype: RegExp.prototype,
  });

  const safeDate = Object.freeze({
    now: Date.now,
    parse: Date.parse,
    UTC: Date.UTC,
  });

  const safeIntl = Object.freeze({
    Collator: Intl.Collator,
    DateTimeFormat: Intl.DateTimeFormat,
    ListFormat: Intl.ListFormat,
    NumberFormat: Intl.NumberFormat,
    PluralRules: Intl.PluralRules,
    RelativeTimeFormat: Intl.RelativeTimeFormat,
  });

  const safeMath = Object.freeze({ ...Math });
  const safeJSON = Object.freeze({ parse: JSON.parse, stringify: JSON.stringify });

  return {
    console: safeConsole,
    Object: safeObject,
    Array: safeArray,
    String: safeString,
    Number: safeNumber,
    Boolean: safeBoolean,
    RegExp: safeRegExp,
    Date: safeDate,
    Intl: safeIntl,
    Math: safeMath,
    JSON: safeJSON,
    isNaN,
    isFinite,
  };
}