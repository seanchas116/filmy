import { Store } from "@/utils/store/store";
import {
  NodeData,
  SequenceData,
  TimelineData,
  TimelineItemData,
} from "./schema";
import { Node, NodeManager } from "./node";
import { InstanceManager } from "./instance-manager";
import { Timeline } from "./timeline";
import { TimelineItem } from "./timeline-item";
import { nanoid } from "nanoid";
import { Sequence } from "./sequence";
import { Parenting } from "@/utils/store/parenting";
import { computed, makeObservable, observable } from "mobx";
import { compact } from "lodash-es";

export class Document {
  constructor() {
    this.timelineStore = new Store<TimelineData>();
    this.sequenceStore = new Store<SequenceData>();
    this.timelineItemStore = new Store<TimelineItemData>();
    this.nodeStore = new Store<NodeData>();

    this.nodes = new NodeManager(this);
    this.timelines = new InstanceManager(
      this.timelineStore,
      (id) => new Timeline(this, id)
    );
    this.timelineItems = new InstanceManager(
      this.timelineItemStore,
      (id) => new TimelineItem(this, id)
    );
    this.timelineParenting = new Parenting(
      this.timelineStore,
      (data) => data.sequence,
      (data) => data.order
    );
    this.timelineItemParenting = new Parenting(
      this.timelineItemStore,
      (data) => data.timeline,
      (data) => data.start
    );
    this.sequences = new InstanceManager(
      this.sequenceStore,
      (id) => new Sequence(this, id)
    );

    const sequence = this.sequences.add(nanoid(), {
      name: "Sequence 1",
      order: 0,
    });

    const pageNode = (this.currentPage = this.nodes.add(nanoid(), {
      order: 0,
      type: "page",
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    }));

    const frameNode = this.nodes.add(nanoid(), {
      parent: pageNode.id,
      order: 0,
      type: "frame",
      x: 0,
      y: 0,
      w: 640,
      h: 480,
      fill: {
        type: "solid",
        hex: "#ffffff",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const rectNode = this.nodes.add(nanoid(), {
      parent: frameNode.id,
      order: 0,
      type: "rectangle",
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      fill: {
        type: "solid",
        hex: "#ff0000",
      },
      stroke: {
        width: 1,
        fill: {
          type: "solid",
          hex: "#000000",
        },
      },
    });

    const timeline1 = this.timelines.add(nanoid(), {
      order: 0,
      sequence: sequence.id,
      name: "Timeline 1",
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const timeline2 = this.timelines.add(nanoid(), {
      order: 1,
      sequence: sequence.id,
      name: "Timeline 2",
    });

    const timelineItem = this.timelineItems.add(nanoid(), {
      timeline: timeline1.id,
      start: 0,
      duration: 1000,
      node: frameNode.id,
    });

    this.selectedTimelineItemIDs.add(timelineItem.id);

    makeObservable(this);
  }

  readonly sequenceStore: Store<SequenceData>;
  readonly timelineStore: Store<TimelineData>;
  readonly timelineItemStore: Store<TimelineItemData>;
  readonly nodeStore: Store<NodeData>;

  readonly sequences: InstanceManager<SequenceData, Sequence>;
  readonly timelines: InstanceManager<TimelineData, Timeline>;
  readonly timelineItems: InstanceManager<TimelineItemData, TimelineItem>;
  readonly timelineParenting: Parenting<TimelineData>;
  readonly timelineItemParenting: Parenting<TimelineItemData>;
  readonly nodes: NodeManager;

  readonly currentPage: Node;

  readonly selectedNodeIDs = observable.set<string>();
  readonly selectedTimelineItemIDs = observable.set<string>();

  deselectAllNodes(): void {
    this.selectedNodeIDs.clear();
  }

  @computed get selectedNodes(): Node[] {
    return compact(
      [...this.selectedNodeIDs].map((id) => this.nodes.safeGet(id))
    );
  }

  @computed get selectedTimelineItems(): TimelineItem[] {
    return compact(
      [...this.selectedTimelineItemIDs].map((id) =>
        this.timelineItems.safeGet(id)
      )
    );
  }
}
