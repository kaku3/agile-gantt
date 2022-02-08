<template>
  <v-app>
    <v-navigation-drawer
      mini-variant
      fixed
      app
    >
      <v-list-item to="/">
        <v-list-item-action>
          <v-icon>mdi-chart-timeline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          Gantt
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item v-for="(o, i) in enabledPlugins" :key="i" @click="open(o)">
        <v-list-item-action>
          <v-icon>{{o.icon}}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          {{o.name}}
        </v-list-item-content>
      </v-list-item>
      <template v-slot:append>
        <v-list-item to="/settings">
          <v-list-item-action>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            Settings
          </v-list-item-content>
        </v-list-item>
        <div v-if="$auth.loggedIn">
          <v-list-item to="/account">
            <v-list-item-action>
              <v-icon>mdi-account-circle</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              {{ user.name }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="onLogout">
            <v-list-item-action>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              Logout
            </v-list-item-content>
          </v-list-item>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { getModule } from 'vuex-module-decorators'
import ConfigStore from '~/store/ConfigStore'
import { PLUGINS } from '~/models/Config'

export default {
  data () {
    return {
    }
  },
  methods: {
    open(o) {
      window.open(o.url, o.icon)
    },
    async onLogout() {
      await this.$auth.logout()
      this.$router.replace('/login')
    }
  },
  computed: {
    configStore() {
      return getModule(ConfigStore, this.$store)
    },
    config() {
      return this.configStore?.config
    },
    plugins() {
      const plugins = [ ...PLUGINS ]
      if(this.config.plugins) {
        console.log(this.config.plugins)
        this.config.plugins.forEach(p => {
          const _p = plugins.find(pp => p.icon === pp.icon)
          if(_p) {
            _p.enabled = p.enabled
          }
        })
      }
      return plugins
    },
    enabledPlugins() {
      return this.plugins.filter(v => v.enabled)
    },
    user() {
      return this.$auth.user || {}
    }
  }
}
</script>
<style lang="scss" scoped>
nav {
  z-index: 100;
}
</style>
