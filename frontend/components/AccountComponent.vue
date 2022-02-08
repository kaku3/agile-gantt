<template>
  <v-form v-model="valid">
    <v-container>
      <v-row justify="center">
        <v-col cols="12">
          <v-card>
            <v-card-text>
              {{ user.name }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="6"
        >
          <v-card>
            <v-card-title>
              Password
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="oldPassword"
                label="Old Password"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showOldPassword"
                required
              >
              </v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
              >
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="onChangePassword">Change</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col
          cols="6"
        >
          <v-card>
            <v-list dense>
              <v-list-item v-for="(o, i) in plugins" :key="i">
                <v-list-item-icon>
                  <v-icon>{{o.icon}}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  {{o.name}}
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch v-model="o.enabled" inset @change="onUpdatePluginEnabled"></v-switch>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<script>
import { getModule } from 'vuex-module-decorators'
import ConfigStore from '~/store/ConfigStore'
import { PLUGINS } from '~/models/Config'

export default {
  data: () => ({
    valid: false,
    oldPassword: '',
    showOldPassword: false,
    password: '',
    showPassword: false,
  }),
  async mounted () {
    const res = await this.$axios.get(`/accounts/${this.$auth.user.id}/config`)
    this.configStore.setConfig(res.data)
  },
  methods: {
    async onChangePassword() {
      try {
        const ret = await this.$axios.post(`/accounts/${this.$auth.user.id}/change-password`, {
          oldPassword: this.oldPassword,
          password: this.password
        })
        console.log(ret)
      } catch(e) {
        console.log(e)
      }
    },
    async onUpdatePluginEnabled() {
      this.configStore.setPlugins(this.plugins)
      await this.saveConfig()
    },
    async saveConfig() {
      await this.$axios.post(`/accounts/${this.$auth.user.id}/config`, this.config)
        .then(res => {
          console.log(res)
        })
        .catch(err => console.error(err))
    }
  },
  computed: {
    configStore() {
      return getModule(ConfigStore, this.$store)
    },
    config: {
      get() {
        return this.configStore?.config
      },
      set(v) {
        this.configStore.setConfig(v)
      }
    },
    plugins() {
      const plugins = [ ...PLUGINS ]
      if(this.config.plugins) {
        this.config.plugins.forEach(p => {
          const _p = plugins.find(pp => p.icon === pp.icon)
          if(_p) {
            _p.enabled = p.enabled
          }
        })
      }
      return plugins
    },

    user() {
      return this.$auth.user || {}
    }
  }
}
</script>
