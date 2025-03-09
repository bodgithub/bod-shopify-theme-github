/**
 *  @class
 *  @function Gallery
 */
if (!customElements.get('theme-gallery')) {
  class ThemeGallery extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.galleryVideoList = Array.from(this.querySelectorAll('.gallery--item .gallery__video'));

      this.hoverPlayList = this.galleryVideoList.filter((item) => {
        return item.classList.contains('hover-play') && item;
      });

      this.autoPlayList = this.galleryVideoList.filter((item) => {
        return !item.classList.contains('hover-play') && item;
      });

      this.autoPlayList.forEach((item, i) => {
        item.querySelector('video').play();
      });

      this.setHoverPlayList();
    }
    setHoverPlayList() {
  this.hoverPlayList.forEach((item, i) => {
    const video = item.querySelector('video');
    video.currentTime = 0.1;
    video.muted = true; // Ensure videos start muted

    item.parentElement.addEventListener('mouseenter', () => this.playVideo(video));
    item.parentElement.addEventListener('mouseleave', () => this.pauseVideo(video));
    item.parentElement.addEventListener('click', () => this.toggleMute(video)); // Click to toggle audio
  });
}


    playVideo(video) {
  video.muted = false; // Unmute on hover
  video.play();
}
    pauseVideo(video) {
  video.pause();
}

  toggleMute(video) {
  video.muted = !video.muted;
}
  }
  customElements.define('theme-gallery', ThemeGallery);
}