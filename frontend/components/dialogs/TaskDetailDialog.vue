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
      <v-btn @click="onClose">
        Close
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
    async onClose() {
      await this.save(this.task.id)
      this.show = false
    },
    async load (id) {
      console.log(`+ load(${id})`)
      const { data } = await this.$axios.get(`/tasks/${id}`)
      this.content = data.content
    },
    async save(id) {
      console.log(`+ save(${id})`)
      await this.$axios.post(`/tasks/${id}`, {
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
        this.load(this.task.id)
      }
    },
    async task(v, ov) {
      if(v?.id !== ov?.id) {
        if(ov) {
          await this.save(ov.id)
        }
        this.load(v.id)
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
