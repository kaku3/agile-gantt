import { ResourceEntity } from './Resource'
import DateUtil from '~/utils/DateUtil'

export interface Timeline {
  x: number
  w: number
}

export interface TaskEntity {
  id: number
  name: string
  assignee: ResourceEntity | null
  estimate: number  // 見積時点の数字
  plan: number      // 計画の実日数（休日含む）
  planManHour: number
  assignRate: number  // 稼働（期間と稼働は別）
  progress: number
  beginDate: number // yyyymmww
  timeline: Timeline
  children: TaskEntity[] // sub tasks.
  parent: TaskEntity | null
  select: boolean
  showChildren: boolean
  show: boolean
  hasDetail: boolean
}

export interface TaskRecord {
  id: number
  name: string
  assigneeId: number
  estimate: number  // 見積時点の数字
  plan: number      // 計画の実日数（休日含む）
  planManHour: number
  assignRate: number  // 稼働（期間と稼働は別）
  progress: number
  beginDate: number // yyyymmww
  parentId: number
  hasDetail: boolean
}

export function newTaskEntity(id: number): TaskEntity {
  const beginDate = new Date()
  const plan = 28
  const planManHour = DateUtil.newtworkDays(beginDate, plan)
  const timeline = {
    x: 0,
    w: 0
  }

  return {
    id,
    name: `Task - ${id}`,
    assignee: null,
    estimate: 1,
    plan,
    planManHour,
    assignRate: 1,
    progress: 0,
    beginDate: DateUtil.yyyymmddFromDate(beginDate),
    timeline,
    children: [],
    parent: null,
    select: false,
    showChildren: true,
    show: true,
    hasDetail: false
  }
}

export function cloneTaskEntity(id: number, o: TaskEntity): TaskEntity {
  const t = {
    id,
    name: o.name,
    assignee: o.assignee,
    estimate: o.estimate,
    plan: o.plan,
    planManHour: o.planManHour,
    assignRate: o.assignRate,
    progress: o.progress,
    beginDate: o.beginDate,
    timeline: { ...o.timeline },
    children: [],
    parent: o.parent,
    select: false,
    showChildren: o.showChildren,
    show: o.show,
    hasDetail: false  // clone は memo を持たない
  }
  return t;
}

export function toTaskRecords(tasks:TaskEntity[]) {
  const __tasks:TaskEntity[] = []
  tasks.forEach((t:TaskEntity) => {
    __tasks.push(t)
    if(t.children.length > 0) {
      Array.prototype.push.apply(__tasks, t.children)
    }
  })

  const _tasks:any[] = [];
  __tasks.forEach(o => {
    _tasks.push({
      id: o.id,
      name: o.name,
      assigneeId: o.assignee?.id || 0,
      estimate: o.estimate,
      plan: o.plan,
      planManHour: o.planManHour,
      assignRate: o.assignRate,
      progress: o.progress,
      beginDate: o.beginDate,
      parentId: o.parent?.id
    })
  })
  return _tasks;
}

export function fromTaskRecords(tasks:any[], RESOURCES:any[]) {
  tasks.forEach(t => {
    t.assignee = t.assigneeId ? RESOURCES.find(r => r.id == t.assigneeId) : null ;
    Object.assign(t, {
      timeline: { x:0, w:0 },
      children: [],
      parent: null,
      select: false,
      showChildren: true,
      show: true
    })
  });

  const parents = tasks.filter(t => !t.parentId)
  parents.forEach(p => {
    p.children = tasks.filter(t => t.parentId === p.id);
  });

  tasks.forEach(t => {
    delete t['assigneeId']
    delete t['parentId']
  });

  console.log(parents);
  return parents;
}
