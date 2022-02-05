import { NETWORKDAYS } from 'xl-formula'

export default class DateUtil {
  /**
   * Date を yyyymmww 形式に変換
   * @param d Date
   * @returns yyyymmdd : number
   */
  static yyyymmddFromDate(d: Date) : number {
    return  d.getFullYear() * 10000 +
            (d.getMonth() + 1) * 100 +
            d.getDate()
  }
  /**
   * Date を yyyy-mm-dd 形式に変換
   * @param d Date
   */
  static yyyy_mm_ddFromDate(d: Date) : string {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  }
  /**
   *
   * @param yyyymmdd
   * @returns
   */
  static dateFromYYYYMMDD(yyyymmdd: number) : Date {
    const yyyy = Math.floor(yyyymmdd / 10000)
    const mm = Math.floor(yyyymmdd / 100) % 100
    const dd = yyyymmdd % 100
    return new Date(yyyy, mm - 1, dd, 0, 0, 0)
  }

  /**
   * yyyymmdd : number を { yyyy, mm, dd } として取得
   * @param date
   * @returns
   */
  static yyyymmddObject(date: number) : any {
    const yyyy = Math.floor(date / 10000)
    const mm = Math.floor(date / 100) % 100
    const dd = date % 100
    return {
      yyyy,
      mm,
      dd
    }
  }


  /**
   * 基準日からの日数差分の count:number を返却
   * @param baseDate 基準日
   * @param date yyyymmdd: number
   * @returns 差分
   */
  static dateCountFromBaseDate(baseDate: Date, date: number) : number {
    const { yyyy, mm, dd } = this.yyyymmddObject(date)
    const d:Date = new Date(yyyy, mm - 1, dd)
    return (d.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000)
  }
  /**
   * 基準日＋日数差分の date:Date を返却
   * @param baseDate
   * @param count
   * @returns
   */
  static dateFromDateCount(baseDate: Date, count: number) : Date {
    return new Date(baseDate.getTime() + count * (24 * 60 * 60 * 1000))
  }

  static yyyymmddFormDateCount(base: number, count: number) : number {
    const e = this.dateFromDateCount(this.dateFromYYYYMMDD(base), count)
    return this.yyyymmddFromDate(e)
  }

  /**
   * 基準日＋日数差分の yyyymmdd:number を返却
   * @param baseDate
   * @param count
   * @returns
   */
  static yyyymmddFromDateCount(baseDate: Date, count: number) : number {
    return this.yyyymmddFromDate(this.dateFromDateCount(baseDate, count))
  }

  /**
   * 日付の差分を求める
   * @param v1 基準日
   * @param v2 差分対象日
   * @returns
   */
  static dateDiff(v1: Date, v2: Date): number {
    return (v2.getTime() - v1.getTime()) / (24 * 60 * 60 * 1000)
  }
  /**
   * 日付の差分を求める
   * @param v1 yyyymmdd : 基準日
   * @param v2 yyyymmdd : 差分対象日
   * @returns
   */
  static yyyymmddDiff(v1: number, v2: number): number {
    return this.dateDiff(
      this.dateFromYYYYMMDD(v1),
      this.dateFromYYYYMMDD(v2)
    )
  }

  static newtworkDays(f: Date, count: number, holidays = []): number {
    const t = this.dateFromDateCount(f, count)
    return NETWORKDAYS(f, t, holidays)
  }
  static networkDaysFromYYYYMMDD(f: number, count: number, holidays = []): number {
    const b = this.dateFromYYYYMMDD(f)
    const e = this.dateFromDateCount(b, count)
    return NETWORKDAYS(b, e, holidays)
  }
  static monthlyNetworkDaysFromYYYYMMDD(f: number, count: number, rate: number, holidays = []): any[] {
    const rets = []
    let b = this.dateFromYYYYMMDD(f)
    const e = this.dateFromDateCount(b, count)
    e.setDate(e.getDate() - 1)
    e.setHours(23, 59, 59)

    let d = new Date(b.getFullYear(), b.getMonth() + 1, 0, 23, 59, 59);
    if(d > e) {
      d = e
    }
    while(b < e) {
      rets.push({
        yyyy: b.getFullYear(),
        mm: b.getMonth() + 1,
        manHour: NETWORKDAYS(b, d, holidays) * rate
      })

      b = new Date(b.getFullYear(), b.getMonth() + 1, 1, 0, 0, 0);
      d = new Date(d.getFullYear(), d.getMonth() + 2, 0, 23, 59, 59);
      if(d > e) {
        d = e
      }
    }
    return rets
  }

  static workloadUnit(v: number): string {
    return ((Math.ceil((v / 20) * 4) / 4)).toFixed(2)
  }
}
