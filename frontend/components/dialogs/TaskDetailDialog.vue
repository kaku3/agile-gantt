<template>
  <v-dialog
    v-model="show"
    persistent
    fullscreen
  >
    <v-card>
      <v-card-title>
        {{taskName}}
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
    </v-card>
  </v-dialog>
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
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    taskName() {
      return this.task?.name || ''
    }
  },
  watch: {
    show(v, ov) {
      if(v) {
        this.load()
      }
    }
  }
}
</script>
<style lang="scss">
.tiptap-vuetify-editor {
  .tiptap-vuetify-editor__content {
    p {
      margin-top: 0!important;
      margin-bottom: 0!important;
    }
  }
}
</style>
