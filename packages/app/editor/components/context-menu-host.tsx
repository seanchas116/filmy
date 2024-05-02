import { useEffect, useState } from "react";
import { ContextMenuRequest, contextMenuState } from "./context-menu-state";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MenuChildren, MenuContent } from "./menu";

export function ContextMenuHost() {
  const [request, setRequest] = useState<ContextMenuRequest>({
    clientX: 0,
    clientY: 0,
    templates: [],
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return contextMenuState.onShow((request) => {
      setRequest(request);
      setOpen(true);
    });
  }, []);

  return (
    <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <DropdownMenu.Trigger
        style={{
          position: "fixed",
          left: request.clientX + "px",
          top: request.clientY + "px",
          pointerEvents: "none",
        }}
      ></DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <MenuContent components={DropdownMenu} align="start">
          <MenuChildren
            components={DropdownMenu}
            templates={request.templates}
          />
        </MenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
