if (!customElements.get('theme-gallery')) {
  class ThemeGallery extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.galleryVideoList = Array.from(this.querySelectorAll('.gallery--item .gallery__video'));

      // Ensure videos just display with controls
      this.galleryVideoList.forEach((item) => {
        const video = item.querySelector('video');
        if (video) {
          video.controls = true; // Ensure controls are always visible
          video.muted = false; // Allow sound by default
        }
      });
    }
  }

  customElements.define('theme-gallery', ThemeGallery);
}
