export class ChatHistory {
  constructor({messageLimit}) {
    this._messages = [];
    this._messageLimit = messageLimit;
  }

  addMessage(message) {
    // Add message to the array.
    this._messages.push(message);
    // Make sure array doesn't exceed the message limit.
    if (this._messages.length > this._messageLimit) {
      this._messages.shift();
    }
  }

  getMessages() {
    // Return a defensive copy of the array.
    return this._messages.slice();
  }
};
