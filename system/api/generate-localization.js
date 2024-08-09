/* global game WOD5E */

/**
 * Function to handle localization of keys
 * @param string
 * @param type
 */
export const generateLocalizedLabel = (string, type) => {
  if (type === 'actortypes' || type === 'actortype') { // Actor Types
    const actortypes = WOD5E.ActorTypes.getList()
    return findLabel(actortypes, string)
  } else if (type === 'abilities' || type === 'attribute') { // Attributes
    const attributes = WOD5E.Attributes.getList({})
    return findLabel(attributes, string)
  } else if (type === 'skills' || type === 'skill') { // Skills
    const skills = WOD5E.Skills.getList({})
    return findLabel(skills, string)
  } else if (type === 'features' || type === 'feature') { // Features
    const features = WOD5E.Features.getList()
    return findLabel(features, string)
  } else if (type === 'disciplines' || type === 'discipline' || type === 'power') { // Disciplines
    const disciplines = WOD5E.Disciplines.getList()
    return findLabel(disciplines, string)
  } else if (type === 'gifts' || type === 'gift') { // Gifts
    const gifts = WOD5E.Gifts.getList()
    return findLabel(gifts, string)
  } else if (type === 'renown') { // Renown
    const renown = WOD5E.Renown.getList()
    return findLabel(renown, string)
  } else if (type === 'edges' || type === 'edge' || type === 'perk' || type === 'edgepool') { // Edges
    const edges = WOD5E.Edges.getList()
    return findLabel(edges, string)
  } else { // Return the base localization if nothing else is found
    const otherLocalizationString = string.capitalize()
    return game.i18n.localize(`WOD5E.${otherLocalizationString}`)
  }

  // Function to actually grab the localized label
  function findLabel (list, str) {
    const stringObject = list[str]

    // Return the localized string if found
    if (stringObject?.displayName) return stringObject.displayName
    if (stringObject?.label) return stringObject.label

    // Return nothing
    return ''
  }
}
