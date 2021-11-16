/* Resources: https://joeflateau.net/posts/video-js-heart-typescript */
declare module "video.js" {
  export interface VideoJsPlayer {
    seekButtons(options: VideoJsSeekButtonsOptions): void;
  }

  export interface VideoJsPlayerPluginOptions {
    seekButtons?: VideoJsSeekButtonsOptions;
  }
}

export interface VideoJsSeekButtonsOptions {
  forward?: number;
  back?: number;
}
