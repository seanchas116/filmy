import { Store } from "@/utils/store/store";
import {
  NodeData,
  SequenceData,
  TimelineData,
  TimelineItemData,
} from "./schema";
import { NodeManager } from "./node";
import { InstanceManager } from "./instance-manager";
import { Timeline } from "./timeline";
import { TimelineItem } from "./timeline-item";
import { nanoid } from "nanoid";
import { Sequence } from "./sequence";
import { Parenting } from "@/utils/store/parenting";

export class Document {
  constructor() {
    this.timelineStore = new Store<TimelineData>();
    this.sequenceStore = new Store<SequenceData>();
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
    this.timelineParenting = new Parenting(this.timelineStore);
    this.sequences = new InstanceManager(
      this.sequenceStore,
      (id) => new Sequence(this, id)
    );

    const sequence = this.sequences.add(nanoid(), {
      name: "Sequence 1",
      order: 0,
    });

    const rootNode = this.nodes.add(nanoid(), {
      order: 0,
    });

    this.nodes.add(nanoid(), {
      parent: rootNode.id,
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
      sequence: sequence.id,
    });
    this.currentTimelineItem = this.timelineItems.add(nanoid(), {
      timeline: this.currentTimeline.id,
      start: 0,
      duration: 1000,
      node: rootNode.id,
    });
  }

  readonly sequenceStore: Store<SequenceData>;
  readonly timelineStore: Store<TimelineData>;
  readonly timelineItemStore: Store<TimelineItemData>;
  readonly nodeStore: Store<NodeData>;

  readonly sequences: InstanceManager<SequenceData, Sequence>;
  readonly timelines: InstanceManager<TimelineData, Timeline>;
  readonly timelineItems: InstanceManager<TimelineItemData, TimelineItem>;
  readonly timelineParenting: Parenting<TimelineData>;
  readonly nodes: NodeManager;

  readonly currentTimeline: Timeline;
  readonly currentTimelineItem: TimelineItem;
}
