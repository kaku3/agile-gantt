<template>
  <v-dialog
    v-model="show"
    persistent
    width="640px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">プロジェクト種類を選択してください</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              {{ projects[selectedProject].description }}
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-radio-group v-model="selectedProject">
                <v-radio
                  v-for="(item, key) in projects"
                  :key="key"
                  :label="item.label"
                  :value="key"
                >
                </v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="8">
              <ul>
                <li
                  v-for="(task, i) in tasks[selectedProject]"
                  :key="i"
                >
                  {{task}}
                </li>
              </ul>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          text
          @click="onCancel"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="onAdd"
        >
          追加
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    value: Boolean
  },
  data () {
    return {
      projects: {
        simple: {
          label: 'シンプル',
          description: '単一タスクを持つプロジェクトです。'
        },
        developS: {
          label: '開発(小)',
          description: '小規模なウォーターフォール開発タスクを持つプロジェクトです。'
        },
        developL: {
          label: '開発(大)',
          description: '大規模なウォーターフォール開発タスクを持つプロジェクトです。'
        },
        maintenance: {
          label: '保守',
          description: '保守用プロジェクトです。'
        },
      },
      tasks: {
        simple: [
          '営業'
        ],
        developS: [
          '管理',
          '要件定義',
          '設計',
          '開発',
          '試験項目作成',
          '試験実施',
        ],
        developL: [
          '管理',
          '要件定義',
          '設計',
          '開発',
          '開発',
          '試験項目作成',
          '試験実施',
          '試験実施',
          'デザイン',
          'テーマ',
          '制作',
          'インフラ',
        ],
        maintenance: [
          '管理',
          '保守',
        ]
      },
      selectedProject: 'simple'
    }
  },
  methods: {
    onAdd() {
      this.$emit('addProject', this.tasks[this.selectedProject])
      this.show = false
    },
    onCancel() {
      this.show = false
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
    }
  }
}
</script>
<style lang="scss" scoped>
.v-dialog {
  ul {
    list-style: none;
    li {
      padding: .25rem .5rem;
      border-bottom: 1px solid lightgray;
    }
  }
}
</style>
