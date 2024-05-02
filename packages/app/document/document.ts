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
import { computed, makeObservable } from "mobx";
import { compact } from "lodash-es";
import { UndoManager } from "@/utils/store/undo-manager";

export class Document {
  constructor() {
    this.timelineStore = new Store<TimelineData>();
    this.sequenceStore = new Store<SequenceData>();
    this.timelineItemStore = new Store<TimelineItemData>();
    this.nodeStore = new Store<NodeData>();
    this.selectedNodeIDStore = new Store<true>();

    this.undoManager = new UndoManager([
      this.timelineStore,
      this.sequenceStore,
      this.timelineItemStore,
      this.nodeStore,
      this.selectedNodeIDStore,
    ]);

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

    this.selection = new Selection(this);

    const sequence = this.sequences.add(nanoid(), {
      name: "Sequence 1",
      order: 0,
    });
    this.currentSequence = this.sequences.get(sequence.id);

    const timeline1 = this.timelines.add(nanoid(), {
      order: 0,
      sequence: sequence.id,
      name: "Timeline 1",
    });
    const timeline2 = this.timelines.add(nanoid(), {
      order: 1,
      sequence: sequence.id,
      name: "Timeline 2",
    });

    const frameNode = this.nodes.add(nanoid(), {
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

    const videoNode = this.nodes.add(nanoid(), {
      order: 1,
      type: "video",
      x: 0,
      y: 0,
      w: 640,
      h: 480,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      offset: 4 * 60 * 1000,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const timelineItem = this.timelineItems.add(nanoid(), {
      timeline: timeline1.id,
      start: 1000,
      duration: 1000,
      node: frameNode.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const timelineItem2 = this.timelineItems.add(nanoid(), {
      timeline: timeline2.id,
      start: 0,
      duration: 10000,
      node: videoNode.id,
    });

    makeObservable(this);

    this.undoManager.clear();
  }

  readonly undoManager: UndoManager;

  readonly sequenceStore: Store<SequenceData>;
  readonly timelineStore: Store<TimelineData>;
  readonly timelineItemStore: Store<TimelineItemData>;
  readonly nodeStore: Store<NodeData>;
  readonly selectedNodeIDStore: Store<true>;

  readonly sequences: InstanceManager<SequenceData, Sequence>;
  readonly timelines: InstanceManager<TimelineData, Timeline>;
  readonly timelineItems: InstanceManager<TimelineItemData, TimelineItem>;
  readonly timelineParenting: Parenting<TimelineData>;
  readonly timelineItemParenting: Parenting<TimelineItemData>;
  readonly nodes: NodeManager;

  readonly currentSequence: Sequence;

  readonly selection: Selection;
}

class Selection {
  constructor(document: Document) {
    this.document = document;
    this.selectedNodeIDStore = document.selectedNodeIDStore;
  }

  readonly document: Document;
  readonly selectedNodeIDStore: Store<true>;

  clear(): void {
    this.selectedNodeIDStore.data.clear();
  }

  @computed get nodes(): Node[] {
    return compact(
      [...this.selectedNodeIDStore.data.keys()].map((id) =>
        this.document.nodes.safeGet(id)
      )
    );
  }

  @computed get nodeRoots(): Set<Node> {
    return new Set(this.nodes.map((node) => node.root));
  }

  @computed get timelineItems(): TimelineItem[] {
    const selectedNodeRoots = this.nodeRoots;

    // TODO: make efficient
    const timelineItems = new Set<TimelineItem>();
    for (const timelineItem of this.document.timelineItems.instances.values()) {
      if (selectedNodeRoots.has(timelineItem.node.root)) {
        timelineItems.add(timelineItem);
      }
    }

    return [...timelineItems];
  }

  deleteSelected() {
    for (const node of this.nodes) {
      if (node.parent) {
        node.deleteRecursive();
      }
    }

    for (const timelineItem of this.timelineItems) {
      timelineItem.delete();
    }
  }

  selectAllSiblings() {
    throw new Error("Not implemented");
  }
}
