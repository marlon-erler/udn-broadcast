import * as React from "bloatless-react";

import {
  PropertyValueList,
  createPropertyValueIndexState,
} from "../Components/propertyValueList";

import BoardViewModel from "../../ViewModel/Pages/boardViewModel";
import { FilteredList } from "../Components/filteredList";
import { TaskCategoryBulkChangeViewModel } from "../../ViewModel/Utility/taskPropertyBulkChangeViewModel";
import TaskViewModel from "../../ViewModel/Pages/taskViewModel";
import { TaskViewModelToEntry } from "../Components/taskEntry";
import { allowDrop } from "../utility";
import { translations } from "../translations";

export function BoardKanbanPage(boardViewModel: BoardViewModel) {
  return PropertyValueList(
    "category",
    (taskViewModel: TaskViewModel) => taskViewModel.task,
    boardViewModel.taskViewModels,
    (
      categories: React.ListState<string>,
      sortedCategories: React.State<string[]>
    ) => {
      const categoryNameConverter: React.StateItemConverter<string> = (
        categoryName: string
      ) => {
        const index: React.State<number> = createPropertyValueIndexState(
          sortedCategories,
          categoryName
        );
        return KanbanBoard(categoryName, index, boardViewModel);
      };

      return (
        <div
          class="kanban-board-wrapper"
          children:append={[categories, categoryNameConverter]}
        ></div>
      );
    }
  );
}

function KanbanBoard(
  categoryName: string,
  index: React.State<number>,
  boardViewModel: BoardViewModel
) {
  return FilteredList(
    { category: categoryName },
    (taskViewModel: TaskViewModel) => taskViewModel.task,
    boardViewModel.filteredTaskViewModels,
    (taskViewModels: React.ListState<TaskViewModel>) => {
      const viewModel: TaskCategoryBulkChangeViewModel =
        new TaskCategoryBulkChangeViewModel(taskViewModels, categoryName);

      function drop() {
        boardViewModel.handleDropWithinBoard(categoryName);
      }

      const view = (
        <div class="flex-column flex-no" on:dragover={allowDrop} on:drop={drop}>
          <div class="flex-row width-input">
            <input
              placeholder={
                translations.chatPage.task.renameCategoryInputPlaceholder
              }
              bind:value={viewModel.inputValue}
              on:enter={viewModel.set}
            ></input>
            <button
              class="primary"
              on:click={viewModel.set}
              toggle:disabled={viewModel.cannotSet}
            >
              <span class="icon">check</span>
            </button>
          </div>

          <hr></hr>

          <div
            class="kanban-column"
            children:append={[taskViewModels, TaskViewModelToEntry]}
          ></div>
        </div>
      );

      index.subscribe((newIndex) => {
        view.style.order = newIndex;
      });
      
      return view;
    }
  );
}
