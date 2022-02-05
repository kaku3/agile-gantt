<template>
  <div class="resource-component">
    <v-row>
      <v-col cols="4">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          dense
        >
        </v-text-field>
      </v-col>
      <v-col class="col-auto ml-auto">
        <v-autocomplete
          v-model="selectedProjects"
          :items="projectItems"
          dense
          chips
          small-chips
          label="Projects"
          multiple
          clearable
          flat
        >
        </v-autocomplete>
      </v-col>
    </v-row>
    <v-data-table
      v-model="select"
      :search="search"
      :headers="resourceHeaders"
      :items="resourceItems"
      :height="containerHeight"
      :fixed-header="true"
      :disable-pagination="true"
      :hide-default-footer="true"
      :single-select="true"
      item-key="id"
      show-select
      dense
      class="resource-table"
    >
      <template v-slot:item.name="{ item }">
        <div class="resource-name" @click="onClickName(item)">{{ item.name }}</div>
      </template>
      <template v-slot:item.totalManHour="{ item }">
        {{ item.totalManHour | workloadUnit }}
      </template>
      <template v-for="i in 18" v-slot:[`item.manHours[${i-1}]`]="{ item }">
        <v-tooltip top :key="i">
          <template v-slot:activator="{ on, attrs }">
            <div :key="i"
              v-bind="attrs"
              v-on="on"
              class="man-hour"
              :class="manHourClass(item, i-1)"
            >
              {{ item.manHours[i-1].manHour | workloadUnit }}
            </div>
          </template>
          <div v-for="(task, ii) in item.manHours[i-1].tasks" :key="ii">
            {{ taskName(task) }} : {{ Math.ceil(task.manHour) }}
          </div>
        </v-tooltip>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import dateformat from 'dateformat';

import DateUtil from '~/utils/DateUtil'

import { getModule } from 'vuex-module-decorators'
import HolidayStore from '~/store/HolidayStore'
import GroupStore from '~/store/GroupStore'
import ResourceStore from '~/store/ResourceStore'
import TaskRecordStore from '~/store/TaskRecordStore'

export default {
  props: {
    value: Array,
    headerMonth: Function,
    containerHeight: String
  },
  data () {
    return {
      resourceItems: [],
      search: '',
      selectedProjects: []
    }
  },
  methods: {

    update() {
      this.updateResourceItems()
    },
    updateResourceItems() {
      const groups = this.groupStore?.groups
      const resources = this.resourceStore?.resources
      if(!groups || !resources) {
        return []
      }
      const tasks = this.tasks

      const items = resources.map(r => {

        const g = groups.find(gg => gg.id === r.groupId) || { group: 'X', name: '未所属'}

        const manHours = this.createTemplateManHors()
        const assignedTasks = tasks.filter(t => t.assigneeId === r.id)

        console.group(r.name)
        console.log(assignedTasks)

        // 各タスクの月別稼働を取得
        let tasksPerMonths = assignedTasks.flatMap(t => {
          return DateUtil.monthlyNetworkDaysFromYYYYMMDD(t.beginDate, t.plan, t.assignRate, this.holidays)
            .map(o => {
              return {
                ...o,
                id: t.id,
                parentId: t.parentId
              }
            })
        })
        console.log(tasksPerMonths)
        console.groupEnd()

        // 表示領域に貼り付ける
        manHours.forEach(o => {
          const _tasks = tasksPerMonths.filter(h => h.yyyy === o.yyyy && h.mm === o.mm)
          if(_tasks.length > 0) {
            o.manHour = _tasks.map(h => h.manHour).reduce((a, v) => a + v)
            o.tasks = _tasks
          }
        })

        return {
          id: r.id,
          group: `${g.group} : ${g.name}`,
          name: r.name,
          email: r.email,
          manHours,
          totalManHour: manHours.map(o => o.manHour).reduce((a, v) => a + v)
        }
      })
      this.resourceItems = items
    },
    toggleProjectFilter(name) {
      if(this.selectedProjects.includes(name)) {
        this.selectedProjects.splice(this.selectedProjects.findIndex(p => p === name), 1)
      } else {
        this.selectedProjects.push(name)
      }
    },
    onClickName(item) {
      // this.$emit('click-resource', item.id)
    },

    manHourClass(item, i) {
      const o = {}
      if(item && item.manHours) {
        const manHour = DateUtil.workloadUnit(item.manHours[i].manHour)
        if(manHour == 0) {
          o.no = true
        } else if(manHour == 1) {
          o.ok = true
        } else if(manHour < 1) {
          o.less = true
        } else if(manHour > 1) {
          o.over = true
        }
      }
      return o
    },
    taskName(task) {
      const t = this.tasks.find(t => t.id === task.id) || { name: '' }
      const p = task.parentId ? this.tasks.find(t => t.id === task.parentId) : null
      const name = p ? `${p.name} ${t.name}` : t.name
      return name
    },

    createTemplateManHors() {
      const templateManHors = []
      for(let i = 1; i <= 18; i++) {
        const d = this.headerMonth(i)
        templateManHors.push({
          yyyy: d.getFullYear(),
          mm: d.getMonth() + 1,
          manHour: 0,
          tasks: []
        })
      }
      return templateManHors
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
    holidays() {
      return this.holidayStore?.holidayDates || []
    },
    resources() {
      return this.resourceStore?.resources || []
    },
    tasks() {
      return this.taskRecordStore?.taskRecords || []
    },
    projectItems() {
      if(!this.tasks) {
        return []
      }
      return this.tasks.filter(t => !t.parentId).map(t => t.name)
    },
    filterResourcesByProjects() {
      if(this.selectedProjects.length === 0) {
        return []
      }
      // 指定されたプロジェクトの子タスクに assign された人
      const resources = this.tasks
        .filter(t => !t.parentId && this.selectedProjects.includes(t.name))
        .flatMap(p => {
          return this.tasks
            .filter(tt => tt.parentId === p.id)
            .filter(tt => tt.assigneeId)
            .map(tt => this.resources.find(r => r.id == tt.assigneeId))
        })
        .map(r => r.name)
      return [ ...new Set(resources)]
    },

    select: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    resourceHeaders() {
      const headers = [
        {
          text: 'グループ',
          value: 'group'
        },
        {
          text: '名前',
          value: 'name',
          filter: v => {
            return (this.filterResourcesByProjects.length === 0) ?
              true :
              this.filterResourcesByProjects.includes(v)
          }
        },
        {
          text: 'email',
          value: 'email'
        },
        {
          text: '合計',
          value: 'totalManHour'
        }
      ]
      for(let i = 1; i <= 18; i++) {
        const m = dateformat(this.headerMonth(i), 'mm')
        headers.push({
          text: m,
          value: `manHours[${i - 1}]`,
          sortable: false
        })
      }

      return headers
    },
  },
  filters: {
    workloadUnit(v) {
      return DateUtil.workloadUnit(v)
    },
  }
}
</script>
<style lang="scss" scoped>
  .resource-table ::v-deep {
    font-size: .8rem;
    tr {
      th:nth-child(3), td:nth-child(3) {
        width: 7rem;
        border-left: 1px solid #ddd;
      }
      th:nth-child(4), td:nth-child(4) {
        display: none;
      }
      th:nth-child(5), td:nth-child(5) {
        width: 5rem;
        border-left: 1px solid #ddd;
      }
      th:nth-child(n+6), td:nth-child(n+6) {
        width: 3.5rem;
        border-left: 1px solid #CFD8DC;
      }
    }
    tbody {
      tr {
        td:nth-child(3) {
          padding-left: .5rem;
          padding-right: .5rem;
        }
        td:nth-child(5) {
          text-align: center;
        }
        td:nth-child(n+6) {
          background-color: #ECEFF1;
        }
      }
    }
    .man-hour {
      text-align: center;
      &.no {
        display: none;
      }
      &.ok {
        color: white;
        background-color: #2196F3;
      }
      &.less {
        background-color: #FFF9C4;
      }
      &.over {
        color: white;
        background-color: #F44336;
      }
    }
    .resource-name {
      cursor: pointer;
    }
  }

</style>
