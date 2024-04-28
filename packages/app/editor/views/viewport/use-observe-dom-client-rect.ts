import { useEffect } from "react";
import { action } from "mobx";
import { Rect } from "paintvec";
import { useEditorState } from "../use-editor-state";

export function useObserveDOMClientRect(ref: React.RefObject<HTMLElement>) {
  const editorState = useEditorState();

  useEffect(() => {
    const elem = ref.current;
    if (!elem) {
      return;
    }

    const updateViewportClientRect = action(() => {
      editorState.scroll.domClientRect = Rect.from(
        elem.getBoundingClientRect()
      );
    });

    updateViewportClientRect();

    const resizeObserver = new ResizeObserver(updateViewportClientRect);
    resizeObserver.observe(elem);

    window.addEventListener("scroll", updateViewportClientRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateViewportClientRect);
    };
  }, [editorState.scroll, ref]);
}
