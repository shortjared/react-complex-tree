import { HTMLProps } from 'react';
import {
  InteractionMode,
  InteractionManager,
  TreeEnvironmentContextProps,
  TreeItem,
  TreeItemActions,
  TreeItemRenderFlags,
} from '../types';
import { isControlKey } from '../isControlKey';

export class ClickItemToExpandInteractionManager implements InteractionManager {
  public readonly mode = InteractionMode.ClickItemToExpand;

  private environment: TreeEnvironmentContextProps;

  constructor(environment: TreeEnvironmentContextProps) {
    this.environment = environment;
  }

  createInteractiveElementProps(
    item: TreeItem,
    treeId: string,
    actions: TreeItemActions,
    renderFlags: TreeItemRenderFlags
  ): HTMLProps<HTMLElement> {
    return {
      onClick: e => {
        actions.focusItem();
        if (e.shiftKey) {
          actions.selectUpTo();
        } else if (isControlKey(e)) {
          if (renderFlags.isSelected) {
            actions.unselectItem();
          } else {
            actions.addToSelectedItems();
          }
        } else {
          if (item.hasChildren) {
            actions.toggleExpandedState();
          }
          actions.selectItem();

          if (
            !item.hasChildren ||
            this.environment.canInvokePrimaryActionOnItemContainer
          ) {
            actions.primaryAction();
          }
        }
      },
      onFocus: () => {
        actions.focusItem();
      },
      onDragStart: e => {
        e.dataTransfer.dropEffect = 'move'; // TODO
        // e.dataTransfer.setDragImage(environment.renderDraggingItem(viewState.selectedItems), 0, 0);
        actions.startDragging();
      },
      onDragOver: e => {
        e.preventDefault(); // Allow drop
      },
      draggable: renderFlags.canDrag && !renderFlags.isRenaming,
      tabIndex: !renderFlags.isRenaming
        ? renderFlags.isFocused
          ? 0
          : -1
        : undefined,
    };
  }
}
