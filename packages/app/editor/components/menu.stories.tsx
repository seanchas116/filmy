import React, { useState } from "react";
import { Icon } from "@iconify/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MenuChildren, MenuContent } from "./menu";
import { MenuTemplate } from "@/utils/menu-template";
import { KeyGesture } from "@/utils/key-gesture";

export default {
  component: MenuContent,
};

export const Dropdown: React.FC = () => {
  const templates = useExampleMenuTemplates();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Icon icon="icon-park-outline:hamburger-button" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <MenuContent components={DropdownMenu}>
          <MenuChildren components={DropdownMenu} templates={templates} />
        </MenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

function useExampleMenuTemplates(): MenuTemplate[] {
  const [showsBookmarks, setShowsBookmarks] = useState(true);
  const [showsFullURL, setShowsFullURL] = useState(false);
  const [person, setPerson] = useState("pedro");

  return [
    {
      type: "item",
      text: "New Tab",
      shortcuts: [new KeyGesture(["Mod"], "KeyT")],
    },
    {
      type: "item",
      text: "New Window",
      shortcuts: [new KeyGesture(["Mod"], "KeyN")],
    },
    {
      type: "item",
      text: "New Private Window",
      shortcuts: [new KeyGesture(["Shift", "Mod"], "KeyN")],
      disabled: true,
    },
    {
      type: "sub",
      text: "More Tools",
      children: [
        {
          type: "item",
          text: "Save Page As...",
          shortcuts: [new KeyGesture(["Mod"], "KeyS")],
        },
        {
          type: "item",
          text: "Create Shortcut...",
        },
        {
          type: "item",
          text: "Name Window...",
        },
        {
          type: "separator",
        },
        {
          type: "item",
          text: "Developer Tools",
        },
      ],
    },
    {
      type: "separator",
    },
    {
      type: "item",
      text: "Show Bookmarks",
      shortcuts: [new KeyGesture(["Mod"], "KeyB")],
      checked: showsBookmarks,
      onClick: () => {
        setShowsBookmarks(!showsBookmarks);
      },
    },
    {
      type: "item",
      text: "Show Full URLs",
      checked: showsFullURL,
      onClick: () => {
        setShowsFullURL(!showsFullURL);
      },
    },
    {
      type: "separator",
    },
    {
      type: "label",
      text: "People",
    },
    {
      type: "item",
      text: "Pedro Duarte",
      radioChecked: person === "pedro",
      onClick: () => {
        setPerson("pedro");
      },
    },
    {
      type: "item",
      text: "Colm Tuite",
      radioChecked: person === "colm",
      onClick: () => {
        setPerson("colm");
      },
    },
  ];
}
