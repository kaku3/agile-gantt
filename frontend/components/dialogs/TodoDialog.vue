<template>
  <v-navigation-drawer
    v-model="show"
    width="60%"
    absolute
    right
    component-class="todo-dialog"
    :elevation="6"
  >
    <v-btn fab x-small dark class="close-button" @click="onClose">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-card-text>
      <v-form ref="todoForm" v-model="valid">
        <v-row>
          <v-col cols="7">
            <v-text-field
              ref="subject"
              v-model="form.subject"
              label="Todo"
              :rules="rules.subject"
              required
              dense
            >
            </v-text-field>
          </v-col>
          <v-col cols="2">
            <v-autocomplete
              v-model="select.assigneeId"
              :items="resources"
              :filter="resourceFilter"
              item-text="name"
              item-value="id"
              label="担当"
              class="assignee-input"
              dense
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="3">
            <v-autocomplete
              v-model="select.taskId"
              :items="tasks"
              :filter="taskFilter"
              :item-text="taskName"
              item-value="id"
              label="タスク"
              class="project-input"
              dense
            >
            </v-autocomplete>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-textarea
              v-model="form.body"
              label="詳細"
              rows="1"
              auto-grow
              dense
            >
            </v-textarea>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-text-field
              v-model="form.createDate"
              label="登録日"
              prepend-icon="mdi-calendar"
              disabled
              class="date-input ml-auto"
              dense
            >
            </v-text-field>
          </v-col>
          <v-col cols="auto" id="due-date-col">
            <v-menu
              ref="dueDate"
              v-model="menu.dueDate"
              :close-on-content-click="true"
              transition="fade-transition"
              offset-y
              max-width="290px"
              min-width="auto"
              attach="#due-date-col"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="form.dueDate"
                  label="期日"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  class="date-input"
                  dense
                >
                </v-text-field>
              </template>
              <v-date-picker
                v-model="form.dueDate"
                no-title
                locale="ja"
                :day-format="date => new Date(date).getDate()"
              >
              </v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn class="mt-2" @click="onSave" small>
              {{ form.id == -1 ? '登録' : '更新' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-data-table
      no-data-text="Todoはありません"
      v-model="select.todos"
      :headers="todoHeaders"
      :items="todoStore.todos"
      :fixed-header="true"
      :disable-pagination="true"
      :hide-default-footer="true"
      :single-select="true"
      item-key="id"
      show-select
      dense
      class="todo-table"
      @click:row="onClickTodo"
      @item-selected="onSelectTodo"
    >
      <template v-slot:item.assigneeId="{ item }">
        {{ todoAssigneeName(item.assigneeId) }}
      </template>
      <template v-slot:item.taskId="{ item }">
        {{ todoTaskName(item.taskId) }}
      </template>
      <template v-slot:item.createDate="{ item }">
        {{ todoDate(item.createDate) }}
      </template>
      <template v-slot:item.dueDate="{ item }">
        {{ todoDate(item.dueDate) }}
      </template>
    </v-data-table>
  </v-navigation-drawer>
</template>
<script>
import { getModule } from 'vuex-module-decorators'
import TodoStore from '~/store/TodoStore'
import ResourceStore from '~/store/ResourceStore'
import TaskRecordStore from '~/store/TaskRecordStore'


export default {
  props: {
    value: Boolean,
    task: Object
  },
  data () {
    return {
      valid: false,
      rules: {
        subject: [
          v => !!v || 'required'
        ]
      },
      select: {
        assignee: null,
        task: null,
        todos: []
      },
      form: this.emptyForm(),
      menu: {
        dueDate: false,
      }
    }
  },
  methods: {
    async onSave() {
      console.log('onSave')
      this.$refs.todoForm.validate()
      if(!this.valid) {
        return
      }
      this.$refs.todoForm.resetValidation()

      const todos = this.todoStore.todos.map(t => JSON.parse(JSON.stringify(t)))
      if(this.select.taskId) {
        this.form.taskId = this.select.taskId
      }
      console.log(this.select)
      if(this.select.assigneeId) {
        this.form.assigneeId = this.select.assigneeId
      }
      if(this.form.id === -1) {
        // 新規
        this.form.id = this.newTodoId(todos)
        todos.push(this.form)
      } else {
        // 更新
        todos[todos.findIndex(t => t.id == this.form.id)] = this.form
      }

      this.todoStore.setTodos(todos)
      this.form = this.emptyForm()

      this.$emit('update', todos)
    },

    async onClose() {
      // await this.save(this.task.id)
      this.show = false
    },


    emptyForm() {
      const createDate = new Date(Date.now()).toISOString().substr(0, 10)
      const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString().substr(0, 10)
      return {
        id: -1,
        subject: '',
        body: '',
        assigneeId: 0,
        taskId: 0,
        createDate,
        dueDate
      }
    },
    setForm(o) {
      if(o.assigneeId) {
        this.assignee = this.resources?.find(r => r.id == this.form.assigneeId)
      }
      if(o.taskId) {
        this.task = this.tasks?.find(t => t.id == this.form.taskId)
      }
      this.form = JSON.parse(JSON.stringify(o))
    },

    resourceFilter(item, queryText, itemText) {
      const name = item.name.toLowerCase()
      const email = item.email.toLowerCase()
      const search = queryText.toLowerCase()

      return name.indexOf(search) > -1 || email.indexOf(search) > -1
    },
    taskFilter(item, queryText, itemText) {
      const name = item.parentId ? `${this.tasks[item.parentId].name} ${item.name}` : item.name
      const search = queryText.toLowerCase()

      return name.toLowerCase().indexOf(search) > -1
    },
    taskName(t) {
      let name = t.name
      const p = this.tasks.find(tt => t.parentId === tt.id)
      if(p) {
        name = `${p.name} ${name}`
      }
      return name
    },
    newTodoId(todos) {
      return todos?.length > 0 ? todos.map(t => t.id).reduce((a, v) => Math.max(a, v)) + 1 : 1
    },

    todoAssigneeName (assigneeId) {
      return this.resources?.find(r => r.id == assigneeId)?.name || ''
    },
    todoTaskName (taskId) {
      const t = this.tasks?.find(t => t.id == taskId)
      if(!t) {
        return ''
      }
      return this.taskName(t)
    },
    todoDate (date) {
      if(!date) {
        return ''
      }
      const [ _, mm, dd ] = date.split('-')
      return `${mm}/${dd}`
    },

    onClickTodo(row) {
      this.setForm(row)
    },
    onSelectTodo({ item, value }) {
      if(value) {
        const todos = this.todoStore.todos.map(t => JSON.parse(JSON.stringify(t)))
        todos.splice(todos.findIndex(t => t.id == item.id), 1)

        this.todoStore.setTodos(todos)
        this.$emit('update', todos)
        this.form = this.emptyForm()
        this.select.todos = []
      }
    }
  },
  computed: {
    todoStore() {
      return getModule(TodoStore, this.$store)
    },
    resourceStore() {
      return getModule(ResourceStore, this.$store)
    },
    taskRecordStore() {
      return getModule(TaskRecordStore, this.$store)
    },
    resources() {
      return this.resourceStore.resources || []
    },
    tasks() {
      return this.taskRecordStore.taskRecords || []
    },

    todoHeaders() {
      return [
        {
          text: 'Todo',
          value: 'subject',
          class: 'subject'
        },
        {
          text: '担当者',
          value: 'assigneeId',
          class: 'assignee'
        },
        {
          text: 'タスク',
          value: 'taskId',
          class: 'task'
        },
        {
          text: '登録日',
          value: 'createDate',
          class: 'date'
        },
        {
          text: '期日',
          value: 'dueDate',
          class: 'date'
        },
      ]
    },

    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
  },
  filters: {
  },
  watch: {
    show(v, ov) {
      if(v) {
        this.$refs.todoForm.resetValidation()
        this.form = this.emptyForm()
        this.select.assigneeId = this.resources?.find(r => r.id == this.$auth.user.id)?.id

        this.$nextTick(() => {
          this.$refs.subject.focus()
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>

[component-class=todo-dialog] {
  margin: 48px 0 0;
  height: calc(100% - 48px)!important;
  z-index: 100;
  overflow: visible;
  border-top: 1px solid gray;
  box-shadow: -8px 0 8px -4px rgb(black, .25);

  .close-button {
    position: absolute;
    top: 8px;
    left: -24px;
  }

  .date-input {
    max-width: 8rem;
  }

  #due-date-col {
    position: relative;
    > div[role=menu] {
      left: -48px!important;
    }
  }

  .todo-table ::v-deep {
    td {
      font-size: .8rem;
    }
    .assignee {
      width: 8rem;
    }
    .task {
      width: 12rem;
    }
    .date {
      width: 6rem;
    }
  }
}
</style>
