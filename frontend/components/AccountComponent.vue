<template>
  <v-form v-model="valid">
    <v-container>
      <v-row justify="center">
        <v-col
          cols="6"
        >
          <v-card>
            <v-card-text>
              {{ user.name }}
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="oldPassword"
                    label="Old Password"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showOldPassword"
                    required
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                    required
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="onChangePassword">Change</v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<script>

export default {
  data: () => ({
    valid: false,
    oldPassword: '',
    showOldPassword: false,
    password: '',
    showPassword: false,
  }),
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
    }
  },
  computed: {
    user() {
      return this.$auth.user || {}
    }
  }
}
</script>
