import * as React from "bloatless-react";

import SettingsModel from "../../Model/Global/settingsModel";

export default class SettingsViewModel {
  settingsModel: SettingsModel;

  // state
  username: React.State<string> = new React.State("");
  usernameInput: React.State<string> = new React.State("");
  firstDayOfWeekInput: React.State<string> = new React.State("0");

  // guards
  cannotSetName: React.State<boolean> = React.createProxyState(
    [this.usernameInput],
    () =>
      this.usernameInput.value == "" ||
      this.usernameInput.value == this.settingsModel.username
  );

  // set
  setName = (): void => {
    this.settingsModel.setName(this.usernameInput.value);
    this.username.value = this.settingsModel.username;
    this.usernameInput.callSubscriptions();
  };

  setFirstDayofWeek = (): void => {
    this.settingsModel.setFirstDayOfWeek(this.firstDayOfWeekInput.value);
  };

  // init
  constructor(settingsModel: SettingsModel) {
    this.settingsModel = settingsModel;

    this.username.value = settingsModel.username;
    this.usernameInput.value = settingsModel.username;
    this.firstDayOfWeekInput.value = settingsModel.firstDayOfWeek;

    // subscriptions
    this.firstDayOfWeekInput.subscribe(this.setFirstDayofWeek);
  }
}
