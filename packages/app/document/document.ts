import { Store } from "@/utils/store/store";
import { NodeData, TimelineData, TimelineItemData } from "./schema";
import { NodeManager } from "./node";
import { InstanceManager } from "./instance-manager";
import { Timeline } from "./timeline";
import { TimelineItem } from "./timeline-item";
import { nanoid } from "nanoid";

export class Document {
  constructor() {
    this.timelineStore = new Store<TimelineData>();
    this.timelineItemStore = new Store<TimelineItemData>();
    this.nodeStore = new Store<NodeData>();

    this.nodes = new NodeManager(this.nodeStore);
    this.timelines = new InstanceManager(
      this.timelineStore,
      (id) => new Timeline(this, id)
    );
    this.timelineItems = new InstanceManager(
      this.timelineItemStore,
      (id) => new TimelineItem(this, id)
    );

    const node = this.nodes.add(nanoid(), {
      parent: "timelineItem0",
      order: 0,
      detail: {
        type: "shape",
        shape: { type: "rectangle", x: 0, y: 0, w: 100, h: 100 },
        fill: {
          type: "solid",
          color: { r: 255, g: 0, b: 0, a: 1 },
        },
        stroke: {
          width: 1,
          fill: {
            type: "solid",
            color: { r: 0, g: 0, b: 0, a: 1 },
          },
        },
      },
    });

    this.currentTimeline = this.timelines.add(nanoid(), {
      order: 0,
    });
    this.currentTimelineItem = this.timelineItems.add(nanoid(), {
      timeline: this.currentTimeline.id,
      start: 0,
      duration: 1000,
      node: node.id,
    });
  }

  readonly timelineStore: Store<TimelineData>;
  readonly timelineItemStore: Store<TimelineItemData>;
  readonly nodeStore: Store<NodeData>;

  readonly timelines: InstanceManager<TimelineData, Timeline>;
  readonly timelineItems: InstanceManager<TimelineItemData, TimelineItem>;
  readonly nodes: NodeManager;

  readonly currentTimeline: Timeline;
  readonly currentTimelineItem: TimelineItem;
}
