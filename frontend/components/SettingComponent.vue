<template>
  <div class="setting-component">
    <v-row>
      <v-col cols="4">
        <v-card>
          <v-card-title>
            グループ
          </v-card-title>
          <v-card-text>
            <v-file-input
              dense
              show-size
              accept="text/csv"
              label="Group File"
              v-model="groupsFile"
              @change="onChangeGroupFile"
            >
            </v-file-input>
          </v-card-text>
        </v-card>
        <v-card v-if="_groups.length > 0">
          <v-card-text>
            <v-simple-table dense
              fixed-header
              height="60vh"
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th v-for="(h, i) in groupsHeader" :key="i">
                      {{h}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in _groups"
                    :key="r.id"
                  >
                    <td v-for="(c, j) in Object.values(r)" :key="j">
                      {{c}}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <VueJsonToCsv :json-data="_groups" csv-title="groups">
              <v-btn>
                Export
              </v-btn>
            </VueJsonToCsv>
            <v-btn color="primary"
              :disabled="groupsFile == null"
              @click="uploadGroups"
            >
              Import
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card>
          <v-card-title>
            リソース
          </v-card-title>
          <v-card-text>
            <v-file-input
              dense
              show-size
              accept="text/csv"
              label="Resource File"
              v-model="resourcesFile"
              @change="onChangeResourceFile"
            >
            </v-file-input>
          </v-card-text>
        </v-card>
        <v-card v-if="_resources.length > 0">
          <v-card-text>
            <v-simple-table dense
              fixed-header
              height="60vh"
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th v-for="(h, i) in resourcesHeader" :key="i">
                      {{h}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in _resources"
                    :key="r.id"
                  >
                    <td v-for="(c, j) in Object.values(r)" :key="j">
                      {{c}}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <VueJsonToCsv :json-data="_resources" csv-title="resources">
              <v-btn>
                Export
              </v-btn>
            </VueJsonToCsv>
            <v-btn color="primary"
              :disabled="resourcesFile == null"
              @click="uploadResources"
            >
              Import
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card>
          <v-card-title>
            休日
          </v-card-title>
          <v-card-text>
            <v-file-input
              dense
              show-size
              accept="text/csv"
              label="Holiday File"
              v-model="holidaysFile"
              @change="onChangeHolidayFile"
            >
            </v-file-input>
          </v-card-text>
        </v-card>
        <v-card v-if="_holidays.length > 0">
          <v-card-text>
            <v-simple-table dense
              fixed-header
              height="60vh"
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th v-for="(h, i) in holidaysHeader" :key="i">
                      {{h}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in _holidays"
                    :key="r.date"
                  >
                    <td v-for="(c, j) in Object.values(r)" :key="j">
                      {{c}}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <VueJsonToCsv :json-data="_holidays" csv-title="resources">
              <v-btn>
                Export
              </v-btn>
            </VueJsonToCsv>
            <v-btn color="primary"
              :disabled="holidaysFile == null"
              @click="uploadHolidays"
            >
              Import
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar top
      v-model="popup.show"
    >
      {{ popup.text }}
    </v-snackbar>
  </div>
</template>
<script>
import { parse } from 'csv-parse/lib/sync'
import VueJsonToCsv from 'vue-json-to-csv'

import { getModule } from 'vuex-module-decorators'

import HolidayStore from '~/store/HolidayStore'
import GroupStore from '~/store/GroupStore'
import ResourceStore from '~/store/ResourceStore'

export default {
  components: {
    VueJsonToCsv
  },
  data () {
    return {
      groupsFile: null,
      resourcesFile: null,
      holidaysFile: null,
      groups: [],
      resources: [],
      holidays: [],
      popup: {
        show: false,
        text: ''
      }
    }
  },
  methods: {
    async onChangeGroupFile(file) {
      try {
        const content = await this.readAsText(file)
        const records = parse(content, {
          columns: true
        })
        this.groups = records
      } catch(e) {
        this.showPopup(e)
      }
    },
    async onChangeResourceFile(file) {
      try {
        const content = await this.readAsText(file)
        const records = parse(content, {
          columns: true
        })
        this.resources = records
      } catch(e) {
        this.showPopup(e)
      }
    },
    async onChangeHolidayFile(file) {
      try {
        const content = await this.readAsText(file)
        const records = parse(content, {
          columns: true
        })
        this.holidays = records
      } catch(e) {
        this.showPopup(e)
      }
    },

    uploadGroups() {
      this.$axios.post('/groups', this.groups)
        .then(res => {
          this.showPopup('update')
          this.groupStore.setGroups(this.groups)
          this.groups = []
          this.groupsFile = null
        })
    },
    uploadResources() {
      this.$axios.post('/resources', this.resources)
        .then(res => {
          this.showPopup('update')
          this.resourceStore.setResources(this.resources)
          this.resources = []
          this.resourcesFile = null
        })
    },
    uploadHolidays() {
      this.$axios.post('/holidays', this.holidays)
        .then(res => {
          this.showPopup('update')
          this.holidayStore.setHolidays(this.holidays)
          this.holidays = []
          this.holidaysFile = null
        })
    },

    showPopup(text) {
      this.popup.show = true;
      this.popup.text = text;
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
    holidayStore() {
      return getModule(HolidayStore, this.$store);
    },
    groupStore() {
      return getModule(GroupStore, this.$store);
    },
    resourceStore() {
      return getModule(ResourceStore, this.$store);
    },
    _holidays() {
      return (this.holidays.length > 0) ?
        this.holidays :
        this.holidayStore.holidays || []
    },
    _groups() {
      return (this.groups.length > 0) ? this.groups : this.groupStore.groups || []
    },
    _resources() {
      return (this.resources.length > 0) ? this.resources : this.resourceStore.resources || []
    },

    groupsHeader() {
      return this._groups.length > 0 ? Object.keys(this._groups[0]) : []
    },
    resourcesHeader() {
      return this._resources.length > 0 ? Object.keys(this._resources[0]) : []
    },
    holidaysHeader() {
      return this._holidays.length > 0 ? Object.keys(this._holidays[0]) : []
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
