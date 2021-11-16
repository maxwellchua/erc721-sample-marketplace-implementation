declare module "video.js" {
  export interface VideoJsPlayer {
    mediainfo: { projection: VideoJsVRProjectionOptions };
    /* TODO: return threeJs object.
     * NOTES:
     * 1.) The Three.js rotation values are exposed under the property
     * 'cameraVector' on the 'vr' plugin namespace.
     *
     * 2.) The Three.js Scene, renderer, and perspective camera are exposed
     * under the threeJs object as the properties 'scene', 'renderer', and
     * 'camera' on the 'vr' plugin namespace.
     */
    vr(options?: VideoJsPlayerPluginOptions): void;
  }

  export interface VideoJsPlayerPluginOptions {
    vr?: VideoJsVROptions;
  }
}

/* Source: https://github.com/videojs/videojs-vr#options */
export interface VideoJsVROptions {
  debug?: boolean = false;
  disableTogglePlay?: boolean = false;
  forceCardboard?: booelean = false;
  motionControls?: boolean; // NOTE: default: true on ios and andriod
  // TODO: https://github.com/GoogleChrome/omnitone
  // omnitone?: Omnitone library object;
  // omnitoneOptions?: object = {};
  projection?: VideoJsVRProjectionOptions = "AUTO";
  sphereDetail?: number = 32;
}

/* Source: https://github.com/videojs/videojs-vr#projection */
export type VideoJsVRProjectionOptions =
  | "NONE"
  | "AUTO"
  | "EAC"
  | "EAC_LR"
  | "180"
  | "180_LR"
  | "180_MONO"
  | "360"
  | "Sphere"
  | "equirectangular"
  | "Cube"
  | "360_CUBE"
  | "360_LR"
  | "360_TB";
