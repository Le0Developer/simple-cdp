import type ProtocolMapping from "./cdp-mapping.d.ts";

/**
 * Options of the connection
 */
declare interface CDPOptions {
  /**
   * The URL of the connection
   *
   * @defaultValue "http://localhost:9222"
   */
  apiUrl?: string;
  /**
   * The path of the connection
   *
   * @defaultValue "json/version"
   */
  apiPath?: string;
  /**
   * The WebSocket URL of the connection
   */
  webSocketDebuggerUrl?: string;
  /**
   * The path to get all targets
   *
   * @defaultValue "json"
   */
  apiPathTargets?: string;
  /**
   * The path to create new target
   *
   * @defaultValue "json/new"
   */
  apiPathNewTarget?: string;
  /**
   * The path to activate a ‡target
   *
   * @defaultValue "json/activate"
   */
  apiPathActivateTarget?: string;
  /**
   * The path to close a target
   *
   * @defaultValue "json/close"
   */
  apiPathCloseTarget?: string;
  /**
   * The maximum number of retries
   *
   * @defaultValue 20
   */
  connectionMaxRetry?: number;
  /**
   * The delay between retries
   *
   * @defaultValue 500
   */
  connectionRetryDelay?: number;
}

/**
 * Value of a {@link CDPObject}
 */
declare type CDPValue =
  | string
  | number
  | boolean
  | CDPValue[]
  | { [key: string]: CDPValue };

/**
 * Object type used in the {@link CDP} API
 */
declare interface CDPObject {
  [key: string]: CDPValue;
}

/**
 * Connection
 */
declare interface CDPConnection extends EventTarget {
  /**
   * Open the connection
   *
   * @returns A promise that resolves when the connection is opened
   */
  open(): Promise<void>;
  /**
   * Send a message
   *
   * @param method The method of the message
   * @param params The parameters of the message
   * @param sesssionId The session ID of the message
   * @returns The response
   */
  sendMessage(
    method: string,
    params: CDPObject,
    sesssionId?: string,
    // deno-lint-ignore no-explicit-any
  ): Promise<any>;
  /**
   * Close the connection
   *
   * @returns A promise that resolves when the connection is closed
   */
  close(): void;
}

/**
 * Event of domain event listeners
 */
declare interface CDPEvent<Params = any, Type extends string = string> {
  /**
   * The event type
   */
  type: Type;
  /**
   * The parameters
   */
  // deno-lint-ignore no-explicit-any
  params: Params;
  /**
   * The session ID
   */
  sessionId?: string;
}

/**
 * Function of domain event listeners
 *
 * @param event The event
 * @returns The result
 */
declare type CDPEventListener<Params = any, Type extends string = string> = (
  event: CDPEvent<Params, Type>,
) => void | Promise<void>;

declare type CDPCommandName = keyof ProtocolMapping.Commands & string;

declare type CDPProtocolEventName = keyof ProtocolMapping.Events & string;

declare type CDPDomainPropertyKey =
  | (CDPCommandName extends `${infer Domain}.${string}` ? Domain : never)
  | (CDPProtocolEventName extends `${infer Domain}.${string}` ? Domain : never);

declare type CDPDomainCommandName<Domain extends CDPDomainPropertyKey> =
  Extract<CDPCommandName, `${Domain}.${string}`>;

declare type CDPDomainEventName<Domain extends CDPDomainPropertyKey> = Extract<
  CDPProtocolEventName,
  `${Domain}.${string}`
>;

declare type CDPDomainMethodName<Command extends CDPCommandName> =
  Command extends `${string}.${infer Method}` ? Uncapitalize<Method> : never;

declare type CDPDomainEventType<EventName extends CDPProtocolEventName> =
  EventName extends `${string}.${infer Type}` ? Uncapitalize<Type> : never;

declare type CDPDomainEventTypeName<Domain extends CDPDomainPropertyKey> =
  CDPDomainEventType<CDPDomainEventName<Domain>>;

declare type CDPDomainEventForType<
  Domain extends CDPDomainPropertyKey,
  Type extends CDPDomainEventTypeName<Domain>,
> = Extract<CDPProtocolEventName, `${Domain}.${Type}`>;

declare type CDPDomainEventParams<EventName extends CDPProtocolEventName> =
  ProtocolMapping.Events[EventName] extends [infer Params] ? Params : undefined;

declare type CDPCommandParams<Command extends CDPCommandName> =
  ProtocolMapping.Commands[Command]["paramsType"] extends [infer Params]
    ? Params
    : never;

declare type CDPCommandReturn<Command extends CDPCommandName> =
  ProtocolMapping.Commands[Command]["returnType"];

declare type CDPCommandMethod<Command extends CDPCommandName> =
  ProtocolMapping.Commands[Command]["paramsType"] extends []
    ? (args?: null, sessionId?: string) => Promise<CDPCommandReturn<Command>>
    : {} extends CDPCommandParams<Command>
      ? (
          args?: CDPCommandParams<Command> | null,
          sessionId?: string,
        ) => Promise<CDPCommandReturn<Command>>
      : (
          args: CDPCommandParams<Command>,
          sessionId?: string,
        ) => Promise<CDPCommandReturn<Command>>;

/**
 * Domain event listener registration methods
 */
declare class CDPDomainListeners<
  Domain extends CDPDomainPropertyKey = CDPDomainPropertyKey,
> {
  /**
   * Add an event listener
   *
   * @param type The type of the event
   * @param listener The listener of the event
   */
  addEventListener<Type extends CDPDomainEventTypeName<Domain>>(
    type: Type,
    listener: CDPEventListener<
      CDPDomainEventParams<CDPDomainEventForType<Domain, Type>>,
      CDPDomainEventForType<Domain, Type>
    >,
  ): void;
  /**
   * Remove an event listener
   *
   * @param type The type of the event
   * @param listener The listener of the event
   */
  removeEventListener<Type extends CDPDomainEventTypeName<Domain>>(
    type: Type,
    listener: CDPEventListener<
      CDPDomainEventParams<CDPDomainEventForType<Domain, Type>>,
      CDPDomainEventForType<Domain, Type>
    >,
  ): void;
}

/**
 * Domain methods (e.g. `enable()`, `disable()`...)
 */
declare type CDPDomainMethods<
  Domain extends CDPDomainPropertyKey = CDPDomainPropertyKey,
> = {
  /**
   * Method of the domain
   *
   * @param args The arguments
   * @param sessionId The session ID
   * @returns The result
   */
  [Command in CDPDomainCommandName<Domain> as CDPDomainMethodName<Command>]: CDPCommandMethod<Command>;
};

/**
 * Domain of the API (e.g. `Page`, `Target`, `Runtime`...)
 */
declare type CDPDomain<
  Domain extends CDPDomainPropertyKey = CDPDomainPropertyKey,
> = CDPDomainListeners<Domain> & CDPDomainMethods<Domain>;

/**
 * Members of the API
 */
declare class CDPMembers {
  /**
   * The options
   */
  options: CDPOptions;
  /**
   * The connection object
   */
  readonly connection: CDPConnection;
  /**
   * Reset the connection
   */
  reset(): void;
}

declare type CDPProtocolDomains = {
  /**
   * Domain of the API (e.g. `Page`, `Target`, `Runtime`...)
   */
  [Domain in CDPDomainPropertyKey]: CDPDomain<Domain>;
};

/**
 * Target info
 */
declare interface CDPTargetInfo {
  /**
   * The target ID
   */
  id: string;
  /**
   * The target type
   */
  type: string;
  /**
   * The target title
   */
  title: string;
  /**
   * The target URL
   */
  url: string;
  /**
   * The target WebSocket URL
   */
  webSocketDebuggerUrl: string;
}

/**
 * API
 */
declare class CDP extends CDPMembers {
  /**
   * Create a new instance
   *
   * @param options The options
   */
  constructor(options?: CDPOptions);
  /**
   * Get the targets
   *
   * @returns The targets
   */
  static getTargets(): Promise<CDPTargetInfo[]>;
  /**
   * Create a target
   *
   * @param url The URL of the target
   *
   * @returns The target info
   */
  static createTarget(url?: string): Promise<CDPTargetInfo>;
  /**
   * Activate a target
   *
   * @param targetId The ID of the target
   * @returns A promise that resolves when the target is activated
   */
  static activateTarget(targetId: string): Promise<string>;
  /**
   * Close a target
   *
   * @param targetId The ID of the target
   * @returns A promise that resolves when the target is closed
   */
  static closeTarget(targetId: string): Promise<string>;
}

declare interface CDP extends CDPProtocolDomains {}

/**
 * API object
 */
declare const cdp: CDP;

/**
 * Options of the connection
 */
declare const options: CDPOptions;

/**
 * Get the targets
 */
declare const getTargets: typeof CDP.getTargets;
/**
 * Create a target
 */
declare const createTarget: typeof CDP.createTarget;
/**
 * Activate a target
 */
declare const activateTarget: typeof CDP.activateTarget;
/**
 * Close a target
 */
declare const closeTarget: typeof CDP.closeTarget;
/**
 * Error code of the connection refused error
 */
declare const CONNECTION_REFUSED_ERROR_CODE: string;
/**
 * Error code when encountering a connection error
 */
declare const CONNECTION_ERROR_CODE: string;

export {
  activateTarget,
  CDP,
  cdp,
  closeTarget,
  createTarget,
  getTargets,
  options,
  CONNECTION_REFUSED_ERROR_CODE,
  CONNECTION_ERROR_CODE,
};

export type { CDPOptions, CDPValue, CDPConnection, CDPEvent, CDPTargetInfo };

