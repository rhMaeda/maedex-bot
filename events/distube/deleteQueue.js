module.exports = class DeleteQueueEvent {
  constructor(client) {
    this.client = client;
    this.name = 'deleteQueue';
  }

  run(queue) {
    this.client.radioStations.delete(queue.id);
  }
};
