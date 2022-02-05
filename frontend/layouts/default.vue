<template>
  <v-app>
    <v-navigation-drawer
      expand-on-hover
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
      <v-list-item to="/settings">
        <v-list-item-action>
          <v-icon>mdi-cog</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          Settings
        </v-list-item-content>
      </v-list-item>
      <template v-slot:append>
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
export default {
  data () {
    return {
    }
  },
  methods: {
    async onLogout() {
      await this.$auth.logout()
      this.$router.replace('/login')
    }
  },
  computed: {
    user() {
      return this.$auth.user || {}
    }
  }
}
</script>
