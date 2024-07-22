import * as React from "bloatless-react";

import StorageModel, { PATH_COMPONENT_SEPARATOR } from "../../Model/Global/storageModel";

import StorageViewModel from "../../ViewModel/storageViewModel";

export function DirectoryItemList(
  storageViewModel: StorageViewModel,
  pathString: string = PATH_COMPONENT_SEPARATOR
) {
  // converter
  const StringToDirectoryItemList: React.StateItemConverter<string> = (
    pathString: string
  ) => DirectoryItemList(storageViewModel, pathString);

  // data
  const path = StorageModel.stringToPathComponents(pathString);
  const fileName = StorageModel.getFileName(path);
  const items = new React.ListState<string>();

  const style = `text-indent: ${path.length * 2}rem`;

  // methods
  function loadItems() {
    items.clear();

    const directoryItems = storageViewModel.storageModel.list(path);

    for (const directoryItem of directoryItems) {
      const itemPath = [...path, directoryItem];
      const pathString = StorageModel.pathComponentsToString(...itemPath);
      items.add(pathString);
    }
  }

  function select() {
    storageViewModel.selectedPath.value = pathString;
  }

  // handlers
  storageViewModel.lastDeletedItemPath.subscribe((lastDeletedItemPath) => {
    if (!items.value.has(lastDeletedItemPath)) return;

    select();
    setTimeout(() => loadItems(), 50)
  });

  // state
  const isSelected = React.createProxyState(
    [storageViewModel.selectedPath],
    () => storageViewModel.selectedPath.value == pathString
  );

  isSelected.subscribe(() => {
    if (isSelected.value == false) return;
    loadItems();
  });

  return (
    <div class="flex-column">
      <button
        class="width-100 flex-1 clip"
        toggle:selected={isSelected}
        on:click={select}
      >
        <span class="ellipsis width-100 flex-1" style={style}>
          {fileName}
        </span>
      </button>

      <div
        class="flex-column"
        children:append={[items, StringToDirectoryItemList]}
      ></div>
    </div>
  );
}
