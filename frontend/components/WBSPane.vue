<template>
  <div class="wbs-pane">
    <v-toolbar
      dense
    >
      <div class="toolbar-button" @click="save">
        <v-icon small>mdi-content-save</v-icon>
        <div class="tool-name">Save</div>
      </div>
      <div class="toolbar-button" @click.stop="openAddProjectDialog">
        <v-icon small>mdi-folder-plus-outline</v-icon>
        <div class="tool-name">Add<br/>Project</div>
      </div>
      <div class="toolbar-button" :class="{ disabled:!isSelectProjectTaskItem }" @click="addTaskItem">
        <v-icon small>mdi-plus</v-icon>
        <div class="tool-name">Add<br/>Task</div>
      </div>
      <div class="toolbar-button" :class="{ disabled:!isSelectTaskItem && !isSelectProjectTaskItem }" @click="duplicateSelectedTaskItem">
        <v-icon small>mdi-content-duplicate</v-icon>
        <div class="tool-name">Duplicate</div>
      </div>
      <div class="toolbar-button" :class="{ disabled:!isSelectTaskItems }" @click="deleteSelectedTaskItems">
        <v-icon small>mdi-delete</v-icon>
        <div class="tool-name">Delete</div>
      </div>
      <div class="connect-users">
        <div v-for="c in clients" :key="c.id" class="client elevation-3">
          {{ c.name }}
        </div>
      </div>
      <div class="toolbar management-begin-date ml-auto">
        <v-menu
          ref="managementBeginDateInput"
          v-model="managementBeginDateInput.menu"
          :close-on-content-click="false"
          :return-value.sync="config.managementBeginDate"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="config.managementBeginDate"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
              @change="onChangeManagementBeginDate"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="managementBeginDateInput.value"
            type="month"
            locale="ja-jp"
            no-title
          >
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              @click="onChangeManagementBeginDate(false)"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="onChangeManagementBeginDate(true)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
      </div>
      <div class="toolbar-button" @click="setHorizontallPane(100)">
        <v-icon small>mdi-chart-timeline</v-icon>
        <div class="tool-name">GANTT</div>
      </div>
      <div class="toolbar-button" @click="setHorizontallPane(60)">
        <v-icon small>mdi-arrow-split-horizontal</v-icon>
        <div class="tool-name">GANTT<br />RESOURCE</div>
      </div>
      <div class="toolbar-button" @click="setHorizontallPane(0)">
        <v-icon small>mdi-account-box-multiple</v-icon>
        <div class="tool-name">RESOURCE</div>
      </div>
      <div class="toolbar-button" @click="onClickToggleTodo()">
        <v-icon small>mdi-clipboard-check-outline</v-icon>
        <div class="tool-name">TODO</div>
      </div>
    </v-toolbar>
    <splitpanes horizontal class="default-theme" style="height: calc(100vh - 80px)" @resize="onResizeMainContainer">
      <pane role="ganttContainer">
        <splitpanes>
          <pane class="tasks-pane" size="40" min-size="20">
            <div class="tasks-header">
              <div class="task-header-task d-flex">
                <div>タスク</div>
                <div class="ml-auto" @click="onClickShowAllChildren">
                  <v-icon v-if="showChildren">mdi-eye</v-icon>
                  <v-icon v-else>mdi-eye-off</v-icon>
                </div>
              </div>
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
                @change="onChangeTaskItem"
              >
                <template slot-scope="{ item, isChild }">
                  <input type="checkbox" v-model="item.select" class="task-item-select">
                  <VueNestableHandle
                    :item="item"
                  >
                    <v-icon>mdi-drag-vertical</v-icon>
                  </VueNestableHandle>
                  <div class="task-item" :class="{ project: !isChild, 'has-children': item.children.length > 0, 'show-children': item.showChildren, 'show': item.show }">
                    <div class="task-info">
                      <input v-model="item.name" class="task-name"
                        @change="onChangeTaskName(item)"
                        @keypress.enter.prevent="focusNextTaskItem"
                      />
                      <span @click="onClickTaskDetailDialog(item)">
                        <v-icon
                          small
                          class="task-info-tool detail"
                        >
                          mdi-file-document-edit-outline
                        </v-icon>
                      </span>
                      <span @click="onClickToggleResource(item)">
                        <v-icon v-if="!isChild"
                          class="task-info-tool toggle-resource"
                        >
                          mdi-account-outline
                        </v-icon>
                      </span>
                      <span @click="onClickShowChildren(item)">
                        <v-icon v-if="!isChild"
                          class="task-info-tool toggle-show"
                        >
                          {{item | projectShowIcon}}
                        </v-icon>
                      </span>
                    </div>
                    <div @click="onClickTaskAssignee(item)">
                      {{ item.assignee | resourceName }}
                    </div>
                    <div>
                      {{ item.beginDate | mmdd }}
                    </div>
                    <div>
                      {{ item | endDate | mmdd }}
                    </div>
                    <div>
                      <input v-model="item.estimate" class="task-estimate"
                        @change="onChangeEstimate(item)"
                        @keypress.enter.prevent="focusNextTaskItem"
                        :disabled = "!isChild && item.children.length > 0"
                      />
                    </div>
                    <div>
                      {{ (item.planManHour) | workloadUnit }}
                    </div>
                    <div>
                      <input v-model="item.assignRate" class="task-assign-rate"
                        @change="onChangeAssignRate(item)"
                        @keypress.enter.prevent="focusNextTaskItem"
                      />
                    </div>
                    <div>
                      <input v-model="item.progress" class="task-progress"
                        @change="onChangeProgress(item)"
                        @keypress.enter.prevent="focusNextTaskItem"
                      />
                    </div>
                  </div>
                </template>
              </VueNestable>
            </div>
          </pane>
          <pane size="65" class="timelines-pane">
            <div class="timelines-header">
              <div v-for="i of 18" :key="i" :style="{ width: grid.dates[i-1] * gridX + 'px'}">
                {{ headerMonth(i) | mm }}
              </div>
            </div>
            <div class="timelines-container">
              <div class="today" :style="timelineToday"></div>
              <div v-for="task in timelineTasks" :key="task.id">
                <div class="timeline-container" :class="gridStartManagementDay">
                  <vue-draggable-resizable
                    class-name="timeline-item"
                    :x="task.timeline.x"
                    :y="0"
                    :w="task.timeline.w"
                    :h="lineHeight"
                    :parent="true"
                    :grid="[gridX,1]"
                    :handles="['ml','mr']"
                    :resizable="task.children.length === 0"
                    @resizestop="(x, y, width, height) => onResizeTimelineItem(x, y, width, height, task)"
                    @dragstop="(x, y) => onDragTimelineItem(x, y, task)"
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
          </pane>
        </splitpanes>
      </pane>
      <pane role="resourceContainer" class="resource-pane">
        <ResourceComponent ref="resourceComponent"
          v-model="resource.select"
          :headerMonth="headerMonth"
          :containerHeight="resource.containerHeight"
          @click-resource="onClickResource"
        />
      </pane>
    </splitpanes>
    <TaskDetailDialog v-model="taskDetail.showDialog" :task="taskDetail.task"></TaskDetailDialog>
    <TodoDialog v-model="todo.showDialog" @update="onUpdateTodos"></TodoDialog>
    <AddProjectDialog v-model="addProject.showDialog" @addProject="onAddProject"></AddProjectDialog>
    <v-snackbar
      v-model="popup.show"
    >
      {{ popup.text }}
    </v-snackbar>
  </div>
</template>
<script>
import Vue from 'vue'
import dateformat from 'dateformat'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { VueNestable, VueNestableHandle } from 'vue-nestable'

import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)

import ResourceComponent from '~/components/ResourceComponent.vue'
import AddProjectDialog from '~/components/dialogs/AddProjectDialog.vue'
import TaskDetailDialog from '~/components/dialogs/TaskDetailDialog.vue'
import TodoDialog from '~/components/dialogs/TodoDialog.vue'

import DateUtil from '~/utils/DateUtil'

import { GroupEntity } from '~/models/Group'
import { ResourceEntity } from '~/models/Resource'
import {
  TaskEntity,
  newTaskEntity,
  cloneTaskEntity,
  toTaskRecords,
  fromTaskRecords
} from '~/models/Task'

import { getModule } from 'vuex-module-decorators'
import HolidayStore from '~/store/HolidayStore'
import GroupStore from '~/store/GroupStore'
import ResourceStore from '~/store/ResourceStore'
import TaskRecordStore from '~/store/TaskRecordStore'
import TodoStore from '~/store/TodoStore'

import ConfigStore from '~/store/ConfigStore'

import io from 'socket.io-client'

export default Vue.extend({
  components: {
    Splitpanes,
    Pane,
    VueNestable,
    VueNestableHandle,
    ResourceComponent,
    AddProjectDialog,
    TaskDetailDialog,
    TodoDialog
  },
  data () {
    const managementBeginDate = new Date()
    managementBeginDate.setMonth(managementBeginDate.getMonth() - 2)
    managementBeginDate.setDate(1)
    managementBeginDate.setHours(0, 0, 0, 0)

    const _managementBeginDate = dateformat(managementBeginDate, 'yyyy-mm')

    const gridX = 5
    const timelineMaxTerm = 580

    return {
      socket: null,
      socketToken: '',
      clients: [],
      serialTaskId : 1,
      managementBeginDate,
      gridX,
      timelineMaxWidth: timelineMaxTerm * gridX,
      lineHeight: 24,
      tasks: [],
      resource: {
        containerHeight: '',
        select: []
      },
      showChildren: true,
      popup: {
        show: false,
        text: ''
      },
      addProject: {
        showDialog: false
      },
      taskDetail: {
        task: null,
        showDialog: false
      },
      todo: {
        showDialog: false
      },
      managementBeginDateInput : {
        menu: false,
        value: _managementBeginDate
      }
    }
  },
  async mounted () {
    window.addEventListener('resize', this.onResizeWindow)
    document.querySelector('.tasks-pane')?.addEventListener('scroll', this.onScrollTasksPane)
    document.querySelector('.timelines-pane')?.addEventListener('scroll', this.onScrollTimelinesPane)

    this.onResizeWindow()

    await this.loadConfig()

    this.load()

    this.initSocket()
  },
  destroyed () {
    window.removeEventListener('resize', this.onResizeWindow)
    document.querySelector('.timelines-pane')?.removeEventListener('scroll', this.onScrollTimelinesPane)
    document.querySelector('.tasks-pane')?.removeEventListener('scroll', this.onScrollTasksPane)
    this.disposeSocket()
  },
  methods: {
    initSocket() {
      this.socket = io(this.$config.apiServer)
      this.socket.on('onToken', (o) => {
        this.socketToken = o.token
        this.socket.emit('join', {
          name: this.$auth.user.name
        })
      })
      this.socket.on('onUpdateClients', (clients) => {
        this.clients = clients
      })
      this.socket.on('onUpdateTasks', (o) => {
        if(o.token !== this.socketToken) {
          this.loadFromTaskRecords(o.tasks, false)
        }
      })
      this.socket.on('onUpdateTodos', (o) => {
        if(o.token !== this.socketToken) {
          this.todoStore.setTodos(o.todos)
        }
      })
    },
    disposeSocket() {
      this.socket.disconnect()
    },

    emitTasks() {
      this.socket.emit('updateTasks', {
        token: this.socketToken,
        tasks: toTaskRecords(this.tasks)
      })
    },

    load() {
      const _holidays = this.$axios.get('/holidays')
      const _groups = this.$axios.get('/groups')
      const _resource = this.$axios.get('/resources')
      const _tasks = this.$axios.get('/tasks')

      Promise.all([ _holidays, _groups, _resource, _tasks ])
        .then((values) => {
          this.holidayStore.setHolidays(values[0].data)
          this.groupStore.setGroups(values[1].data)
          this.resourceStore.setResources(values[2].data)

          this.loadFromTaskRecords(values[3].data)
        })

      this.todoStore.loadTodos(this.$axios)
    },
    loadFromTaskRecords(taskRecords, emit) {
      this.serialTaskId = taskRecords.length > 0 ? taskRecords.map(t => t.id).reduce((a, v) => Math.max(a, v)) + 1 : 1
      this.tasks = fromTaskRecords(taskRecords, this.resourceStore.resources)

      // config 設定を反映
      const closeProjects = this.config.closeProjects
      if(closeProjects && closeProjects.length > 0) {
        this.tasks.forEach(t => {
          if(closeProjects.includes(t.id)) {
            t.showChildren = false
          }
        })
      }

      this.updateAllTasks(emit)

      this.locateAllTaskTimelines()
    },

    save() {
      const tasks = toTaskRecords(this.tasks)
      console.log(tasks)
      this.$axios.post('/tasks', tasks)
        .then(res => {
          this.showPopup('saved!')
        })
        .catch(err => console.error(err))
    },

    async loadConfig() {
      const res = await this.$axios.get(`/accounts/${this.$auth.user.id}/config`)
      this.config = res.data

      if(this.config.managementBeginDate) {
        this.managementBeginDateInput.value = this.config.managementBeginDate

        const [ yyyy, mm ] = this.managementBeginDateInput.value.split('-')
        this.managementBeginDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 1, 0,0,0,0)
      }
    },
    async saveConfig() {
      await this.$axios.post(`/accounts/${this.$auth.user.id}/config`, this.config)
        .then(res => {
          console.log(res)
        })
        .catch(err => console.error(err))
    },

    showPopup(text) {
      this.popup.show = true
      this.popup.text = text
    },

    async onChangeManagementBeginDate(update) {
      this.managementBeginDateInput.menu = false
      if(update) {
        this.config.managementBeginDate = this.managementBeginDateInput.value
        await this.saveConfig()

        // css のタイムラインを更新しないといけないので、リロードする。
        this.$router.go({path: this.$router.currentRoute.path, force: true})
      }
    },


    /**
     * beginDate + (1~12)
     */
    headerMonth(add) {
      const d = new Date(this.managementBeginDate)
      d.setMonth(d.getMonth() + add - 1)
      return d
    },
    isProject(task) {
      return this.tasks.find(t => t.id === task.id) != null
    },

    openAddProjectDialog() {
      this.addProject.showDialog = true
    },

    onAddProject(taskNames) {
      this.addProject.showDialog = true

      const assignee = this.resourceSelectedAssignee

      const project = this.newTaskItem()
      project.assignee = assignee
      for(const name of taskNames) {
        const t = this.newTaskItem(name)
        t.assignee = assignee
        project.children.push(t)
      }
      this.tasks = this.tasks.concat(project)
      this.updateAllTasks()
    },
    addTaskItem() {
      const tasks = this.tasks.filter(t => t.select)
      if(tasks.length !== 1) {
        return
      }
      tasks[0].children.push(this.newTaskItem())
      this.updateAllTasks()
    },
    newTaskItem(name = '') {
      const managementBeginDate = this.managementBeginDate
      const gridX = this.gridX

      const t = newTaskEntity(this.serialTaskId)
      t.name = name || `task - ${this.serialTaskId}`
      this.locateTaskTimeline(t, managementBeginDate, gridX)
      this.serialTaskId++
      return t
    },
    duplicateSelectedTaskItem() {
      if(!this.isSelectTaskItem && !this.isSelectProjectTaskItem) {
        return
      }

      if(this.isSelectProjectTaskItem) {
        const s = this.selectedProjectTaskItem
        const p = cloneTaskEntity(this.serialTaskId++, s)
        s.children.forEach(c => {
          const cc = cloneTaskEntity(this.serialTaskId++, c)
          p.children.push(cc)
        })
        this.tasks.splice(this.tasks.findIndex(t => t.id === s.id), 0, p)
      } else {
        const s = this.selectedTaskItem
        const task = cloneTaskEntity(this.serialTaskId++, s)
        s.parent.children.splice(s.parent.children.findIndex(c => c.id === s.id), 0, task)
      }

      this.updateAllTasks()
    },

    deleteSelectedTaskItems() {
      const tasks = this.tasks.filter(t => !t.select)
      if(tasks.length > 0) {
        tasks.forEach(t => {
          t.children = t.children.filter(tt => !tt.select)
        })
      }
      this.tasks = tasks

      this.updateAllTasks()
    },

    // 親子関係を鑑みてtask更新
    updateAllTasks(emit = true) {
      this.tasks.forEach(t => {
        t.show = true
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

          this.locateTaskTimeline(t, this.managementBeginDate, this.gridX)

          t.children.forEach(tt => {
            tt.parent = t
            tt.showChildren = false   // 子はいない
            tt.show = t.showChildren  // 親の子表示設定に従う
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
      this.taskRecordStore.setTaskRecords(toTaskRecords(this.tasks))

      this.refreshTaskItemsAndResourceComponent()

      if(emit) {
        this.emitTasks()
      }
    },
    calcManHour(t) {
      t.planManHour = DateUtil.networkDaysFromYYYYMMDD(t.beginDate, t.plan, this.holidays) * t.assignRate
    },
    refreshTaskItemsAndResourceComponent() {
      this.$nextTick(() => {
        document.querySelectorAll('.tasks-container .nestable-list .nestable-item .project')
          .forEach(p => {
            const c = p.parentElement?.nextElementSibling
            if(p.classList.contains('show-children')) {
              c?.classList.add('show')
            } else {
              c?.classList.remove('show')
            }
          })
        const resourceComponent = this.$refs['resourceComponent']
        if(resourceComponent) {
          resourceComponent.update()
        }
      })
    },

    //
    // tasks
    //
    focusNextTaskItem(event) {
      const elements = document.getElementsByClassName(event.target.className)
      const d = event.shiftKey ? elements.length - 1 : 1
      const index = [].findIndex.call(elements, e => e === event.target)
      const e = elements[(index + d) % elements.length]
      e.focus()
      e.select()
    },

    onClickTaskDetailDialog(task) {
      this.taskDetail = {
        task,
        showDialog: true
      }
    },

    onChangeTaskItem(value, options) {
      this.$nextTick(() => {
        this.updateAllTasks()
      })
    },

    onChangeTaskName(task) {
      this.emitTasks()
    },

    onClickTaskAssignee(task) {
      const rr = this.resource.select
      task.assignee = rr.length > 0 ? rr[0] : null

      this.updateAllTasks()
    },
    onChangeEstimate(task) {
      this.updateAllTasks()
    },
    onChangeAssignRate(task) {
      this.calcManHour(task)
      this.updateAllTasks()
    },
    onChangeProgress(task) {
      this.updateAllTasks()
    },

    onClickShowAllChildren() {
      this.showChildren = !this.showChildren
      this.tasks.forEach(t => {
        t.showChildren = this.showChildren
      })
      this.updateConfigCloseProjects()
      this.updateAllTasks()

      this.locateAllTaskTimelines()
    },

    onClickShowChildren(t) {
      t.showChildren = !t.showChildren

      this.updateConfigCloseProjects()
      this.updateAllTasks()

      this.locateAllTaskTimelines()
    },

    updateConfigCloseProjects() {
      this.config.closeProjects = this.tasks.filter(t => !t.showChildren).map(t => t.id)

      this.saveConfig()
    },

    onClickToggleResource(t) {
      this.$refs['resourceComponent'].toggleProjectFilter(t.name)
    },

    //
    // timelines
    //

    locateTaskTimeline(t, managementBeginDate, gridX) {
      t.timeline.x = DateUtil.dateCountFromBaseDate(managementBeginDate, t.beginDate) * gridX
      t.timeline.w = t.plan * gridX
    },
    locateAllTaskTimelines() {
      // timeline 表示位置を復元
      this.timelineTasks.forEach(t => {
        this.locateTaskTimeline(t, this.managementBeginDate, this.gridX)
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


    onDragTimelineItem(x, y, task) {
      const managementBeginDate = this.managementBeginDate
      const gridX = this.gridX

      const _beginDate = task.beginDate
      const d = Math.floor(x / gridX)
      task.beginDate = DateUtil.yyyymmddFromDate(DateUtil.dateFromDateCount(this.managementBeginDate, d))

      // 子がある場合は、子に変更を伝搬させる
      if(task.children.length > 0) {
        const dd = DateUtil.yyyymmddDiff(_beginDate, task.beginDate)
        console.log('old : ' + _beginDate)
        console.log('new : ' + task.beginDate)
        console.log('dd : ' + dd)

        task.children.forEach(tt => {
          tt.beginDate = DateUtil.yyyymmddFromDateCount(
            DateUtil.dateFromYYYYMMDD(tt.beginDate),
            dd
          )
          this.locateTaskTimeline(tt, managementBeginDate, gridX)
        })
      }
      this.updateAllTasks()
    },

    onResizeTimelineItem(x, y, width, height, task) {
      const d = Math.floor(x / this.gridX)
      task.beginDate = DateUtil.yyyymmddFromDate(DateUtil.dateFromDateCount(this.managementBeginDate, d))
      task.plan = width / this.gridX
      this.calcManHour(task)

      this.updateAllTasks()
    },

    onScrollTasksPane(e) {
      const s = document.querySelector('.tasks-pane')
      const d = document.querySelector('.timelines-pane')
      if(d && s && d.scrollTop !== s.scrollTop) {
        d.scrollTop = s.scrollTop
      }
    },
    onScrollTimelinesPane(e) {
      const s = document.querySelector('.timelines-pane')
      const d = document.querySelector('.tasks-pane')
      if(d && s && d.scrollTop !== s.scrollTop) {
        d.scrollTop = s.scrollTop
      }
    },

    //
    // resource
    //
    onClickResource(resourceId) {
      this.tasks.forEach(task => {
        task.showChildren = task.children.some(t => t.assignee?.id == resourceId)
      })
      this.updateAllTasks()
      this.locateAllTaskTimelines()
    },

    //
    //
    //
    onClickToggleTodo() {
      this.todo.showDialog = !this.todo.showDialog
    },
    onUpdateTodos(todos) {
      console.log(todos)
      this.socket.emit('updateTodos', {
        token: this.socketToken,
        todos
      })
    },

    //
    // window resize.
    //
    setHorizontallPane(rate) {
      const g = document.querySelector('[role="ganttContainer"]')
      const r = document.querySelector('[role="resourceContainer"]')

      g.style.height = rate + '%'
      r.style.height = (100 - rate) + '%'

      window.setTimeout(() => {
        this.updateResouceContainerHeight()
      }, 1000)
    },

    updateResouceContainerHeight() {
      const e = document.querySelector('[role="resourceContainer"]')
      if(e) {
        return this.resource.containerHeight = (e.offsetHeight - 48) + "px"
      }
    },

    onResizeWindow() {
      this.updateResouceContainerHeight()
    },

    onResizeMainContainer(e) {
      this.updateResouceContainerHeight()
    },
  },
  computed: {
    holidayStore() {
      return getModule(HolidayStore, this.$store)
    },
    groupStore() {
      return getModule(GroupStore, this.$store)
    },
    resourceStore() {
      return getModule(ResourceStore, this.$store)
    },
    taskRecordStore() {
      return getModule(TaskRecordStore, this.$store)
    },
    todoStore() {
      return getModule(TodoStore, this.$store)
    },
    configStore() {
      return getModule(ConfigStore, this.$store)
    },

    config: {
      get() {
        const _managementBeginDate = dateformat(this.managementBeginDate, 'yyyy-mm')
        return this.configStore?.config || {
          closeProjects: [],
          managementBeginDate: _managementBeginDate
        }
      },
      set(v) {
        this.configStore.setConfig(v)
      }
    },

    holidays() {
      return this.holidayStore?.holidayDates || []
    },

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
    timelineToday() {
      const x = DateUtil.dateCountFromBaseDate(
        this.managementBeginDate,
        DateUtil.yyyymmddFromDate(new Date())) * this.gridX + (this.gridX / 2)
      return {
        transform: `translateX(${x}px)`
      }
    },

    gridStartManagementDay() {
      return `d${(14 - this.grid.startManagementDay) % 7}`
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

    resourceSelectedAssignee() {
      const rr = this.resource.select
      return rr.length > 0 ? rr[0] : null
    },


    /**
     * root task を単一選択
     */
    isSelectProjectTaskItem() {
      return this.tasks
        .filter(t => t.select).length === 1
    },
    selectedProjectTaskItem() {
      if(!this.isSelectProjectTaskItem) {
        return null
      }
      return this.tasks
        .filter(t => t.select)[0]
    },

    /**
     * root, task 問わず一つ以上選択
     */
    isSelectTaskItems() {
      return this.timelineTasks
        .filter(t => t.select).length > 0
    },

    /**
     * task を一つ選択
     */
    isSelectTaskItem() {
      return this.tasks
        .flatMap(t => t.children)
        .filter(t => t.select).length === 1
    },
    selectedTaskItem() {
      if(!this.isSelectTaskItem) {
        return null
      }
      return this.tasks
        .flatMap(t => t.children)
        .filter(t => t.select)[0]
    },
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
<style lang="scss" scoped src="~/components/scss/wbs-pane.scss">

