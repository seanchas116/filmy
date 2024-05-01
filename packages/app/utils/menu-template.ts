import { KeyGesture } from "./key-gesture";

export interface MenuItemTemplate {
  type: "item";
  text: React.ReactNode;
  shortcuts?: KeyGesture[];
  disabled?: boolean;
  checked?: boolean;
  radioChecked?: boolean;
  onClick?: () => void | false;
}

export interface MenuCheckBoxTemplate {
  type: "checkbox";
  text: string;
  shortcuts?: KeyGesture[];
  disabled?: boolean;
  checked: boolean | "indeterminate";
  onChange?: (checked: boolean | "indeterminate") => void;
}

export interface MenuRadioGroupTemplate {
  type: "radiogroup";
  value: string;
  onChange?: (value: string) => void;
  items: {
    value: string;
    text: string;
    shortcuts?: KeyGesture[];
  }[];
}

export interface MenuSubTemplate {
  type: "sub";
  text: string;
  children: MenuTemplate[];
}

export interface MenuLabelTemplate {
  type: "label";
  text: string;
}

export interface MenuSeparatorTemplate {
  type: "separator";
}

export type MenuTemplate =
  | MenuItemTemplate
  | MenuCheckBoxTemplate
  | MenuRadioGroupTemplate
  | MenuSubTemplate
  | MenuLabelTemplate
  | MenuSeparatorTemplate;

export function handleShortcut(
  templates: MenuTemplate[],
  event: KeyboardEvent
): boolean {
  for (const template of templates) {
    if (template.type === "item") {
      for (const shortcut of template.shortcuts ?? []) {
        if (shortcut.matches(event)) {
          const result = template.onClick?.();
          if (result === false) {
            continue;
          }
          return true;
        }
      }
    } else if (template.type === "sub") {
      if (handleShortcut(template.children, event)) {
        return true;
      }
    }
  }
  return false;
}
