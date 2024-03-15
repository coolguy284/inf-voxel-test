class ChatManager {
  #chatElem;
  #messages = [];
  
  constructor(chatElem) {
    this.#chatElem = chatElem;
  }
  
  displayMessage(string) {
    this.#messages.push(string);
    if (this.#messages.length > maxChatMsgs) {
      this.#messages.splice(0, this.#messages.length - maxChatMsgs);
    }
    this.updateChatElem();
  }
  
  clearChat() {
    this.#messages = [];
    this.updateChatElem();
  }
  
  updateChatElem() {
    this.#chatElem.innerText = this.#messages.join('\n');
  }
}
