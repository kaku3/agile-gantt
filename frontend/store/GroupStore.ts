import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { GroupEntity } from '~/models/Group'

@Module({
  name: 'GroupStore',
  stateFactory: true,
  namespaced: true
})
export default class GroupStore extends VuexModule {
  _groups: GroupEntity[] = []

  public get groups(): GroupEntity[] {
    return this._groups
  }

  @Mutation
  setGroups(es: GroupEntity[]) {
    this._groups = es
  }
}
