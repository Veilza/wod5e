/* global Dialog, game, foundry, WOD5E */

import { WoDActor } from './wod-v5-sheet.js'
import { Skills } from '../api/def/skills.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {WoDActor}
 */

export class SPCActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['spc-sheet']
    classList.push(...super.defaultOptions.classes)

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/display/shared/actors/spc-sheet.hbs',
      width: 850,
      height: 500
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = true
    this.hunger = false
    this.hasBoons = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/display/shared/actors/limited-sheet.hbs'

    const spcType = this.actor.system.spcType

    // Push the appropriate CSS class depending on SPC type
    // Additionally, update the gamesystem
    if (spcType === 'vampire' || spcType === 'ghoul') {
      this.options.classes.push(...['vampire'])
    } else if (spcType === 'hunter') {
      this.options.classes.push(...['hunter'])
    } else if (spcType === 'werewolf') {
      this.options.classes.push(...['werewolf'])
    } else {
      this.options.classes.push(...['mortal'])
    }

    return 'systems/vtm5e/display/shared/actors/spc-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()

    // Prepare items
    await this._prepareItems(data)

    // Apply new CSS classes to the sheet, if necessary
    this._applyClasses()

    // SPC type options
    data.spcTypes = {
      mortal: 'WOD5E.Mortal',
      vampire: 'WOD5E.VTM.Label',
      ghoul: 'WOD5E.VTM.Ghoul',
      hunter: 'WOD5E.HTR.Label',
      werewolf: 'WOD5E.WTA.Label'
    }

    // Determine gamesystem based on spcType
    const spcType = this.actor.system.spcType

    // Push the appropriate CSS class depending on SPC type
    // Additionally, update the gamesystem
    if (spcType === 'vampire' || spcType === 'ghoul') {
      this.actor.system.gamesystem = 'vampire'
    } else if (spcType === 'hunter') {
      this.actor.system.gamesystem = 'hunter'
    } else if (spcType === 'werewolf') {
      this.actor.system.gamesystem = 'werewolf'
    } else {
      this.actor.system.gamesystem = 'mortal'
    }

    // Apply new CSS classes to the sheet, if necessary
    this._applyClasses()

    return data
  }

  /**
     * Organize and classify Items for all sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  async _prepareItems (sheetData) {
    // Top-level variables
    const actorData = sheetData.actor

    // Secondary variables
    const exceptionaldicepools = []

    // Prepare items
    super._prepareItems(sheetData)

    // Loop through each entry in the skills list, get the data (if available), and then push to the containers
    const skillsList = Skills.getList({})
    const actorSkills = actorData.system?.exceptionaldicepools

    if (actorSkills) {
      // Clean up non-existent skills, such as custom ones that no longer exist
      const validSkills = new Set(Object.keys(skillsList))
      for (const id of Object.keys(actorSkills)) {
        if (!validSkills.has(id)) {
          delete actorSkills[id]
        }
      }

      for (const [id, value] of Object.entries(skillsList)) {
        let skillData = {}
        let hasSpecialties = false
        const specialtiesList = []

        if (actorSkills[id]?.bonuses?.length > 0) {
          hasSpecialties = true

          for (const bonus of actorSkills[id].bonuses) {
            specialtiesList.push(bonus.source)
          }
        }

        // If the actor has a skill with the key, grab its current values
        if (Object.prototype.hasOwnProperty.call(actorSkills, id)) {
          skillData = Object.assign({
            id,
            value: actorSkills[id].value,
            hasSpecialties,
            specialtiesList,
            visible: actorSkills[id].visible
          }, value)
        } else { // Otherwise, add it to the actor and set it as some default data
          await this.actor.update({ [`system.exceptionaldicepools.${id}`]: { value: 0 } })

          skillData = Object.assign({
            id,
            value: 0,
            hasSpecialties,
            specialtiesList
          }, value)
        }

        // Push to the container as long as the skill isn't "hidden"
        if (!skillData.hidden && skillData.visible) {
          exceptionaldicepools.push(skillData)
        }
      }
    }

    actorData.system.exceptionaldicepools_list = exceptionaldicepools
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Top-level variables
    const actor = this.actor

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Make Exceptional Skill visible
    html.find('.exceptionalskill-create').click(this._onCreateExceptionalSkill.bind(this))

    // Make Exceptional Skill hidden
    html.find('.exceptionalskill-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      actor.update({ [`system.exceptionaldicepools.${data.exceptionalskill}.visible`]: false })
    })

    // Make powers visible
    html.find('.power-create').click(this._onCreatePower.bind(this))

    // Make powers hidden
    html.find('.power-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset

      if (data.type === 'discipline') {
        actor.update({ [`system.disciplines.${data.id}.visible`]: false })
      } else if (data.type === 'edge') {
        actor.update({ [`system.edges.${data.id}.visible`]: false })
      } else if (data.type === 'gift') {
        actor.update({ [`system.gifts.${data.id}.visible`]: false })
      }
    })
  }

  /**
     * Handle making a exceptional skills visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onCreateExceptionalSkill (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    let options = ''
    let buttons = {}

    // Gather and push the list of options to the 'options' variable
    for (const [key, value] of Object.entries(WOD5E.Skills.getList({}))) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.displayName)}</option>`)
    }

    // Define the template to be used
    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('WOD5E.SPC.SelectSkill')}</label>
              <select id="skillSelect">${options}</select>
          </div>
      </form>`

    // Define any buttons needed and add them to the buttons variable
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          // Define the skill being used
          const exceptionalskill = html.find('#skillSelect')[0].value

          // If the dicepool wasn't already visible, make it visible
          actor.update({ [`system.exceptionaldicepools.${exceptionalskill}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
    const system = actor.system.gamesystem in WOD5E.Systems.getList() ? actor.system.gamesystem : 'mortal'

    // Display the dialog
    new Dialog({
      title: game.i18n.localize('WOD5E.SPC.AddSkill'),
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', `${system}-dialog`, `${system}-sheet`]
    }).render(true)
  }

  /**
     * Handle making a discipline visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onCreatePower (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const data = $(event.currentTarget)[0].dataset
    const powerType = data.type

    // Variables yet to be defined
    let options = ''
    let buttons = {}
    let titleLabel = ''
    let label = ''

    // Gather and push the list of options to the 'options' variable
    if (powerType === 'discipline') {
      const disciplinesList = WOD5E.Disciplines.getList()
      for (const [key, value] of Object.entries(disciplinesList)) {
        options = options.concat(`<option value="${key}">${value.displayName}</option>`)
      }

      titleLabel = game.i18n.localize('WOD5E.VTM.AddDiscipline')
      label = game.i18n.localize('WOD5E.VTM.SelectDiscipline')
    } else if (powerType === 'gift') {
      const giftsList = WOD5E.Gifts.getList()
      for (const [key, value] of Object.entries(giftsList)) {
        options = options.concat(`<option value="${key}">${value.displayName}</option>`)
      }

      titleLabel = game.i18n.localize('WOD5E.WTA.AddGift')
      label = game.i18n.localize('WOD5E.WTA.SelectGift')
    } else if (powerType === 'edge') {
      const edgesList = WOD5E.Edges.getList()
      for (const [key, value] of Object.entries(edgesList)) {
        options = options.concat(`<option value="${key}">${value.displayName}</option>`)
      }

      titleLabel = game.i18n.localize('WOD5E.HTR.AddEdge')
      label = game.i18n.localize('WOD5E.HTR.SelectEdge')
    }

    // Define the template to be used
    const template = `
      <form>
          <div class="form-group">
              <label>${label}</label>
              <select id="powerSelect">${options}</select>
          </div>
      </form>`

    // Define any buttons needed and add them to the buttons variable
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          // Define the selected discipline
          const power = html.find('#powerSelect')[0].value

          // If the discipline wasn't already visible, make it visible
          actor.update({ [`system.${powerType}s.${power}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
    const system = actor.system.gamesystem in WOD5E.Systems.getList() ? actor.system.gamesystem : 'mortal'

    // Display the dialog
    new Dialog({
      title: titleLabel,
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', `${system}-dialog`, `${system}`]
    }).render(true)
  }

  // Called to re-apply the CSS classes if the sheet type is changed
  async _applyClasses () {
    // Grab the default list of sheet classes
    const sheetElement = $(this.document._sheet.element)

    // Put the SPC type in a convenient variable
    const spcType = this.actor.system.spcType

    // Add a new sheet class depending on the type of sheet
    if (spcType === 'vampire' || spcType === 'ghoul') {
      sheetElement.removeClass('hunter werewolf')
      sheetElement.addClass('vampire')
    } else if (spcType === 'hunter') {
      sheetElement.removeClass('vampire werewolf')
      sheetElement.addClass('hunter')
    } else if (spcType === 'werewolf') {
      sheetElement.removeClass('hunter vampire')
      sheetElement.addClass('werewolf')
    } else {
      // Default to a mortal sheet
      sheetElement.removeClass('hunter vampire werewolf')
      sheetElement.addClass('mortal')
    }
  }
}
