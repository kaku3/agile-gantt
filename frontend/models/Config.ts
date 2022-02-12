export interface PluginEntity {
  name: string
  icon: string
  url: string
  enabled: boolean
}

export interface ConfigEntity {
  zoom: number
  closeProject: number[]
  managementBeginDate: string

  plugins: PluginEntity[]
}

export const PLUGINS = [
  {
    name: 'Google Calendar',
    icon: 'mdi-calendar',
    url: 'https://calendar.google.com/calendar/u/0/r',
    enabled: false
  },
  {
    name: 'Google Drive',
    icon: 'mdi-folder-google-drive',
    url: 'https://drive.google.com/drive/my-drive',
    enabled: false
  },
  {
    name: 'Google meet',
    icon: 'mdi-video',
    url: 'https://meet.google.com/',
    enabled: false
  },
  {
    name: 'slack',
    icon: 'mdi-slack',
    url: 'https://app.slack.com/client/',
    enabled: false
  },
  {
    name: 'clickup',
    icon: 'cu',
    url: 'https://app.clickup.com/',
    enabled: false
  },


]

export function newConfigEntity() {
  return {
    zoom: 1,
    closeProject: [],
    managementBeginDate: '',

    plugins: PLUGINS
  }
}
