/* global Item, Hooks, WOD5E */

/**
 * Extend the base ItemSheet document and put all our base functionality here
 * @extends {Item}
 */
export class ItemInfo extends Item {
  prepareData () {
    super.prepareData()
  }
}

// Handle setting default item data
Hooks.on('preCreateItem', (document, data) => {
  const alterations = {}

  // Get default item image based on the item type
  if (!data.img) {
    const itemsList = WOD5E.ItemTypes.getList()
    const itemImg = itemsList[data.type]?.img || 'systems/vtm5e/assets/icons/items/item-default.svg'

    // Set the img value to the icon we get back
    alterations.img = itemImg
  }

  // Update the source document
  document.updateSource(alterations)
})
