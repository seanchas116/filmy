import { EventEmitter } from "@/utils/event-emitter";
import { MenuTemplate } from "@/utils/menu-template";

export interface ContextMenuRequest {
  clientX: number;
  clientY: number;
  templates: readonly MenuTemplate[];
}

class ContextMenuState {
  private _onShow = new EventEmitter<ContextMenuRequest>();

  get onShow() {
    return this._onShow.event;
  }

  show(
    position: {
      clientX: number;
      clientY: number;
    },
    templates: readonly MenuTemplate[]
  ) {
    this._onShow.emit({
      ...position,
      templates,
    });
  }
}

export const contextMenuState = new ContextMenuState();

export function showContextMenu(
  position: {
    clientX: number;
    clientY: number;
  },
  templates: readonly MenuTemplate[]
) {
  contextMenuState.show(position, templates);
}
