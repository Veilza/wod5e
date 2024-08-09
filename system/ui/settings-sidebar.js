/* global game, Hooks */

/* Various additional information added to the Settings sidebar */
export const RenderSettings = async () => {
  Hooks.on('renderSettings', async (_app, html) => {
    // Additional system information resources
    const systemRow = html.find('#game-details li.system')

    const systemLinks = `<li class='external-system-links'>
        <a href='https://github.com/WoD5E-Developers/wod5e/releases' target='_blank'>${game.i18n.localize('WOD5E.Changelog')}</a>
        |
        <a href='https://wod5e-developers.github.io/wod5e-docs/' target='_blank'>${game.i18n.localize('WOD5E.Wiki')}</a>
      </li>`

    $(systemLinks).insertAfter(systemRow)

    // License Section
    const settingsAccess = html.find('#settings-access')
    const licenseInformation = `<h2>${game.i18n.localize('WOD5E.LicensedUnderDarkPack')}</h2>
      <div id='license-information'>
        ${game.i18n.localize('WOD5E.LicensedUnderDarkPackFulltext')}
      </div>`
    $(licenseInformation).insertAfter(settingsAccess)
  })
}
