/* global game, ui, WOD5E, foundry */

import { AutomationMenu } from './menus/automation-menu.js'
import { StorytellerMenu } from './menus/storyteller-menu.js'
import { resetActors } from './reset-actors.js'

/**
 * Define all game settings here
 * @return {Promise}
 */
export const loadSettings = async function () {
  // Color Scheme
  // Custom written to allow for usage of extra themes
  game.settings.register('vtm5e', 'colorScheme', {
    name: 'WOD5E.Settings.ColorScheme',
    hint: 'WOD5E.Settings.ColorSchemeHint',
    scope: 'client',
    config: true,
    type: new foundry.data.fields.StringField({
      required: true,
      blank: true,
      initial: '',
      choices: {
        '': 'WOD5E.Settings.ColorSchemeDefault',
        light: 'WOD5E.Settings.ColorSchemeLight',
        dark: 'WOD5E.Settings.ColorSchemeDark',
        vampire: 'WOD5E.Settings.ColorSchemeVampire',
        hunter: 'WOD5E.Settings.ColorSchemeHunter',
        werewolf: 'WOD5E.Settings.ColorSchemeWerewolf'
      }
    }),
    onChange: () => _updatePreferredColorScheme()
  })

  // Deactivate Vampire Revised Font
  game.settings.register('vtm5e', 'disableVampireFont', {
    name: game.i18n.localize('WOD5E.Settings.DisableVampireFont'),
    hint: game.i18n.localize('WOD5E.Settings.DisableVampireFontHint'),
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
    onChange: () => _updateHeaderFontPreference()
  })

  // Whether the actor banner will appear on sheets or not
  game.settings.register('vtm5e', 'actorBanner', {
    name: game.i18n.localize('WOD5E.Settings.ActorBanner'),
    hint: game.i18n.localize('WOD5E.Settings.ActorBannerHint'),
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => {
      // Update all current actors
      resetActors()
    }
  })

  /* Chat roller is disabled until it can be fixed
  game.settings.register('vtm5e', 'useChatRoller', {
    name: 'Chat Roller',
    hint: 'Display dice roller in chat window.',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  })

  game.settings.register('vtm5e', 'chatRollerSortAbilities', {
    name: 'Sort Abilities in Chat Roller',
    hint: 'Sort abilities (Attributes, Skills, Disciplines, Edges) alphabetically in the chat roller. Disable to sort in the order on the character sheet (grouping physical, social, and mental).',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean
  })
  */

  /*
    Automation Settings
  */

  // Automation Menu
  game.settings.registerMenu('vtm5e', 'automationMenu', {
    name: game.i18n.localize('WOD5E.Settings.AutomationSettings'),
    hint: game.i18n.localize('WOD5E.Settings.AutomationSettingsHint'),
    label: game.i18n.localize('WOD5E.Settings.AutomationSettings'),
    icon: 'fas fa-wrench',
    type: AutomationMenu,
    restricted: true
  })

  // Disable All Automation
  game.settings.register('vtm5e', 'disableAutomation', {
    name: game.i18n.localize('WOD5E.Settings.DisableAutomation'),
    hint: game.i18n.localize('WOD5E.Settings.DisableAutomationHint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
    onChange: async (value) => {
      if (value) {
        await game.settings.set('vtm5e', 'automatedWillpower', false)
        await game.settings.set('vtm5e', 'automatedHunger', false)
        await game.settings.set('vtm5e', 'automatedOblivion', false)
        await game.settings.set('vtm5e', 'automatedRage', false)
      } else {
        await game.settings.set('vtm5e', 'automatedWillpower', true)
        await game.settings.set('vtm5e', 'automatedHunger', true)
        await game.settings.set('vtm5e', 'automatedOblivion', true)
        await game.settings.set('vtm5e', 'automatedRage', true)
      }

      // Re-render the automation window once settings are updated
      const AutomationWindow = Object.values(ui.windows).filter(w => (w.id === 'wod5e-automation'))[0]
      if (AutomationWindow) {
        AutomationWindow.render()
      }
    }
  })

  // Automated Willpower
  game.settings.register('vtm5e', 'automatedWillpower', {
    name: game.i18n.localize('WOD5E.Settings.AutomateWillpower'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateWillpowerHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  // Automated Hunger
  game.settings.register('vtm5e', 'automatedHunger', {
    name: game.i18n.localize('WOD5E.Settings.AutomateHunger'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateHungerHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  // Automated Oblivion Rolls
  game.settings.register('vtm5e', 'automatedOblivion', {
    name: game.i18n.localize('WOD5E.Settings.AutomateOblivion'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateOblivionHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  // Automated Rage
  game.settings.register('vtm5e', 'automatedRage', {
    name: game.i18n.localize('WOD5E.Settings.AutomateRage'),
    hint: game.i18n.localize('WOD5E.Settings.AutomateRageHint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  })

  /*
    Storyteller Settings
  */

  // Register the storyteller menu
  game.settings.registerMenu('vtm5e', 'storytellerMenu', {
    name: game.i18n.localize('WOD5E.Settings.StorytellerMenu'),
    hint: game.i18n.localize('WOD5E.Settings.StorytellerMenuHint'),
    label: game.i18n.localize('WOD5E.Settings.StorytellerMenu'),
    icon: 'fas fa-bars',
    type: StorytellerMenu,
    restricted: true
  })

  // Register the modified attributes
  game.settings.register('vtm5e', 'modifiedAttributes', {
    name: game.i18n.localize('WOD5E.Settings.ModifiedAttributes'),
    hint: game.i18n.localize('WOD5E.Settings.ModifiedAttributesHint'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async () => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Re-init labels
      WOD5E.Attributes.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // Register the custom attributes
  game.settings.register('vtm5e', 'customAttributes', {
    name: game.i18n.localize('WOD5E.Settings.CustomAttributes'),
    hint: game.i18n.localize('WOD5E.Settings.CustomAttributes'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async (customAttributes) => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Grab the custom attributes and send them to the function to update the list
      WOD5E.Attributes.addCustom(customAttributes)

      // Re-init labels
      WOD5E.Attributes.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // Register the modified skills
  game.settings.register('vtm5e', 'modifiedSkills', {
    name: game.i18n.localize('WOD5E.Settings.ModifiedSkills'),
    hint: game.i18n.localize('WOD5E.Settings.ModifiedSkillsHint'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async () => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Re-init labels
      WOD5E.Skills.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // Register the custom attributes
  game.settings.register('vtm5e', 'customSkills', {
    name: game.i18n.localize('WOD5E.Settings.CustomSkills'),
    hint: game.i18n.localize('WOD5E.Settings.CustomSkillsHint'),
    scope: 'world',
    config: false,
    default: [],
    type: Array,
    onChange: async (customSkills) => {
      // Re-render the storyteller menu window once settings are updated
      _rerenderStorytellerWindow()

      // Grab the custom skills and send them to the function to update the list
      WOD5E.Skills.addCustom(customSkills)

      // Re-init labels
      WOD5E.Skills.initializeLabels()

      // Reload actorsheets
      resetActors()
    }
  })

  // World Version, only really needed by developers
  game.settings.register('vtm5e', 'worldVersion', {
    name: game.i18n.localize('WOD5E.Settings.WorldVersion'),
    hint: game.i18n.localize('WOD5E.Settings.WorldVersionHint'),
    scope: 'world',
    config: true,
    default: '1.5',
    type: String
  })
}

function _rerenderStorytellerWindow () {
  const storytellerWindow = Object.values(ui.windows).filter(w => (w.id === 'wod5e-storyteller'))[0]

  if (storytellerWindow) {
    storytellerWindow.render()
  }
}

/**
 * Set the global CSS theme according to the user's preferred color scheme settings.
 * Custom written to allow for usage of extra themes
 */
export const _updatePreferredColorScheme = async function () {
  let theme
  const clientSetting = game.settings.get('vtm5e', 'colorScheme')

  // Determine which theme we're using - if it's not set by the client, we base the theme
  // off of the browser's prefers-color-scheme
  if (clientSetting) theme = `${clientSetting}-theme`
  else if (matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark-theme'
  else if (matchMedia('(prefers-color-scheme: light)').matches) theme = 'theme-light'

  // Remove existing theme classes
  document.body.classList.remove('theme-light', 'dark-theme', 'vampire-theme', 'hunter-theme', 'werewolf-theme')

  // Append the theme class to the document body
  if (theme) document.body.classList.add(theme)
}

/**
 * Set whether the system uses the vampireRevised font for headers or not
 */
export const _updateHeaderFontPreference = async function () {
  const clientSetting = game.settings.get('vtm5e', 'disableVampireFont')

  if (clientSetting) {
    // Remove the class from the document body
    document.body.classList.remove('vampire-font-headers')
  } else {
    // Append the class to the document body
    document.body.classList.add('vampire-font-headers')
  }
}
