import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { ResourceEntity } from '~/models/Resource'

@Module({
  name: 'ResourceStore',
  stateFactory: true,
  namespaced: true
})
export default class ResourceStore extends VuexModule {
  _resources: ResourceEntity[] = []

  public get resources(): ResourceEntity[] {
    return this._resources
  }

  @Mutation
  setResources(es: ResourceEntity[]) {
    this._resources = es
  }
}
