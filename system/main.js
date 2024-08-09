/* global CONFIG, Hooks, Actors, ActorSheet, ChatMessage, Items, ItemSheet, Macro, game, ui, CONST */

// Actor sheets
import { ActorInfo } from './actor/actor.js'
import { WOD5EActorDirectory } from './ui/actor-directory.js'
import { RenderActorSidebar } from './ui/actors-sidebar.js'
import { RenderSettings } from './ui/settings-sidebar.js'
// Item sheets
import { ItemInfo } from './item/item.js'
import { WoDItemSheet } from './item/item-sheet.js'
// FVTT and module functionality
import { preloadHandlebarsTemplates } from './scripts/templates.js'
import { loadDiceSoNice } from './dice/dice-so-nice.js'
import { loadHelpers } from './scripts/helpers.js'
import { loadSettings, _updatePreferredColorScheme, _updateHeaderFontPreference } from './scripts/settings.js'
// WOD5E functions and classes
import { MortalDie, VampireDie, VampireHungerDie, HunterDie, HunterDesperationDie, WerewolfDie, WerewolfRageDie } from './dice/splat-dice.js'
import { migrateWorld } from './scripts/migration.js'
import { willpowerReroll } from './scripts/willpower-reroll.js'
import { wod5eAPI } from './api/wod5e-api.js'
// WOD5E Definitions
import { Systems } from './api/def/systems.js'
import { Attributes } from './api/def/attributes.js'
import { Skills } from './api/def/skills.js'
import { Features } from './api/def/features.js'
import { ActorTypes } from './api/def/actortypes.js'
import { ItemTypes } from './api/def/itemtypes.js'
import { Disciplines } from './api/def/disciplines.js'
import { Edges } from './api/def/edges.js'
import { Renown } from './api/def/renown.js'
import { WereForms } from './api/def/were-forms.js'
import { Gifts } from './api/def/gifts.js'

// Anything that needs to be ran alongside the initialisation of the world
Hooks.once('init', async function () {
  console.log('Initializing Schrecknet...')

  // Some basic info for the gamesystem
  game.wod5e = {
    ActorInfo,
    ItemInfo,
    rollItemMacro
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = ActorInfo
  CONFIG.Item.documentClass = ItemInfo
  CONFIG.ui.actors = WOD5EActorDirectory
  CONFIG.Dice.terms.m = MortalDie
  CONFIG.Dice.terms.v = VampireDie
  CONFIG.Dice.terms.g = VampireHungerDie
  CONFIG.Dice.terms.h = HunterDie
  CONFIG.Dice.terms.s = HunterDesperationDie
  CONFIG.Dice.terms.w = WerewolfDie
  CONFIG.Dice.terms.r = WerewolfRageDie

  // Register actor sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  // Loop through each entry in the actorTypesList and register their sheet classes
  const actorTypesList = ActorTypes.getList()
  for (const [, value] of Object.entries(actorTypesList)) {
    const { label, types, sheetClass } = value

    Actors.registerSheet('vtm5e', sheetClass, {
      label,
      types,
      makeDefault: true
    })
  }

  // Register the WoDItemSheet class, used for all items
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('vtm5e', WoDItemSheet, {
    makeDefault: true
  })

  // Make Handlebars templates accessible to the system
  preloadHandlebarsTemplates()

  // Make helpers accessible to the system
  loadHelpers()

  // Load settings into Foundry
  loadSettings()

  // Initialize color scheme on game init
  _updatePreferredColorScheme()

  // Initialize header font preference on game init
  _updateHeaderFontPreference()

  // Initialize the alterations to the actors sidebar
  RenderActorSidebar()

  // Initialize the alterations to the settings sidebar
  RenderSettings()
})

// Anything that needs to run once the world is ready
Hooks.once('ready', async function () {
  // Apply the currently selected language as a CSS class so we can
  // modify elements based on locale if needed
  document.body.classList.add(game.settings.get('core', 'language'))

  // Activate the API
  window.WOD5E = {
    api: {
      Roll: wod5eAPI.Roll,
      RollFromDataset: wod5eAPI.RollFromDataset,
      getBasicDice: wod5eAPI.getBasicDice,
      getAdvancedDice: wod5eAPI.getAdvancedDice,
      getFlavorDescription: wod5eAPI.getFlavorDescription,
      generateLabelAndLocalize: wod5eAPI.generateLabelAndLocalize,
      migrateWorld
    },
    Systems,
    Attributes,
    Skills,
    Features,
    ActorTypes,
    ItemTypes,
    Disciplines,
    Edges,
    Renown,
    Gifts,
    WereForms
  }

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createRollableMacro(data, slot))

  // Migration functions
  migrateWorld()
})

Hooks.once('setup', () => {
  // Forced panning is intrinsically annoying: change default to false
  game.settings.settings.get('core.chatBubblesPan').default = false

  // Improve discoverability of map notes
  game.settings.settings.get('core.notesDisplayToggle').default = true

  // Set Hover by Owner as defaults for Default Token Configuration
  const defaultTokenSettingsDefaults = game.settings.settings.get('core.defaultToken').default
  defaultTokenSettingsDefaults.displayName = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
  defaultTokenSettingsDefaults.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER

  // Default token dispositions to neutral
  defaultTokenSettingsDefaults.disposition = CONST.TOKEN_DISPOSITIONS.NEUTRAL
})

// DiceSoNice functionality
Hooks.once('diceSoNiceReady', (dice3d) => {
  loadDiceSoNice(dice3d)
})

// Display the willpower reroll option in the chat when messages are right clicked
Hooks.on('getChatLogEntryContext', (html, options) => {
  options.push({
    name: game.i18n.localize('WOD5E.Chat.WillpowerReroll'),
    icon: '<i class="fas fa-redo"></i>',
    condition: li => {
      // Only show this context menu if the person is GM or author of the message
      const message = game.messages.get(li.attr('data-message-id'))

      // Only show this context menu if there are re-rollable dice in the message
      const rerollableDice = li.find('.rerollable').length

      // Only show this context menu if there's not any already rerolled dice in the message
      const rerolledDice = li.find('.rerolled').length

      // All must be true to show the reroll dialog
      return (game.user.isGM || message.isAuthor) && (rerollableDice > 0) && (rerolledDice === 0)
    },
    callback: li => willpowerReroll(li)
  })
})

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createRollableMacro (data, slot) {
  if (data.type !== 'Item') return

  // Create a rollable macro for this item
  if (data.system.rollable) {
    const item = data.system

    // Create the macro command
    const command = `game.WOD5E.RollListItemMacro("${item.name}")`
    let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command))
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: 'script',
        img: item.img,
        command,
        flags: { 'vtm5e.itemMacro': true }
      })
    }
    game.user.assignHotbarMacro(macro, slot)
    return false
  }
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro (itemName) {
  const speaker = ChatMessage.getSpeaker()
  let actor
  if (speaker.token) actor = game.actors.tokens[speaker.token]
  if (!actor) actor = game.actors.get(speaker.actor)
  const item = actor ? actor.items.find(i => i.name === itemName) : null
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)

  // Trigger the item roll
  return item.roll()
}
