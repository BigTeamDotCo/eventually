module.exports = class ActionModel {
  /**
   * @var { * }
   */
  get data() { return this._data; }
  set data(value) {
    const deadline = new Date(value.deadline);
    delete value.deadline;
    const date = new Date(value.date);
    delete value.date;

    this._data = {
      ...value,
      deadline,
      date,
    };
  }

  get id() { return this.data.id; }
  set id(value) { this.data.id = value; }

  get date() { return this.data.date; }
  set date(value) { this.data.date = value; }

  get action() { return this.data.action; }
  set action(value) { this.data.action = value; }

  get actionState() { return this.data.actionState; }
  set actionState(value) { this.data.actionState = value; }

  get priority() { return this.data.priority; }
  set priority(value) { this.data.priority = value; }

  get errorList() { return this.data.errorList; }
  set errorList(value) { this.data.errorList = value; }

  get appId() { return this.data.appId; }
  set appId(value) { this.data.appId = value; }

  constructor(data) {
    this.data = data;
  }

  serialize() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    return {
      id: this.id,
      action: this.action,
      actionState: this.actionState,
      priority: this.priority,
      errorList: this.errorList,
      appId: this.appId,
      date: this.date.toISOString(),
      deadline: this.deadline.toISOString(),
    };
  }
}






