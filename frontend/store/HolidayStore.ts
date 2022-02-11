import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({
  name: 'HolidayStore',
  stateFactory: true,
  namespaced: true
})
export default class HolidayStore extends VuexModule {
  _holidays: any[] = []

  get holidays(): any[] {
    return this._holidays
  }

  get holidayDates(): String[] {
    return this._holidays.map(h => h.date)
  }

  @Mutation
  setHolidays(es: any[]) {
    this._holidays = es
  }
}
