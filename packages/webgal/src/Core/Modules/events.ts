interface IWebgalEvent<T> {
  on: (callback: (message?: T) => void, id?: string) => void;
  off: (callback: (message?: T) => void, id?: string) => void;
  emit: (message?: T, id?: string) => void;
}

type EventHandler = (...args: any[]) => void;
const bus = new Map<string, Set<EventHandler>>();

function formEvent<T>(eventName: string): IWebgalEvent<T> {
  return {
    on: (callback, id?) => {
      const name = `${eventName}-${id ?? ''}`;
      if (!bus.has(name)) bus.set(name, new Set());
      bus.get(name)!.add(callback as EventHandler);
    },
    emit: (message?, id?) => {
      const name = `${eventName}-${id ?? ''}`;
      bus.get(name)?.forEach((cb) => cb(message));
    },
    off: (callback, id?) => {
      const name = `${eventName}-${id ?? ''}`;
      bus.get(name)?.delete(callback as EventHandler);
    },
  };
}

export class Events {
  public textSettle = formEvent('text-settle');
  public userInteractNext = formEvent('__NEXT');
  public fullscreenDbClick = formEvent('fullscreen-dbclick');
  public styleUpdate = formEvent('style-update');
  public afterStyleUpdate = formEvent('after-style-update');
}
