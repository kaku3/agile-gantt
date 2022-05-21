<template>
  <v-navigation-drawer
    v-model="show"
    width="50%"
    absolute
    right
    component-class="task-detail-dialog"
    :elevation="5"
  >
    <v-btn fab x-small dark class="close-button" @click="onClose">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-card-title v-html="taskName">
    </v-card-title>
    <v-card-text>
      <tiptap-vuetify v-model="content" :extensions="extensions"/>
      <template #placeholder>
        Loading...
      </template>
    </v-card-text>
  </v-navigation-drawer>
</template>
<script>
import dateformat from 'dateformat'
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
  },

  methods: {
    async onClose() {
      await this.save(this.task.id)
      this.show = false
    },
    async load (id) {
      console.log(`+ load(${id})`)
      const { data } = await this.$axios.get(`/tasks/${id}`)
      console.log(data.content)
      data.content += `<p><strong>${dateformat(new Date(), 'yyyy-mm-dd HH:MM')}</strong></p><p></p>`
      this.content = data.content

      // focus を当てて、最下行にカーソルを異動
      this.$nextTick(() => {
        const c = document.querySelector('[component-class=task-detail-dialog] .tiptap-vuetify-editor .tiptap-vuetify-editor__content')
        const e = document.querySelector('[component-class=task-detail-dialog] .tiptap-vuetify-editor .tiptap-vuetify-editor__content .ProseMirror')
        e.focus()

        const range = document.createRange()
        const selection = window.getSelection()

        range.setStart(e.childNodes[e.childNodes.length - 1], 0)
        range.collapse(true)

        selection.removeAllRanges()
        selection.addRange(range)

        c.scrollTop = c.scrollHeight
      })
    },
    async save(id) {
      console.log(`+ save(${id})`)
      await this.$axios.post(`/tasks/${id}`, {
        content: this.content
      })
      this.$emit('update', { id, content: this.content })
    }
  },

}
</script>
<style lang="scss" scoped>

[component-class=task-detail-dialog] {
  margin: 48px 0 0!important;
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

  ::v-deep {
    .project-name {
      margin-right: .5rem;
      font-size: .8rem;
      font-weight: bold;
    }
    .tiptap-vuetify-editor {
      .tiptap-vuetify-editor__content {
        height: calc(80vh - 48px);
        overflow: auto;

        .ProseMirror {
          margin: .5rem!important;
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
