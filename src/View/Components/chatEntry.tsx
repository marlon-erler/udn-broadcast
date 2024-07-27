import * as React from "bloatless-react";

import ChatViewModel from "../../ViewModel/Chat/chatViewModel";

export function ChatEntry(chatViewModel: ChatViewModel) {
  const view = (
    <button
      class="tile colored-tile chat-entry"
      set:color={chatViewModel.settingsPageViewModel.color}
      style="height: 8rem"
      on:click={chatViewModel.open}
      toggle:unread={chatViewModel.hasUnreadMessages}
    >
      <span
        class="shadow"
        subscribe:innerText={chatViewModel.settingsPageViewModel.primaryChannel}
      ></span>
      <h2
        subscribe:innerText={chatViewModel.settingsPageViewModel.primaryChannel}
      ></h2>
    </button>
  );

  chatViewModel.index.subscribe((newIndex) => {
    view.style.order = newIndex;
  });

  return view;
}

export const ChatViewModelToChatEntry: React.StateItemConverter<
  ChatViewModel
> = (chatViewModel: ChatViewModel) => {
  return ChatEntry(chatViewModel);
};
