const { Client } = require('tmi.js');

module.exports = class Tmi extends Client {
  #stats = {
    msgsThisMinute: 0,
    msgsPerMinute: 0,
    msgsPerSecond: 0,
    wordsThisMinute: 0,
    wordsPerMinute: 0,
    wordsPerMessage: 1,

    lastMinuteMsgs: 0,
    lastWordsCount: 0,
    messagesLenghts: []
  };
  #sendLog;

  constructor(sendLog) {
    super({
      options: { debug: false },
      channels: [] // Canales de twitch para que el cliente se conecte
    });

    this.#sendLog = sendLog;

    this.once('connected', this.onReady);
    this.on('message', this.onMessage);
    // this.on('action')
  }

  async chJoin(channel = '') {
    if (!channel || typeof channel !== 'string') return false;
    return await this.join(channel);
  }

  async chLeave(channel = '') {
    if (!channel || typeof channel !== 'string') return false;
    return await this.part(channel);
  }

  /**
   *
   * @param {String} channel
   * @param {import('tmi.js').Userstate} userstate
   * @param {String} message
   */
  async onMessage(channel, userstate, message) {
    this.statsManager(message);

    channel = channel.slice(1);
    this.#sendLog(`|${channel}|<${userstate.username}> ${message}`);
  }

  statsManager(message) {
    this.#stats.messagesLenghts.push(message?.split(' ')?.length || 0);

    this.#stats.msgsThisMinute++;
    this.#stats.wordsThisMinute += message?.split(' ')?.length || 0;
    this.#stats.wordsPerMessage =
      Math.floor(
        (this.#stats.messagesLenghts.reduce((p, c) => p + c) / this.#stats.messagesLenghts.length) *
          100
      ) / 100;
    if (this.#stats.messagesLenghts.length > 50) this.#stats.messagesLenghts.shift();
  }

  updateStats() {
    if (this.#stats.lastMinuteMsgs === 0) this.#stats.lastMinuteMsgs = this.#stats.msgsThisMinute;
    if (this.#stats.lastWordsCount === 0) this.#stats.lastWordsCount = this.#stats.wordsThisMinute;

    this.#stats.msgsPerMinute = Math.floor(
      (this.#stats.msgsThisMinute + this.#stats.lastMinuteMsgs) / 2
    );
    this.#stats.wordsPerMinute = Math.floor(
      (this.#stats.wordsThisMinute + this.#stats.lastWordsCount) / 2
    );

    this.#stats.msgsPerSecond = Math.floor((this.#stats.msgsThisMinute / 60) * 100) / 100;

    this.#stats.lastMinuteMsgs = this.#stats.msgsThisMinute;
    this.#stats.lastWordsCount = this.#stats.wordsThisMinute;
    this.#stats.msgsThisMinute = 0;
    this.#stats.wordsThisMinute = 0;
  }

  getStats() {
    return (
      ' [' +
      `MsgThisMin: ${this.#stats.msgsThisMinute} | MsgPerMin: ${
        this.#stats.msgsPerMinute
      } | MsgPerSec: ${this.#stats.msgsPerSecond}  -  WorThisMin: ${
        this.#stats.wordsThisMinute
      } | WorPerMin ${this.#stats.wordsPerMinute} | WorPerMsg: ${this.#stats.wordsPerMessage}`
        .yellow +
      ']'
    );
  }

  onReady() {
    this.#sendLog('Cliente conectado a twitch');
  }

  async init() {
    await this.connect();

    setInterval(this.updateStats.bind(this), 60 * 1000);
  }
};
