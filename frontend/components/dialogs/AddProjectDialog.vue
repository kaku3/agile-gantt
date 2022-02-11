<template>
  <v-dialog
    v-model="show"
    persistent
    width="800px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">プロジェクト種類を選択してください</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col v-html="projects[selectedType].description">
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-radio-group v-model="selectedType">
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
              <ul v-if="isTypePreset">
                <li
                  v-for="(task, i) in tasks[selectedType]"
                  :key="i"
                >
                  {{task}}
                </li>
              </ul>
              <div v-else-if="isTypeText">
                <v-textarea
                  v-model="text"
                  label="プロジェクト&タスク"
                  rows="1"
                  auto-grow
                  dense
                >
                </v-textarea>
                <v-file-input
                  dense
                  show-size
                  accept="text/csv"
                  label="csvファイル"
                  v-model="csvFile"
                  @change="onChangeCsvFile"
                >
                </v-file-input>
              </div>
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
    const text =
`プロジェクト1
タスク1,担当者,7,2022-01-02
タスク2
タスク3,担当者,10,2022-02-02`
    return {
      csvFile: null,
      text,
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
        text: {
          label: 'テキスト',
          description: 'カンマ、改行区切りテキストよりプロジェクトを作成します。<br />{プロジェクト}<br />{タスク},{見積(省略可)},{担当者(省略可)},{開始日(省略可)}'
        }
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
      selectedType: 'simple'
    }
  },
  methods: {
    onAdd() {
      if(this.isTypePreset) {
        this.$emit('addProject', this.tasks[this.selectedType], true)
        this.show = false
      } else if(this.isTypeText) {
        const records = this.text.split('\n')
        if(records.length < 2) {
          return
        }
        this.$emit('addProject', records, false)
        this.show = false
      }
    },
    onCancel() {
      this.show = false
    },
    async onChangeCsvFile(file){
      this.text = await this.readAsText(file)
    },
    readAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file)
      })
    },
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
    isTypePreset() {
      return ![ 'text' ].includes(this.selectedType)
    },
    isTypeText() {
      return this.selectedType === 'text'
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
