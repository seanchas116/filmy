import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Icon } from "@iconify/react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { PopoverArrowContent } from "./popover";
import {
  MenuItemTemplate,
  MenuSubTemplate,
  MenuTemplate,
} from "@/utils/menu-template";

const shortcutClassNames = `
  text-gray-400 text-xs ml-auto pl-4
   [[data-highlighted]>&]:text-white
`;

export const menuContentClassNames = `
text-gray-900 text-xs
bg-white z-10 border border-gray-200 rounded-lg shadow-xl overflow-hidden p-1 outline-0
flex flex-col
`;

export const menuItemClassNames = `
h-7 outline-0 rounded pr-4 pl-5 flex items-center
aria-disabled:text-gray-500
data-[highlighted]:bg-blue-500 data-[highlighted]:text-white
data-[state=open]:bg-blue-500 data-[state=open]:text-white
`;

export const menuLabelClassNames = "text-gray-400 text-2xs pr-4 pl-5 leading-6";

export const menuSeparatorClassNames = "my-1 mx-1 bg-gray-200 h-px";

export type MenuComponents = typeof DropdownMenu | typeof ContextMenu;

export const MenuSubmenu: React.FC<{
  components: MenuComponents;
  template: MenuSubTemplate;
}> = ({ components, template }) => {
  return (
    <components.Sub>
      <components.SubTrigger className={menuItemClassNames}>
        {template.text}
        <div className="ml-auto pl-4">
          <Icon icon="material-symbols:chevron-right" />
        </div>
      </components.SubTrigger>
      <components.Portal>
        <components.SubContent
          className={menuContentClassNames}
          sideOffset={4}
          alignOffset={-4}
        >
          {template.children.map((child, i) => (
            <MenuChild key={i} components={components} template={child} />
          ))}
        </components.SubContent>
      </components.Portal>
    </components.Sub>
  );
};

export const MenuItem: React.FC<{
  components: MenuComponents;
  template: MenuItemTemplate;
}> = ({ components, template }) => {
  return (
    <components.Item
      className={menuItemClassNames}
      disabled={template.disabled}
      onClick={template.onClick?.bind(template)}
    >
      {template.checked && (
        <div className="absolute left-2">
          <Icon icon="material-symbols:check" className="text-xs" />
        </div>
      )}
      {template.radioChecked && (
        <div className="absolute left-2">
          <svg
            className="text-base"
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
          >
            <circle cx={8} cy={8} r={2} fill="currentColor" />
          </svg>
        </div>
      )}
      {template.text}
      {!!template.shortcuts?.length && (
        <span className={shortcutClassNames}>
          {template.shortcuts[0].toText()}
        </span>
      )}
    </components.Item>
  );
};

export const MenuChild: React.FC<{
  components: MenuComponents;
  template: MenuTemplate;
}> = ({ components, template }) => {
  switch (template.type) {
    case "item":
      return <MenuItem components={components} template={template} />;
    case "sub":
      return <MenuSubmenu components={components} template={template} />;
    case "label":
      return (
        <components.Label className={menuLabelClassNames}>
          {template.text}
        </components.Label>
      );
    case "separator":
      return <components.Separator className={menuSeparatorClassNames} />;
    default:
      return null;
  }
};

export const MenuChildren: React.FC<{
  components: MenuComponents;
  templates: readonly MenuTemplate[];
}> = ({ components, templates }) => {
  return (
    <>
      {templates.map((child, i) => (
        <MenuChild key={i} components={components} template={child} />
      ))}
    </>
  );
};

export const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenu.Content> & {
    components: MenuComponents;
  }
>(({ components, children, ...props }, ref) => {
  return (
    <components.Content
      {...props}
      className={twMerge(props.className, menuContentClassNames)}
      ref={ref}
    >
      {children}
    </components.Content>
  );
});
MenuContent.displayName = "MenuContent";

export const DropdownMenuArrow = () => {
  return (
    <DropdownMenu.Arrow asChild>
      <PopoverArrowContent />
    </DropdownMenu.Arrow>
  );
};
