import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { ConfigEntity, newConfigEntity, PluginEntity } from '~/models/Config'

@Module({
  name: 'ConfigStore',
  stateFactory: true,
  namespaced: true
})
export default class ConfigStore extends VuexModule {
  _config: ConfigEntity = newConfigEntity();

  public get config(): ConfigEntity {
    return this._config;
  }

  @Mutation
  setConfig(e: ConfigEntity) {
    this._config = e;
  }

  @Mutation
  setPlugins(plugins: PluginEntity[]) {
    this._config.plugins = plugins.map(p => Object.assign({}, p))
  }
}
