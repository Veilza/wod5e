/* global game, foundry, renderTemplate, ChatMessage, TextEditor, WOD5E, Dialog, WOD5E */

import { WOD5eDice } from '../scripts/system-rolls.js'
import { getActiveBonuses } from '../scripts/rolls/situational-modifiers.js'
import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the WOD5E ActorSheet with some very simple modifications
 * @extends {WoDActor}
 */

export class HunterActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['hunter-sheet', 'hunter']
    classList.push(...super.defaultOptions.classes)

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/display/htr/actors/hunter-sheet.hbs'
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = true
    this.hasBoons = false
    this.despairActive = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/display/shared/actors/limited-sheet.hbs'
    return 'systems/vtm5e/display/htr/actors/hunter-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()

    // Prepare items
    await this._prepareItems(data)

    // Prepare edge data
    data.actor.system.edges = await this._prepareEdgeData(data)

    return data
  }

  /** Prepare item data for the Hunter actor */
  async _prepareItems (sheetData) {
    // Prepare items
    super._prepareItems(sheetData)

    // Top-level variables
    const actorData = sheetData.actor
    const actor = this.actor

    // Secondary variables
    const edges = actor.system.edges

    // Track whether despair is toggled on or not
    if (actor.system.despair.value > 0) {
      actorData.system.despairActive = true
    }

    for (const edgeType in edges) {
      // Localize the edge name
      edges[edgeType].label = WOD5E.api.generateLabelAndLocalize({ string: edgeType, type: 'edge' })

      // Wipe old perks so they doesn't duplicate
      edges[edgeType].perks = []

      // Wipe old edge pools so they doesn't duplicate
      edges[edgeType].pools = []
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      // Make sure the item is a perk and has an edge set
      if (i.type === 'perk') {
        if (i.system.edge !== undefined) {
          edges[i.system.edge].perks.push(i)
        }
      } else if (i.type === 'edgepool') {
        if (i.system.edge !== undefined) {
          edges[i.system.edge].pools.push(i)
        }
      }
    }

    return sheetData
  }

  // Handle edge data so we can display it on the actor sheet
  async _prepareEdgeData (sheetData) {
    const edges = sheetData.actor.system.edges

    // Sort the edge containers by the level of the perk instead of by creation date
    // and enrich any Edge/Perk descriptions
    for (const edgeType in edges) {
      // If there's perks for this Edge, then make sure it's visible and sort them
      if (edges[edgeType].perks.length > 0) {
        if (!edges[edgeType].visible) edges[edgeType].visible = true

        edges[edgeType].perks = edges[edgeType].perks.sort(function (perk1, perk2) {
          // If the levels are the same, sort alphabetically instead
          if (perk1.system.level === perk2.system.level) {
            return perk1.name.localeCompare(perk2.name)
          }

          // Sort by level
          return perk1.system.level - perk2.system.level
        })
      }

      // Enrich edge description
      edges[edgeType].enrichedDescription = await TextEditor.enrichHTML(edges[edgeType].description)
    }

    return edges
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Top-level variables
    const actor = this.actor

    // Toggle despair
    html.find('.despair-toggle').click(this._onToggleDespair.bind(this))

    // Handle adding a new edge to the sheet
    html.find('.add-edge').click(this._onAddEdge.bind(this))

    // Rollable Edge perks
    html.find('.edge-rollable').click(this._onEdgeRoll.bind(this))

    // Post Edge description to the chat
    html.find('.edge-chat').click(async event => {
      const data = $(event.currentTarget)[0].dataset
      const edge = actor.system.edges[data.edge]

      renderTemplate('systems/vtm5e/display/ui/chat/chat-message.hbs', {
        name: game.i18n.localize(edge.name),
        img: 'icons/svg/dice-target.svg',
        description: edge.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })
  }

  /** Handle adding a new edge to the sheet */
  async _onAddEdge (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Secondary variables
    const selectLabel = game.i18n.localize('WOD5E.HTR.SelectEdge')
    const itemOptions = WOD5E.Edges.getList()

    // Variables yet to be defined
    let options = []
    let edgeSelected

    // Prompt a dialog to determine which edge we're adding
    // Build the options for the select dropdown
    for (const [key, value] of Object.entries(itemOptions)) {
      options += `<option value="${key}">${value.displayName}</option>`
    }

    // Template for the dialog form
    const template = `
      <form>
        <div class="form-group">
          <label>${selectLabel}</label>
          <select id="edgeSelect">${options}</select>
        </div>
      </form>`

    // Define dialog buttons
    const buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Add'),
        callback: async (html) => {
          edgeSelected = html.find('#edgeSelect')[0].value

          // Make the edge visible
          actor.update({ [`system.edges.${edgeSelected}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    // Display the dialog
    new Dialog({
      title: game.i18n.localize('WOD5E.Add'),
      content: template,
      buttons,
      default: 'submit'
    }, {
      classes: ['wod5e', 'hunter-dialog', 'hunter-sheet']
    }).render(true)
  }

  /** Handle toggling the depsair value */
  async _onToggleDespair (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // I really only do this so it's clear what we're doing here
    const currentDespair = actor.system.despairActive
    const newDespair = !currentDespair

    // Have to do this silly thing in order to prevent old versions of the Hunter sheet from freaking out
    // Basically we're tracking the boolean of true/false in the sheet code but making sure that
    // old versions of the sheet continue to track it in binary 1 or 0.
    // It's dumb, I know, and I hope to set up a migration function to fix it sometime
    // but I don't want to delay this release more than I already had to-
    if (newDespair) { // Set as "true"
      actor.update({ 'system.despair.value': 1 })
    } else { // Set as "false"
      actor.update({ 'system.despair.value': 0 })
    }
  }

  async _onEdgeRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const element = event.currentTarget
    const dataset = Object.assign({}, element.dataset)
    const item = actor.items.get(dataset.id)

    // Secondary variables
    const edgeValue = 1
    const macro = item.system.macroid

    // Variables yet to be defined
    let dice2
    const selectors = []

    // Determine the value of dice1
    const dice1 = item.system.dice1 === 'edge' ? edgeValue : actor.system.abilities[item.system.dice1].value

    // Determine the value of dice2
    if (item.system.dice2 === 'edge') {
      dice2 = edgeValue
    } else if (item.system.skill) {
      dice2 = actor.system.skills[item.system.dice2].value
    } else if (item.system.amalgam) {
      dice2 = actor.system.edges[item.system.dice2].value
    } else {
      dice2 = actor.system.abilities[item.system.dice2].value
    }

    // Handle getting any situational modifiers
    const activeBonuses = await getActiveBonuses({
      actor,
      selectors
    })

    // Add it all together
    const dicePool = dice1 + dice2 + activeBonuses.totalValue

    // Send the roll to the system
    WOD5eDice.Roll({
      basicDice: dicePool,
      actor,
      data: item.system,
      title: item.name,
      selectors,
      macro
    })
  }
}
