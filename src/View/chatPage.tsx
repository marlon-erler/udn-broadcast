import "./homePage.css";

import * as React from "bloatless-react";

import ChatViewModel, { ChatPageType } from "../ViewModel/Chat/chatViewModel";

import { ChatViewToggleButton } from "./Components/chatViewToggleButton";
import { MessagePage } from "./ChatPages/messagePage";
import { SettingsPage } from "./ChatPages/settingsPage";
import { TaskPage } from "./ChatPages/taskPage";
import { translations } from "./translations";

export function ChatPage(chatViewModel: ChatViewModel) {
  const mainContent = React.createProxyState(
    [chatViewModel.selectedPage],
    () => {
      chatViewModel.closeSubPages();

      switch (chatViewModel.selectedPage.value) {
        case ChatPageType.Settings: {
          return SettingsPage(chatViewModel.settingsPageViewModel);
        }
        case ChatPageType.Tasks: {
          return TaskPage(chatViewModel.taskPageViewModel);
        }
        default: {
          return MessagePage(chatViewModel.messagePageViewModel);
        }
      }
    }
  );

  return (
    <article
      id="chat-page"
      set:color={chatViewModel.displayedColor}
      class="subtle-background"
    >
      <div>
        <div id="ribbon">
          <button
            class="ghost"
            aria-label={translations.chatPage.closeChatAudioLabe}
            on:click={chatViewModel.close}
          >
            <span class="icon">close</span>
          </button>

          <span>
            {ChatViewToggleButton(
              translations.chatPage.pages.calendar,
              "calendar_month",
              ChatPageType.Calendar,
              chatViewModel
            )}
            {ChatViewToggleButton(
              translations.chatPage.pages.tasks,
              "task_alt",
              ChatPageType.Tasks,
              chatViewModel
            )}
            {ChatViewToggleButton(
              translations.chatPage.pages.messages,
              "forum",
              ChatPageType.Messages,
              chatViewModel
            )}
            {ChatViewToggleButton(
              translations.chatPage.pages.settings,
              "settings",
              ChatPageType.Settings,
              chatViewModel
            )}
          </span>
        </div>
        <div id="main" children:set={mainContent}></div>
      </div>
    </article>
  );
}
