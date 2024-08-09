/* global game, foundry */

// Export this function to be used in other scripts
import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {WoDActor}
 */

export class MortalActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['mortal-sheet', 'mortal']
    classList.push(...super.defaultOptions.classes)

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/display/shared/actors/mortal-sheet.hbs'
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = true
    this.hasBoons = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/display/shared/actors/limited-sheet.hbs'
    return 'systems/vtm5e/display/shared/actors/mortal-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()

    // Define the type of sheet
    data.sheetType = `${game.i18n.localize('WOD5E.Mortal')}`

    // Prepare items
    await this._prepareItems(data)

    return data
  }

  /** Prepare item data for the Mortal actor */
  async _prepareItems (sheetData) {
    // Prepare items
    super._prepareItems(sheetData)

    return sheetData
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)
  }
}
