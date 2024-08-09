/* global game, Hooks, ActorDirectory, fromUuidSync */

/* Various Support for group sheets injected as the actor sidebar rerenders */
export const RenderActorSidebar = async () => {
  Hooks.on('renderSidebarTab', async (object, html) => {
    // Altering the ActorDirectory in order to support group sheet layouts
    if (object instanceof ActorDirectory) {
      // Define the list of groups we're going to be modifying
      const groups = object.groups

      // Define the directory list so that we can modify its structure
      const directoryList = html.find('.directory-list')

      // Iterate through each group and make a "folder-like" element out of them
      groups.forEach(group => {
        const groupElement = $(`[data-entry-id='${group.id}'`)
        const groupMembers = group.system?.members

        // Header element for the "folder"
        const headerElement = `<header class='group-header ${group.system.groupType} flexrow'>
          <h3 class='noborder'>
            <i class='fas fa-folder-open fa-fw'></i>
            ${group.name}
          </h3>
          <a class='create-button open-sheet' data-uuid='Actor.${group.id}' title='` + game.i18n.localize('WOD5E.OpenSheet') + `'>
            <i class="fas fa-user"></i>
          </a>
        </header>`
        const subdirectoryElement = '<ol class="subdirectory"></ol>'

        // Append the above elements to the group element and turn it into a folder
        groupElement.attr('data-uuid', `Actor.${group.id}`)
        groupElement.attr('class', 'directory-item group-item flexcol document')
        // GMs follow the collapsed value, players don't
        if (group.system?.collapsed && game.user.isGM) {
          groupElement.addClass('collapsed')
        }
        groupElement.find('.entry-name, .thumbnail').remove()
        groupElement.append(headerElement)
        groupElement.append(subdirectoryElement)

        // Add an event listener for toggling the group collapse
        groupElement.find('.group-header').click(async event => {
          event.preventDefault()

          const collapsed = !group.system.collapsed

          groupElement.toggleClass('collapsed')

          // Players don't have to update the system.collapsed value
          if (game.user.isGM) {
            group.update({ 'system.collapsed': collapsed })
          }
        })

        // Add an event listener for opening the group sheet
        groupElement.find('.open-sheet').click(async event => {
          event.preventDefault()
          event.stopPropagation()

          game.actors.get(group.id).sheet.render(true)
        })

        // Move each group member's element to be a child of this group
        // Additionally, we need to give the actor Limited
        if (groupMembers) {
          groupMembers.forEach(actorUuid => {
            const actorObject = fromUuidSync(actorUuid)

            // Check to verify the actor exists
            if (actorObject) {
              const actorElement = $(`[data-entry-id='${actorObject.id}'`)
              const groupListElement = $(`[data-entry-id='${group.id}'`).find('.subdirectory')[0]

              actorElement.appendTo(groupListElement)
            } else {
              // If the actor doesn't exist, remove it from the group
              // Filter out the UUID from the members list
              const membersList = groupMembers.filter(actor => actor !== actorUuid)

              // Update the group sheet with the new members list
              group.update({ 'system.members': membersList })
            }
          })
        }

        // If Ownership Viewer is enabled, adjust the group sheet's ownership viewer because otherwise it gets wonky by default
        const ownershipViewer = groupElement.children('.ownership-viewer')
        groupElement.find('header.group-header').append(ownershipViewer)

        // Add to the directory list
        groupElement.prependTo(directoryList)
      })
    }
  })

  // Handle actor updates
  Hooks.on('updateActor', (actor) => {
    if (actor.type === 'group') {
      // Re-render the actors directory
      game.actors.render()
    }

    // Only do this if the actor has an associated group with them
    if (actor.system?.group) {
      // Update the group sheet
      game.actors.get(actor.system.group).sheet.render()
    }
  })
}
