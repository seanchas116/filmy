import { ViewportEvent } from "./viewport-event";

export interface DragHandler {
  move(event: ViewportEvent): void;
  end(event: ViewportEvent): void;
}
