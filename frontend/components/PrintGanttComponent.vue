<template>
  <div class="print-page d-flex">
    <div class="tasks-pane">
      <div class="tasks-header">
        <div class="task-header-task">タスク</div>
        <div>担当</div>
        <div>開始</div>
        <div>終了</div>
        <div>見積</div>
        <div>計画</div>
        <div>稼働率</div>
        <div>進捗</div>
      </div>
      <div class="tasks-container">
        <VueNestable
          v-model="tasks"
          :max-depth="2"
          :threshold="14"
          :collapsed="true"
        >
          <template slot-scope="{ item, isChild }">
            <div class="task-item" :class="{ project: !isChild, 'has-children': item.children.length > 0, 'show-children': item.showChildren, 'show': item.show }">
              <div class="task-info">
                {{ item.name }}
              </div>
              <div>
                {{ item.assignee | resourceName }}
              </div>
              <div>
                {{ item.beginDate | mmdd }}
              </div>
              <div>
                {{ item | endDate | mmdd }}
              </div>
              <div class="task-estimate">
                {{ item.estimate }}
              </div>
              <div>
                {{ (item.planManHour) | workloadUnit }}
              </div>
              <div class="task-assign-rate">
                {{ item.assignRate }}
              </div>
              <div class="task-progress">
                {{ item.progress }}
              </div>
            </div>
          </template>
        </VueNestable>
      </div>
    </div>
    <div class="timelines-pane">
      <div class="timelines-header" :class="`z${zoom}`">
        <div v-for="i of 18" :key="i" :style="{ 'min-width': grid.dates[i-1] * gridXX + 'px'}">
          {{ headerMonth(i) | mm }}
        </div>
      </div>
      <div class="timelines-container" :class="`z${zoom}`">
        <div class="today" :style="timelineToday"></div>
        <div v-for="task in timelineTasks" :key="task.id">
          <div class="timeline-container" :class="timelineContainerGridClass">
            <vue-draggable-resizable
              class-name="timeline-item"
              :x="task.timeline.x"
              :y="0"
              :w="task.timeline.w"
              :h="lineHeight"
              :parent="true"
              :grid="[gridXX, 1]"
              :handles="['ml','mr']"
              :resizable="false"
              :draggable="false"
            >
              <div class="task-item" :class="taskClass(task)"></div>
              <v-progress-linear :value="task.progress"></v-progress-linear>
              <div class="task-info" :class="{ project: isProject(task) }">
                <div class="task-info-task-name">{{ task | timelineTaskName }}</div>
                <div class="task-info-task-assignee">{{ task | timelineTaskAssgnees }}</div>
              </div>
            </vue-draggable-resizable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import dateformat from 'dateformat'
import { VueNestable, VueNestableHandle } from 'vue-nestable'

import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)

import DateUtil from '~/utils/DateUtil'

import {
  TaskEntity,
  newTaskEntity,
  cloneTaskEntity,
  toTaskRecords,
  fromTaskRecords
} from '~/models/Task'

export default Vue.extend({
  components: {
    VueNestable,
    VueNestableHandle,
  },
  props: {
    targetTaskIds: Array
  },
  data () {
    const zoom = 2
    const gridX = 5
    const timelineMaxTerm = 580

    return {
      config: null,
      tasks: [],
      holidays: [],
      groups: [],
      resources: [],
      gridX,
      lineHeight: 24,
      timelineMaxTerm
    }
  },
  async mounted() {
    const res = await this.$axios.get(`/accounts/${this.$auth.user.id}/config`)
    this.config = res.data
    const [ yyyy, mm ] = this.config.managementBeginDate.split('-')
    this.config.managementBeginDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 1, 0,0,0,0)

    console.log(this.config.zoom)

    this.load()
  },
  methods: {
    load() {
      const _holidays = this.$axios.get('/holidays')
      const _groups = this.$axios.get('/groups')
      const _resource = this.$axios.get('/resources')
      const _tasks = this.$axios.get('/tasks')

      Promise.all([ _holidays, _groups, _resource, _tasks ])
        .then((values) => {
          this.holidays = values[0].data.map(h => h.date)
          this.groups = values[1].data
          this.resources = values[2].data

          this.loadFromTaskRecords(values[3].data)
        })

    },
    loadFromTaskRecords(taskRecords) {
      this.serialTaskId = taskRecords.length > 0 ? taskRecords.map(t => t.id).reduce((a, v) => Math.max(a, v)) + 1 : 1
      this.tasks = fromTaskRecords(taskRecords, this.resources)

      if(this.targetTaskIds.length > 0) {
        this.tasks = this.tasks.filter(t => this.targetTaskIds.includes(t.id))
      }

      this.updateAllTasks()
      this.locateAllTaskTimelines()
    },

    // 親子関係を鑑みてtask更新
    updateAllTasks() {
      this.tasks.forEach(t => {
        t.parent = null
        this.calcManHour(t)
        if(t.children.length > 0) {

          const b = DateUtil.dateFromYYYYMMDD(
            t.children.map(t => t.beginDate).reduce((a, v) => Math.min(a, v))
          )
          const e = new Date(
            t.children
              .map(t => DateUtil.dateFromDateCount(DateUtil.dateFromYYYYMMDD(t.beginDate), t.plan).getTime() - 1)
              .reduce((a, v) => Math.max(a, v))
          )
          t.beginDate = DateUtil.yyyymmddFromDate(b)
          t.plan = DateUtil.dateDiff(b, e)

          t.children.forEach(tt => {
            tt.parent = t
          })

          // 親工数：子タスクがある時は、子タスクの工数合計
          // 見積工数
          t.estimate = t.children
            .map(tt => Number(tt.estimate))
            .reduce((a, v) => a + v)
          console.log(t.estimate)
          // 予定工数
          t.planManHour = t.children
            .map(tt => Number(tt.planManHour))
            .reduce((a, v) => a + v)
        } else {
          t.showChildren = false
        }
      })
    },
    calcManHour(t) {
      t.planManHour = DateUtil.networkDaysFromYYYYMMDD(t.beginDate, t.plan, this.holidays) * t.assignRate
    },
    locateTaskTimeline(t, managementBeginDate) {
      t.timeline.x = DateUtil.dateCountFromBaseDate(managementBeginDate, t.beginDate) * this.gridXX
      t.timeline.w = t.plan * this.gridXX
    },
    locateAllTaskTimelines() {
      // timeline 表示位置を復元
      this.timelineTasks.forEach(t => {
        this.locateTaskTimeline(t, this.managementBeginDate)
      })
    },

    taskClass(task) {
      let o = {}
      if(this.isProject(task)) {
        o.project = true
      } else {
        const v = task.assignRate || 0
        const assignRate = Math.min(10, Math.floor(v * 10))
        o[`assign-rate-${assignRate}`] = true
      }

      if(task.progress != -1) {
        if(task.progress == 100) {
          o.complete = true
        } else {
          const d = DateUtil.dateFromYYYYMMDD(task.beginDate)
          d.setDate(d.getDate() + Math.ceil(task.plan * task.progress / 100))
          if(DateUtil.dateDiff(d, new Date()) < 0) {
            o.advance = true
          } else {
            o.delay = true
          }
        }
      }
      return o
    },

    headerMonth(add) {
      const d = new Date(this.managementBeginDate)
      d.setMonth(d.getMonth() + add - 1)
      return d
    },
    isProject(task) {
      return this.tasks.find(t => t.id === task.id) != null
    },
  },
  computed: {

    grid() {
      const dates = []
      for(let i = 1; i <= 18; i++) {
        const d = new Date(this.managementBeginDate)
        d.setMonth(d.getMonth() + i)
        d.setDate(0)
        dates.push(d.getDate())
      }
      let startManagementDay = this.managementBeginDate.getDay()
      console.log(startManagementDay)
      return {
        dates,
        startManagementDay
      }
    },
    gridXX() {
      return this.gridX * this.zoom
    },
    zoom() {
      return this.config?.zoom || 1
    },
    timelineMaxWidth() {
      return this.gridXX * this.timelineMaxTerm
    },

    timelineToday() {
      const x = DateUtil.dateCountFromBaseDate(
        this.managementBeginDate,
        DateUtil.yyyymmddFromDate(new Date())) * this.gridXX + (this.gridXX / 2)
      return {
        transform: `translateX(${x}px)`
      }
    },

    timelineContainerGridClass() {
      return `d${(14 - this.grid.startManagementDay) % 7} z${this.zoom}`
    },

    timelineTasks() {
      if(this.tasks) {
        const objs = []
        this.tasks.forEach(t => {
          objs.push(t)
          const children = t.children.filter(c => c.show)
          if(children.length > 0) {
            Array.prototype.push.apply(objs, children)
          }
        })
        return objs
      }
      return []
    },

    managementBeginDate() {
      return this.config?.managementBeginDate || new Date()
    }
  },
  filters: {
    endDate(t) {
      return DateUtil.yyyymmddFormDateCount(t.beginDate, t.plan - 1)
    },

    mmdd(d) {
      const { mm, dd } = DateUtil.yyyymmddObject(d)
      return `${mm.toString().padStart(2, '0')}/${dd.toString().padStart(2, '0')}`
    },
    mm(d) {
      return dateformat(d, 'mm')
    },
    workloadUnit(v) {
      return DateUtil.workloadUnit(v)
    },
    resourceName(r) {
      return r?.name || ''
    },
    timelineTaskName(t) {
      return t.name
    },
    timelineTaskAssgnees(t) {
      return Array.from(new Set([ t.assignee, ...t.children.map(tt => tt.assignee) ]))
              .filter(r => r?.name)
              .map(r => r?.name).join(',')
    },
    projectShowIcon(t) {
      return t.showChildren ? 'mdi-eye' : 'mdi-eye-off'
    }
  }
})
</script>
<style lang="scss" scoped>
@import './scss/wbs-common';

.tasks-pane {
  width: max-content;
  .tasks-header {
    display: flex;
    min-width: 640px;
    z-index: 1;
    > * {
      padding: .25rem;
      font-size: .7rem;
      overflow: hidden;
      background-color: $color-header;
      border-bottom: 1px solid #888;
      border-right: 1px solid #888;

      &:nth-child(1) {
        flex: 1;
        padding: .25rem;
      }
      &:nth-child(2) {
        width: 4rem;
      }
      &:nth-child(3) {
        width: 3rem;
      }
      &:nth-child(4) {
        width: 3rem;
      }
      &:nth-child(5) {
        width: 3rem;
      }
      &:nth-child(6) {
        width: 3rem;
      }
      &:nth-child(7) {
        width: 3rem;
      }
      &:nth-child(8) {
        width: 3rem;
      }
    }
  }
  .tasks-container {
    font-size: .8rem;

    ::v-deep ol {
      list-style-type: none;
      padding-left: 0;

      &:not(.nestable-group) {
        padding-left: $task-indent-size;
      }
      .nestable-item-content {
        position: relative;
        height: $task-height;
      }
    }

    .task-item {
      position: absolute;
      top: 0;
      left: 0px;
      display: flex;
      width: 100%;
      background: white;

      &.project {
        background: #B2DFDB;

        &:not(.show-children) + ol {
          display: none;
        }
      }

      > * {
        padding: .125rem .25rem;
        text-align: center;
        border-right: 1px solid #ddd;
        border-bottom: 1px solid #eee;

        &.task-info {
          display: flex;
          padding: 0;
          flex: 1;
          height: $line-height;
          overflow: hidden;
        }
        &:nth-child(1) {
          padding-top: .125rem;
          padding-left: .25rem;
        }
        &:nth-child(2) {
          width: 4rem;
        }
        &:nth-child(3) {
          width: 3rem;
        }
        &:nth-child(4) {
          width: 3rem;
        }
        &:nth-child(5) {
          width: 3rem;
        }
        &:nth-child(6) {
          width: 3rem;
        }
        &:nth-child(7) {
          width: 3rem;
        }
        &:nth-child(8) {
          width: 3rem;
        }
      }
    }
  }
}
.timelines-pane {
  overflow: auto;
  .timelines-header {
    display: flex;
    background: $color-header;
    z-index: 5;

    @for $zoom from 1 through 5 {
      &.z#{$zoom} {
        width: #{ $time-line-max-term * $time-grid-x * $zoom };
      }
    }

    div {
      padding: .25rem;
      font-size: .7rem;
      border-right: 1px solid #888;
      border-bottom: 1px solid #888;
    }
  }

  .timelines-container {
    position: relative;

    @for $zoom from 1 through 5 {
      &.z#{$zoom} {
        width: #{ $time-line-max-term * $time-grid-x * $zoom };
      }
    }

    .today {
      position: absolute;
      width: 1px;
      height: 100%;
      background-color: #263238;
      opacity: .7;
      z-index: 1;
    }

    .timeline-container {
      position: relative;
      display: block;
      height: $line-height;
      border-bottom: 1px solid white;

      background-repeat: repeat-x;

      @for $zoom from 1 through 5 {
        &.z#{$zoom} {
          background-size: #{$time-grid-x * $zoom * 7} $line-height;
        }

        @for $d from 1 through 7 {
          &.d#{$d - 1}.z#{$zoom} {
            @include background-date-grid($d, $zoom);
          }
        }
      }

      ::v-deep .timeline-item {
        padding-top: 2px;

        .handle {
          border-color: #666;
          border-radius: 50%;
        }
        .task-item {
          padding: .1rem .25rem;
          width: 100%;
          height: $plan-height;
          font-size: .7rem;
          color: white;
          background: #42A5F5;
          border-radius: 4px;

          &.project {
            margin-top: 4px;
            padding: 0 .25rem;
            font-size: .6rem;
            color: white;
            background: rgba(#80CBC4, .8);
            border-bottom: 1px solid #004D40;
            height: $project-height;
            border-radius: 1px;

            &.complete {
              background: rgba(#004D40, .8);
            }
            &.advance {
              background: rgba(#4CAF50, .8);
            }
            &.delay {
              background: rgba(#FF5722, .8);
            }
          }

          @for $c from 0 through 10 {
            &.assign-rate-#{$c} {
              background-color: rgba(#42A5F5, ($c / 10 + 0.3));
            }
          }
        }
        .task-info {
          display: flex;
          position: absolute;
          top: 1px;
          left: calc(100% + 32px);
          padding: 2px .2rem;
          white-space: nowrap;
          font-size: .7rem;
          background: rgba(#E0F2F1, .9);
          border-radius: 4px;

          &.project {
            background: rgba(#B2DFDB, .9);
          }

          > * + * {
            padding-left: .5rem;
          }
          > .task-info-task-name {
            padding-top: 2px;
            font-size: .6rem;
            font-weight: bold;
          }
          > .task-info-task-assignee {
            padding-top: 1px;
          }
        }
      }
    }
  }
}
::v-deep {
  .nestable {
    position: relative;
  }
  .nestable .nestable-list {
    margin: 0;
    padding: 0 0 0 $task-indent-size;
    list-style-type: none;
  }
  .nestable > .nestable-list {
    padding: 0;
  }
  .nestable-item,
  .nestable-item-copy {
    margin: $task-margin-top 0 0;
  }
  .nestable-item:first-child,
  .nestable-item-copy:first-child {
    margin-top: 0;
  }
  .nestable-item .nestable-list,
  .nestable-item-copy .nestable-list {
    margin-top: $task-margin-top;
  }
  .nestable-item {
    position: relative;
  }
  .nestable-item.is-dragging .nestable-list {
    pointer-events: none;
  }
  .nestable-item.is-dragging * {
    opacity: 0;
    filter: alpha(opacity=0);
  }
  .nestable-item.is-dragging:before {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(106, 127, 233, 0.274);
    border: 1px dashed rgb(73, 100, 241);
    -webkit-border-radius: 5px;
    border-radius: 5px;
  }
  .nestable-drag-layer {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    pointer-events: none;
  }
  .nestable-drag-layer > .nestable-list {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0;
    background-color: rgba(106, 127, 233, 0.274);
  }
  .nestable [draggable="true"] {
    cursor: move;
  }
  .nestable-handle {
    display: inline;
  }
}

</style>
