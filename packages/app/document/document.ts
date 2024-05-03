import { Store } from "@/utils/store/store";
import { NodeData, SequenceData, TrackData, TrackItemData } from "./schema";
import { NodeManager } from "./node";
import { InstanceManager } from "./instance-manager";
import { Track } from "./track";
import { TrackItem } from "./track-item";
import { nanoid } from "nanoid";
import { Sequence } from "./sequence";
import { Parenting } from "@/utils/store/parenting";
import { makeObservable } from "mobx";
import { UndoManager } from "@/utils/store/undo-manager";
import { Selection } from "./selection";

export class Document {
  constructor() {
    this.trackStore = new Store<string, TrackData>();
    this.sequenceStore = new Store<string, SequenceData>();
    this.trackItemStore = new Store<string, TrackItemData>();
    this.nodeStore = new Store<string, NodeData>();
    this.selectedNodeIDStore = new Store<string, true>();
    this.currentSceneStore = new Store<"value", string>();

    this.undoManager = new UndoManager([
      this.trackStore,
      this.sequenceStore,
      this.trackItemStore,
      this.nodeStore,
      this.selectedNodeIDStore,
      this.currentSceneStore,
    ]);

    this.nodes = new NodeManager(this);
    this.tracks = new InstanceManager(
      this.trackStore,
      (id) => new Track(this, id)
    );
    this.trackItems = new InstanceManager(
      this.trackItemStore,
      (id) => new TrackItem(this, id)
    );
    this.trackParenting = new Parenting(
      this.trackStore,
      (data) => data.sequence,
      (data) => data.order
    );
    this.trackItemParenting = new Parenting(
      this.trackItemStore,
      (data) => data.track,
      (data) => data.start
    );
    this.trackItemFromNode = new Parenting(
      this.trackItemStore,
      (data) => data.node,
      () => 0
    );
    this.sequences = new InstanceManager(
      this.sequenceStore,
      (id) => new Sequence(this, id)
    );

    this.selection = new Selection(this);

    const videoWidth = 640;
    const videoHeight = 480;

    const sequence = this.sequences.add(nanoid(), {
      name: "Sequence 1",
      order: 0,
      w: videoWidth,
      h: videoHeight,
    });
    this.currentSequence = this.sequences.get(sequence.id);

    const track1 = this.tracks.add(nanoid(), {
      order: 0,
      sequence: sequence.id,
      name: "Track 1",
    });
    const track2 = this.tracks.add(nanoid(), {
      order: 1,
      sequence: sequence.id,
      name: "Track 2",
    });

    const frameNode = this.nodes.add(nanoid(), {
      order: 0,
      type: "group",
      x: 0,
      y: 0,
      w: 0,
      h: 0,
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
      w: videoWidth,
      h: videoHeight,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    });

    this.trackItems.add(nanoid(), {
      track: track1.id,
      start: 1000,
      trim: 0,
      duration: 1000,
      node: frameNode.id,
    });

    this.trackItems.add(nanoid(), {
      track: track2.id,
      start: 0,
      trim: 4 * 60 * 1000,
      duration: 10000,
      node: videoNode.id,
    });

    makeObservable(this);

    this.undoManager.clear();
  }

  readonly undoManager: UndoManager;

  readonly sequenceStore: Store<string, SequenceData>;
  readonly trackStore: Store<string, TrackData>;
  readonly trackItemStore: Store<string, TrackItemData>;
  readonly nodeStore: Store<string, NodeData>;
  readonly selectedNodeIDStore: Store<string, true>;
  readonly currentSceneStore: Store<"value", string>;

  readonly sequences: InstanceManager<SequenceData, Sequence>;
  readonly tracks: InstanceManager<TrackData, Track>;
  readonly trackItems: InstanceManager<TrackItemData, TrackItem>;
  readonly trackParenting: Parenting<TrackData>;
  readonly trackItemParenting: Parenting<TrackItemData>;
  readonly trackItemFromNode: Parenting<TrackItemData>;
  readonly nodes: NodeManager;

  readonly currentSequence: Sequence;

  readonly selection: Selection;
}
