// this file is responsible for sending and handling files.

import { decryptString, encryptString } from "../Utility/crypto";
import { generateRandomToken, parse, stringify } from "../Utility/utility";

import ConnectionModel from "./connectionModel";
import { Message } from "udn-frontend";
import StorageModel from "./storageModel";
import { checkMatchesObjectStructure } from "../Utility/typeSafety";

export default class FileTransferModel {
  storageModel: StorageModel;
  connectionModel: ConnectionModel;

  // data
  transferData: TransferData | undefined;

  // general
  generateTransferData = (): TransferData => {
    const transferData: TransferData = {
      channel: generateRandomToken(2),
      key: generateRandomToken(3),
    };
    this.transferData = transferData;
    return transferData;
  };

  prepareToReceive = (transferData: TransferData) => {
    this.connectionModel.addChannel(transferData.channel);
    this.transferData = transferData;
  };

  // handlers
  handleMessage = (data: Message): void => {
    if (this.transferData == undefined) return;
    if (data.messageChannel != this.transferData.channel) return;
  };

  handleFile = async (encryptedFileData: string): Promise<void> => {
    if (this.transferData == undefined) return;

    const decrypted: string = await decryptString(
      encryptedFileData,
      this.transferData.key
    );

    const parsed: any = parse(decrypted);
    const isFileData: boolean = checkMatchesObjectStructure(
      parsed,
      FileDataReference
    );
    if (isFileData == false) return;

    const fileData: FileData = parsed;
    this.storageModel.write(fileData.path, fileData.body);
  };

  // sending
  sendFiles = (
    directoryPaths: BuiltinIterator<string[]>,
    callback: (path: string) => void
  ): void => {
    for (const directoryPath of directoryPaths) {
      this.storageModel.recurse(directoryPath, (filePath: string[]) => {
        this.sendFile(filePath);
        const pathString: string = StorageModel.pathComponentsToString(
          ...filePath
        );
        callback(pathString);
      });
    }
  };

  sendFile = async (filePath: string[]): Promise<void> => {
    if (this.transferData == undefined) return;
    const fileContent: string | null = this.storageModel.read(filePath);
    if (fileContent == null) return;

    const fileData: FileData = {
      path: filePath,
      body: fileContent,
    };
    const stringifiedFileData: string = stringify(fileData);
    const encryptedFileData: string = await encryptString(
      fileContent,
      stringifiedFileData
    );
    this.connectionModel.sendPlainMessage(
      this.transferData.channel,
      encryptedFileData
    );
  };

  // init
  constructor(storageModel: StorageModel, connectionModel: ConnectionModel) {
    this.storageModel = storageModel;
    this.connectionModel = connectionModel;

    this.connectionModel.messageHandlerManager.addHandler(this.handleMessage);
  }
}

export interface TransferData {
  channel: string;
  key: string;
}

export interface FileData {
  path: string[];
  body: string;
}

export const FileDataReference: FileData = {
  path: [""],
  body: "",
};
