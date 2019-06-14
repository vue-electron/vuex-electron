import { Plugin } from 'vuex'
import { IpcMain, IpcRenderer } from 'electron'

export interface PersistedStateOptions {
  storage?: {
    set(key: string, value: any): void;
    get(key: string): any;
    delete(key: string): void;
  };
  storageKey?: string;
  whitelist?: string[];
  blacklist?: string[];
}
export interface SharedMutationsOptions {
  type?: 'renderer' | 'main';
  ipcMain?: IpcMain;
  ipcRenderer?: IpcRenderer;
}

export function createPersistedState<S>(
  options?: PersistedStateOptions
): Plugin<S>
export function createSharedMutations<S>(
  options?: SharedMutationsOptions
): Plugin<S> 
