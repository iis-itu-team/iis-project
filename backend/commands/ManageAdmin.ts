import { BaseCommand, args } from '@adonisjs/core/build/standalone'

export default class ManageAdmin extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'manage:admin'

  @args.string({ description: 'email, nickname or id of the user' })
  public uid: string

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'give user an administrator role'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const { default: User } = await import('App/Models/User')

    const users = await User.query()
      .where('id', this.uid)
      .orWhere('nickname', this.uid)
      .orWhere('email', this.uid)

    if (users.length > 1) {
      // more users could match this, for ex. have an email as a nickname,
      // while the email is used by another user :shrug:
      this.logger.error('more users match, use a more distinct id')
      users.forEach((user) => this.logger.error(`- ${user.id}, ${user.nickname}, ${user.nickname}`))
      return;
    }

    if (users.length === 0) {
      this.logger.error('not users match this description')
      return;
    }

    const { Role } = await import('types/role')

    const user = users[0];

    user.role = Role.ADMIN;
    (await user.save()).refresh()

    this.logger.info(`user ${user.nickname} made an administrator`)
    this.logger.info(JSON.stringify(user.serializeAttributes()))
  }
}
