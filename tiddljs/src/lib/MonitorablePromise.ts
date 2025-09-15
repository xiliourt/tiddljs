import { EventMap, ProgressUpdate } from '../types/promiseUpdates';
export class MonitorablePromise<T> {
  // Listeners are now typed according to our EventMap
  private _listeners: { [K in keyof EventMap]?: ((data: EventMap[K]) => void)[] } = {};
  public readonly promise: Promise<T>;

  constructor(executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    // The notify function is now strictly typed to only send 'progress' events
    notify: (data: ProgressUpdate) => void
  ) => void) {
    this.promise = new Promise<T>((resolve, reject) => {
      const notify = (data: ProgressUpdate) => {
        // We specifically emit the 'progress' event
        this._emit('progress', data);
      };
      executor(resolve, reject, notify);
    });
  }

  // The 'on' method now uses generics to correctly type the callback parameter
  public on<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): this {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    // The cast is safe because K is a key of EventMap
    (this._listeners[eventName] as ((data: EventMap[K]) => void)[]).push(callback);
    return this;
  }

  // The '_emit' method is also updated for type safety
  private _emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void {
    if (this._listeners[eventName]) {
      this._listeners[eventName]!.forEach(callback => callback(data));
    }
  }

  // .then(), .catch(), and .finally() remain unchanged
  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected);
  }

  public finally(onfinally?: (() => void) | null): Promise<T> {
    return this.promise.finally(onfinally);
  }
}
