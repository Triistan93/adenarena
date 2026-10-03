export type CloudSaveQueueOptions = {
  throttleMs?: number;
  now?: () => number;
  setTimeout?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  clearTimeout?: (timer: ReturnType<typeof setTimeout>) => void;
};

export type CloudSaveQueue = {
  schedule: (userId: string, saveFn: () => Promise<boolean>) => Promise<boolean>;
  scheduleImmediate: (userId: string, saveFn: () => Promise<boolean>) => Promise<boolean>;
};

export function createCloudSaveQueue(options?: CloudSaveQueueOptions): CloudSaveQueue;
