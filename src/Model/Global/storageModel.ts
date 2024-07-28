// this file is responsible for reading and writing persistent data.

import { DATA_VERSION, ValidObject } from "../Utility/typeSafety";
import { localeCompare, parseValidObject, stringify } from "../Utility/utility";

export const PATH_COMPONENT_SEPARATOR = "\\";

export default class StorageModel {
  storageEntryTree: StorageEntry = {};

  // read
  read = (pathComponents: string[]): string | null => {
    const pathString: string = StorageModel.pathComponentsToString(
      ...pathComponents
    );
    return localStorage.getItem(pathString);
  };

  list = (pathComponents: string[]): string[] => {
    let currentParent: StorageEntry = this.storageEntryTree;
    for (const component of pathComponents) {
      const nextParent: StorageEntry | undefined = currentParent[component];
      if (nextParent == undefined) return [];
      currentParent = nextParent;
    }

    return [...Object.keys(currentParent).sort(localeCompare)];
  };

  // write
  write = (pathComponents: string[], value: string): void => {
    const pathString: string = StorageModel.pathComponentsToString(
      ...pathComponents
    );
    localStorage.setItem(pathString, value);
    this.updateTree(...pathComponents);
  };

  remove = (
    pathComponents: string[],
    shouldInitialize: boolean = true
  ): void => {
    const pathString: string = StorageModel.pathComponentsToString(
      ...pathComponents
    );
    localStorage.removeItem(pathString);

    if (shouldInitialize == true) {
      this.initializeTree();
    }
  };

  rename = (
    sourcePathComponents: string[],
    destinationPathComponents: string[],
    shouldInitialize: boolean = true
  ): boolean => {
    const content: string | null = this.read(sourcePathComponents);
    if (content == null) return false;

    this.write(destinationPathComponents, content);
    this.remove(sourcePathComponents);

    if (shouldInitialize == true) {
      this.initializeTree();
    }
    return true;
  };

  // recursion
  recurse = (rootDirectory: string[], fn: (path: string[]) => void): void => {
    loop_over_files: for (const key of Object.keys(localStorage)) {
      // get path of current entity
      const pathComponentsOfCurrentEntity: string[] =
        StorageModel.stringToPathComponents(key);

      // exit if entity does not match
      loop_over_path_components: for (
        let i = 0;
        i < rootDirectory.length;
        i++
      ) {
        if (!pathComponentsOfCurrentEntity[i]) continue loop_over_files;
        if (pathComponentsOfCurrentEntity[i] != rootDirectory[i])
          continue loop_over_files;
      }

      // execute
      fn(pathComponentsOfCurrentEntity);
    }
    this.initializeTree();
  };

  removeRecursively = (pathComponents: string[]): void => {
    this.recurse(pathComponents, (path: string[]) => this.remove(path, false));
    this.initializeTree();
  };

  renameRecursively = (
    sourcePathComponents: string[],
    destinationPathComponents: string[]
  ): void => {
    this.recurse(sourcePathComponents, (path: string[]) => {
      // assemble destinationPath
      const relativePathOfCurrentEntity = path.slice(
        sourcePathComponents.length
      );
      const destinationPathComponentsOfCurrentEntity = [
        ...destinationPathComponents,
        ...relativePathOfCurrentEntity,
      ];

      // rename
      this.rename(path, destinationPathComponentsOfCurrentEntity, false);
    });
    this.initializeTree();
  };

  // stringifiable
  writeStringifiable = (pathComponents: string[], value: ValidObject): void => {
    const valueString: string = stringify(value);
    this.write(pathComponents, valueString);
  };

  readStringifiable = <T extends ValidObject>(
    pathComponents: string[],
    reference: T
  ): T | null => {
    const valueString: string | null = this.read(pathComponents);
    if (!valueString) return null;

    const object: any | null = parseValidObject(valueString, reference);
    if (object == null) return null;

    return object;
  };

  // cleaning
  removeJunk = (): void => {
    this.recurse([], (path: string[]) => {
      if (path[0] == DATA_VERSION) return;
      this.remove(path);
    })
  }

  // tree
  initializeTree = (): void => {
    console.log("initializing tree");

    this.storageEntryTree = {};
    for (const key of Object.keys(localStorage)) {
      const components: string[] = StorageModel.stringToPathComponents(key);
      this.updateTree(...components);
    }
  };

  updateTree = (...pathComponents: string[]): void => {
    let currentParent: StorageEntry = this.storageEntryTree;
    for (const pathPart of pathComponents) {
      if (!currentParent[pathPart]) {
        currentParent[pathPart] = {};
      }

      currentParent = currentParent[pathPart];
    }
  };

  printTree = (): string => {
    return stringify(this.storageEntryTree);
  };

  // init
  constructor() {
    this.initializeTree();
  }

  // utility
  static getFileName = (pathComponents: string[]): string => {
    return pathComponents[pathComponents.length - 1] || "\\";
  };

  static getFileNameFromString = (pathString: string): string => {
    const pathComponents: string[] = this.stringToPathComponents(pathString);
    return pathComponents[pathComponents.length - 1] || "\\";
  };

  static pathComponentsToString = (...pathComponents: string[]): string => {
    return pathComponents.filter((x) => x != "").join(PATH_COMPONENT_SEPARATOR);
  };

  static stringToPathComponents = (string: string): string[] => {
    return string.split(PATH_COMPONENT_SEPARATOR).filter((x) => x != "");
  };

  static join = (...items: string[]): string => {
    let allComponents: string[] = [];
    for (const item of items) {
      const parts = this.stringToPathComponents(item);
      allComponents.push(...parts);
    }
    return StorageModel.pathComponentsToString(...allComponents);
  };

  static getPath(
    locationName: StorageModelSubPath,
    filePath: string[]
  ): string[] {
    return [DATA_VERSION, locationName, ...filePath];
  }
}

// types
export type StorageEntry = { [key: string]: StorageEntry };

// locations
export enum StorageModelSubPath {
  Chat = "chat",

  ConnectionModel = "connection",
  SettingsModel = "settings",
}

export const filePaths = {
  connectionModel: {
    socketAddress: ["socket-address"],
    reconnectAddress: ["reconnect-address"],
    outbox: ["outbox"],
    mailboxes: ["mailboxes"],

    previousAddresses: ["previous-addresses"],
  },

  chat: {
    base: [],
    chatBase: (id: string) => [id],
    info: (id: string) => [...filePaths.chat.chatBase(id), "info"],
    color: (id: string) => [...filePaths.chat.chatBase(id), "color"],
    messages: (id: string) => [...filePaths.chat.chatBase(id), "messages"],
    lastUsedPage: (id: string) => [
      ...filePaths.chat.chatBase(id),
      "last-used-page",
    ],
    files: (id: string) => [...filePaths.chat.chatBase(id), "files"],
  },

  settingsModel: {
    username: ["user-name"],
    firstDayOfWeek: ["first-day-of-week"],
  },
};
