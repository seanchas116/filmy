import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";
import {
  MenuContent,
  MenuChildren,
  DropdownMenuArrow,
} from "@/editor/components/menu";
import { useEditorState } from "../use-editor-state";
import { Commands } from "@/editor/commands/commands";

export const MainMenu: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const editorState = useEditorState();
  const commands = Commands.get(editorState);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <MenuContent components={DropdownMenu} align="start">
          <MenuChildren
            components={DropdownMenu}
            templates={commands.mainMenus}
          />
          <DropdownMenuArrow />
        </MenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
