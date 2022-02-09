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
      <v-form>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="form.subject"
              label="Todo"
              required
            >
            </v-text-field>
          </v-col>
          <v-col>
            <v-textarea
              :value="form.body"
              label="詳細"
              rows="1"
              auto-grow
            >
            </v-textarea>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <v-autocomplete
              :items="resources"
              :filter="resourceFilter"
              item-text="name"
              label="担当"
              class="assignee-input"
            >
            </v-autocomplete>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-text-field
              v-model="form.createDate"
              label="登録日"
              prepend-icon="mdi-calendar"
              disabled
              class="date-input ml-auto"
            ></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-menu
              ref="dueDate"
              v-model="menu.dueDate"
              :close-on-content-click="true"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="form.dueDate"
                  label="期日"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  @change="onChangeDueDate"
                  class="date-input"
                ></v-text-field>
              </template>
              <v-date-picker v-model="form.dueDate"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="auto">
            <v-btn class="mt-2">登録</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

  </v-navigation-drawer>
</template>
<script>
import { getModule } from 'vuex-module-decorators'
import ResourceStore from '~/store/ResourceStore'


export default {
  props: {
    value: Boolean,
    task: Object
  },
  data () {
    const createDate = new Date(Date.now()).toISOString().substr(0, 10)
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString().substr(0, 10)
    return {
      form: {
        subject: '',
        body: '',
        createDate,
        dueDate
      },
      menu: {
        dueDate: false,
      }
    }
  },
  methods: {
    async onClose() {
      // await this.save(this.task.id)
      this.show = false
    },
    resourceFilter(item, queryText, itemText) {
      const name = item.name.toLowerCase()
      const email = item.email.toLowerCase()
      const search = queryText.toLowerCase()

      return name.indexOf(search) > -1 || email.indexOf(search) > -1
    },
    onChangeDueDate() {

    }
  },
  computed: {
    resourceStore() {
      return getModule(ResourceStore, this.$store)
    },
    resources() {
      return this.resourceStore.resources || []
    },
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
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

  .close-button {
    position: absolute;
    top: 8px;
    left: -20px;
  }

  .date-input {
    max-width: 8rem;
  }
}
</style>
