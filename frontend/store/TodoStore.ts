import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { TodoEntity } from '~/models/Todo'

@Module({
  name: 'TodoStore',
  stateFactory: true,
  namespaced: true
})
export default class TodoStore extends VuexModule {
  _todos: TodoEntity[] = [];

  get todos(): TodoEntity[] {
    return this._todos
  }

  @Mutation
  setTodos(todos: TodoEntity[]) {
    this._todos = todos.map(t => JSON.parse(JSON.stringify(t)))
  }

  @Action
  async loadTodos($axios: any) {
    const { data } = await $axios.get('/todos')
    this.setTodos(data)
    return this._todos
  }
}
