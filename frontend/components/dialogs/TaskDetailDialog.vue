<template>
  <v-navigation-drawer
    v-model="show"
    width="50%"
    absolute
    right
    component-class="task-detail-dialog"
  >
    <v-card-title v-html="taskName">
    </v-card-title>
    <v-card-text>
      <tiptap-vuetify v-model="content" :extensions="extensions"/>
      <template #placeholder>
        Loading...
      </template>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="onClose">
        Close
      </v-btn>
      <v-btn @click="onSave" color="primary">
        Save
      </v-btn>
    </v-card-actions>
  </v-navigation-drawer>
</template>
<script>
import {
  TiptapVuetify,
  Heading,
  Bold,
  Italic,
  Strike,
  Underline,
  Code,
  Paragraph,
  BulletList,
  OrderedList,
  ListItem,
  Link,
  Blockquote,
  HardBreak,
  HorizontalRule,
  History
} from 'tiptap-vuetify'

import { getModule } from 'vuex-module-decorators'
import TaskRecordStore from '~/store/TaskRecordStore'

export default {
  components: { TiptapVuetify },
  props: {
    value: Boolean,
    task: Object
  },
  data: () => ({
    // declare extensions you want to use
    extensions: [
      History,
      Blockquote,
      Link,
      Underline,
      Strike,
      Italic,
      ListItem,
      BulletList,
      OrderedList,
      [
        Heading,
        {
          options: {
            levels: [1, 2, 3]
          }
        }
      ],
      Bold,
      Link,
      Code,
      HorizontalRule,
      Paragraph,
      HardBreak
    ],
    // starting editor's content
    content: ''
  }),
  methods: {
    onClose() {
      this.show = false
    },
    async onSave() {
      await this.save()
      this.show = false
    },
    async load () {
      console.log(this.task)

      const { data } = await this.$axios.get(`/tasks/${this.task.id}`)
      this.content = data.content
    },
    async save() {
      await this.$axios.post(`/tasks/${this.task.id}`, {
        content: this.content
      })
    }
  },
  computed: {
    taskRecordStore() {
      return getModule(TaskRecordStore, this.$store)
    },
    tasks() {
      return this.taskRecordStore?.taskRecords || []
    },

    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    taskName() {
      // mounted 時
      if(!this.task) {
        return ''
      }

      let n = `<span class="task-name">${this.task.name}</span>`
      if(this.task.parent) {
        n = `<span class="project-name">${this.task.parent.name}</span>` + n
      }
      return n
    }
  },
  watch: {
    show(v, ov) {
      if(v) {
        this.load()
      }
    },
    task(v, ov) {
      if(v?.id !== ov?.id) {
        this.load()
      }
    }
  }
}
</script>
<style lang="scss" scoped>

[component-class=task-detail-dialog] {
  margin: 0;
  z-index: 100;

  ::v-deep {
    .project-name {
      margin-right: .5rem;
      font-size: .8rem;
      font-weight: bold;
    }
    .tiptap-vuetify-editor {
      .tiptap-vuetify-editor__content {
        height: 75vh;
        overflow: auto;

        .ProseMirror {
          margin: .5rem!important;
          min-height: calc(75vh - 2rem);
          p {
            margin-top: 0!important;
            margin-bottom: 0!important;
          }
        }
      }
    }
  }
}

</style>
