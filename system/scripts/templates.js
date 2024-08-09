/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log('Schrecknet : loading subroutines')

  // Define template paths to load
  const templatePaths = [
    // Base Sheet Partials
    'systems/vtm5e/display/shared/actors/parts/lock-button.hbs',
    'systems/vtm5e/display/shared/actors/parts/header-profile.hbs',
    'systems/vtm5e/display/shared/actors/parts/biography.hbs',
    'systems/vtm5e/display/shared/actors/parts/exp.hbs',
    'systems/vtm5e/display/shared/actors/parts/features.hbs',
    'systems/vtm5e/display/shared/actors/parts/health.hbs',
    'systems/vtm5e/display/shared/actors/parts/other.hbs',
    'systems/vtm5e/display/shared/actors/parts/stats.hbs',
    'systems/vtm5e/display/shared/actors/parts/willpower.hbs',
    'systems/vtm5e/display/shared/actors/parts/notes.hbs',
    'systems/vtm5e/display/shared/actors/parts/skill-dialog.hbs',
    'systems/vtm5e/display/shared/actors/parts/specialty-display.hbs',
    'systems/vtm5e/display/shared/actors/parts/navbar.hbs',
    'systems/vtm5e/display/shared/actors/parts/actor-settings.hbs',

    // Hunter Sheet Partials
    'systems/vtm5e/display/htr/actors/parts/danger.hbs',
    'systems/vtm5e/display/htr/actors/parts/despair.hbs',
    'systems/vtm5e/display/htr/actors/parts/desperation.hbs',
    'systems/vtm5e/display/htr/actors/parts/edges.hbs',

    // Vampire Sheet Partials
    'systems/vtm5e/display/vtm/actors/parts/disciplines.hbs',
    'systems/vtm5e/display/vtm/actors/parts/blood.hbs',
    'systems/vtm5e/display/vtm/actors/parts/frenzy.hbs',
    'systems/vtm5e/display/vtm/actors/parts/humanity.hbs',
    'systems/vtm5e/display/vtm/actors/parts/hunger.hbs',
    'systems/vtm5e/display/vtm/actors/parts/rouse.hbs',

    // Werewolf Sheet Partials
    'systems/vtm5e/display/wta/actors/parts/gifts-rites.hbs',
    'systems/vtm5e/display/wta/actors/parts/wolf.hbs',
    'systems/vtm5e/display/wta/actors/parts/balance.hbs',
    'systems/vtm5e/display/wta/actors/parts/frenzy.hbs',
    'systems/vtm5e/display/wta/actors/parts/rage-button.hbs',
    'systems/vtm5e/display/wta/actors/parts/rage-value.hbs',
    'systems/vtm5e/display/wta/actors/parts/renown.hbs',
    'systems/vtm5e/display/wta/actors/parts/forms.hbs',

    // SPC Sheet Partials
    'systems/vtm5e/display/shared/actors/parts/spc/stats.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/standard-dice-pools.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/exceptional-dice-pools.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/generaldifficulty.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/spc-disciplines.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/spc-gifts.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/spc-edges.hbs',
    'systems/vtm5e/display/shared/actors/parts/spc/type-selector.hbs',

    // Group Sheet Partials
    'systems/vtm5e/display/shared/actors/parts/group/type-selector.hbs',
    'systems/vtm5e/display/shared/actors/parts/group/group-members.hbs',
    'systems/vtm5e/display/shared/actors/parts/group/description.hbs',

    // Item Sheet Partials
    'systems/vtm5e/display/shared/items/parts/skills.hbs',
    'systems/vtm5e/display/shared/items/parts/disciplines.hbs',
    'systems/vtm5e/display/shared/items/parts/edges.hbs',
    'systems/vtm5e/display/shared/items/parts/attributes.hbs',
    'systems/vtm5e/display/shared/items/parts/gifts.hbs',
    'systems/vtm5e/display/shared/items/parts/renown.hbs',
    'systems/vtm5e/display/shared/items/parts/bonuses.hbs',
    'systems/vtm5e/display/shared/items/parts/bonus-display.hbs',
    'systems/vtm5e/display/shared/items/parts/macro.hbs',

    // Dice Tray Partials
    // 'systems/vtm5e/display/ui/parts/select-character.hbs',
    // 'systems/vtm5e/display/ui/parts/pool1-select-attribute.hbs',
    // 'systems/vtm5e/display/ui/parts/pool1-select-skill.hbs',
    // 'systems/vtm5e/display/ui/parts/pool1-select-discipline.hbs',
    // 'systems/vtm5e/display/ui/parts/pool2-select-attribute.hbs',
    // 'systems/vtm5e/display/ui/parts/pool2-select-skill.hbs',
    // 'systems/vtm5e/display/ui/parts/pool2-select-discipline.hbs',
    // 'systems/vtm5e/display/ui/parts/pool2-nothing.hbs',

    // Roll dialog Partials
    'systems/vtm5e/display/ui/parts/roll-dialog-base.hbs',
    'systems/vtm5e/display/ui/parts/situational-modifiers.hbs',
    'systems/vtm5e/display/ui/mortal-roll-dialog.hbs',
    'systems/vtm5e/display/ui/vampire-roll-dialog.hbs',
    'systems/vtm5e/display/ui/werewolf-roll-dialog.hbs',
    'systems/vtm5e/display/ui/hunter-roll-dialog.hbs',

    // Chat Message Partials
    'systems/vtm5e/display/ui/chat/roll-message.hbs',
    'systems/vtm5e/display/ui/chat/willpower-damage.hbs',
    'systems/vtm5e/display/ui/chat/willpower-reroll.hbs',

    // Menu Partials
    'systems/vtm5e/display/ui/automation-menu.hbs',
    'systems/vtm5e/display/ui/storyteller-menu.hbs',
    'systems/vtm5e/display/ui/parts/storyteller-menu/modification-menu.hbs',
    'systems/vtm5e/display/ui/parts/storyteller-menu/custom-menu.hbs',
    'systems/vtm5e/display/ui/select-dialog.hbs'
  ]

  /* Load the template parts
  */
  return loadTemplates(templatePaths) // eslint-disable-line no-undef
}
