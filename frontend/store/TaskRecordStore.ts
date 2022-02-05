import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { TaskEntity } from '~/models/Task'

@Module({
  name: 'TaskRecordStore',
  stateFactory: true,
  namespaced: true
})
export default class TaskRecordStore extends VuexModule {
  _taskRecords: TaskEntity[] = [];

  public get taskRecords(): TaskEntity[] {
    return this._taskRecords;
  }

  @Mutation
  setTaskRecords(es: TaskEntity[]) {
    this._taskRecords = es;
  }
}
