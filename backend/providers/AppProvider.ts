import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { SimplePaginatorMetaKeys } from '@ioc:Adonis/Lucid/Database'
import { PaginationMeta } from 'types/pagination'
import { ResponseFormat } from "types/response-format"

export default class AppProvider {
  constructor(protected app: ApplicationContract) { }

  public register() {
    // Register your own bindings
  }

  public async boot() {
    const Response = this.app.container.use('Adonis/Core/Response')

    Response.macro('formatted', function (format: ResponseFormat) {
      this.json(format)
      return this
    })

    Response.macro('success', function (data?: any) {
      const res: ResponseFormat = {
        status: "success",
        data
      }

      if (Array.isArray(data)) {
        res.count = data.length
      }

      this.safeStatus(200).json(res)
      return this
    })

    Response.macro('list', function (out: { data: any[]; pagination: PaginationMeta }) {
      const res: ResponseFormat = {
        status: "success",
        data: out.data,
        count: out.data.length,
        pagination: out.pagination
      }

      this.safeStatus(200).json(res)
      return this
    })

    Response.macro('fail', function (status: string, input?: ResponseFormat | any) {
      let data = {
        status
      }

      if (input) {
        data = {
          ...data,
          ...input
        }
      }

      this.json(data)
      return this
    })
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
