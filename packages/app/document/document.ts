import { Store } from "@/utils/store/store";
import {
  AnimationData,
  NodeData,
  SequenceData,
  TrackData,
  TrackItemData,
} from "./schema";
import { Node } from "./node";
import { InstanceManager } from "./instance-manager";
import { Track } from "./track";
import { TrackItem } from "./track-item";
import { nanoid } from "nanoid";
import { Sequence } from "./sequence";
import { Parenting } from "@/utils/store/parenting";
import { makeObservable } from "mobx";
import { UndoManager } from "@/utils/store/undo-manager";
import { Selection } from "./selection";
import { Animation } from "./animation";
import twColors from "tailwindcss/colors";

export class Document {
  constructor() {
    this.trackStore = new Store<string, TrackData>();
    this.sequenceStore = new Store<string, SequenceData>();
    this.trackItemStore = new Store<string, TrackItemData>();
    this.nodeStore = new Store<string, NodeData>();
    this.animationStore = new Store<string, AnimationData>();
    this.selectedNodeIDStore = new Store<string, true>();
    this.selectedAnimationIDStore = new Store<string, true>();
    this.currentSceneStore = new Store<"value", string>();

    this.undoManager = new UndoManager([
      this.trackStore,
      this.sequenceStore,
      this.trackItemStore,
      this.nodeStore,
      this.selectedNodeIDStore,
      this.selectedAnimationIDStore,
      this.currentSceneStore,
    ]);

    this.nodes = new InstanceManager(
      this.nodeStore,
      (id) => new Node(this, id)
    );
    this.animations = new InstanceManager(
      this.animationStore,
      (id) => new Animation(this, id)
    );
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
    this.nodeParenting = new Parenting(
      this.nodeStore,
      (data) => data.parent,
      (data) => data.order
    );
    this.animationParenting = new Parenting(
      this.animationStore,
      (data) => data.node,
      (data) => data.order
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

    const trackItem1 = this.trackItems.add(nanoid(), {
      track: track1.id,
      start: 1000,
      duration: 2000,
    });

    const trackItem2 = this.trackItems.add(nanoid(), {
      track: track2.id,
      start: 0,
      duration: 10000,
    });

    const trackItem1Node = this.nodes.add(trackItem1.id, {
      order: 0,
      type: "group",
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });

    const rectNode = this.nodes.add(nanoid(), {
      parent: trackItem1Node.id,
      order: 0,
      type: "rectangle",
      x: 16,
      y: 480 - 8 - 16,
      w: 100,
      h: 8,
      opacity: 50,
      fill: {
        type: "solid",
        hex: twColors.blue[500],
      },
      stroke: {
        width: 1,
        fill: {
          type: "solid",
          hex: "#000000",
        },
      },
    });
    const textNode = this.nodes.add(nanoid(), {
      parent: trackItem1Node.id,
      order: 0,
      type: "text",
      text: "Hello, world!",
      font: {
        family: "Avenir Next",
        weight: 700,
        size: 48,
      },
      x: 16,
      y: 400,
      w: 100,
      h: 32,
      opacity: 50,
      fill: {
        type: "solid",
        hex: "#ffffff",
      },
      stroke: {
        width: 1,
        fill: {
          type: "solid",
          hex: "#000000",
        },
      },
    });

    this.animationStore.data.set(nanoid(), {
      order: 0,
      node: rectNode.id,
      type: "property",
      property: "opacity",
      start: 0,
      duration: 500,
      easing: "linear",
      from: 0,
      to: 100,
    });

    this.animationStore.data.set(nanoid(), {
      order: 1,
      node: rectNode.id,
      type: "property",
      property: "w",
      start: 0,
      duration: 1000,
      easing: "linear",
      from: 0,
      to: 300,
    });

    this.animationStore.data.set(nanoid(), {
      order: 2,
      node: textNode.id,
      type: "in",
      start: 0,
      duration: 1000,
    });

    this.nodes.add(trackItem2.id, {
      order: 1,
      type: "video",
      start: -4 * 60 * 1000,
      x: 0,
      y: 0,
      w: videoWidth,
      h: videoHeight,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    });

    makeObservable(this);

    this.undoManager.clear();
  }

  readonly undoManager: UndoManager;

  readonly sequenceStore: Store<string, SequenceData>;
  readonly trackStore: Store<string, TrackData>;
  readonly trackItemStore: Store<string, TrackItemData>;
  readonly nodeStore: Store<string, NodeData>;
  readonly animationStore: Store<string, AnimationData>;

  readonly selectedNodeIDStore: Store<string, true>;
  readonly selectedAnimationIDStore: Store<string, true>;
  readonly currentSceneStore: Store<"value", string>;

  readonly sequences: InstanceManager<SequenceData, Sequence>;
  readonly tracks: InstanceManager<TrackData, Track>;
  readonly trackItems: InstanceManager<TrackItemData, TrackItem>;
  readonly nodes: InstanceManager<NodeData, Node>;
  readonly animations: InstanceManager<AnimationData, Animation>;
  readonly trackParenting: Parenting<TrackData>;
  readonly trackItemParenting: Parenting<TrackItemData>;
  readonly nodeParenting: Parenting<NodeData>;
  readonly animationParenting: Parenting<AnimationData>;

  readonly currentSequence: Sequence;

  readonly selection: Selection;
}
