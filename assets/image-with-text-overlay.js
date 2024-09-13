if (!customElements.get('image-with-text-overlay')) {
  class ImageTextOverlay extends HTMLElement {
    constructor() {
      super();
      this.tl = false;
      this.splittext = false;
      this.words = ['hormones', 'mood', 'metabolism']; // Add the words to rotate
      this.i = 0; // Start index
    }
    connectedCallback() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        this.prepareAnimations();
        this.animateText(); // Call text animation on load
      }
    }
    disconnectedCallback() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        this.tl.kill();
        this.splittext.revert();
      }
    }
    prepareAnimations() {
      let section = this;

      section.tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top center"
        }
      });

      document.fonts.ready.then(function() {
        section.splittext = new SplitText(section.querySelectorAll('h3, p:not(.subheading)'), {
          type: 'lines, words',
          linesClass: 'line-child'
        });

        // Add more animations as necessary
      });
    }

    // Method to handle rotating words with animation
    animateText() {
      const textElement = document.getElementById('animated-text');
      const deservesElement = document.getElementById('deserves-text');

      // Animation loop for rotating words
      const changeWord = () => {
        let currentWord = this.words[this.i];
        let deservesText = currentWord === 'hormones' ? 'deserve' : 'deserves';

        // Use GSAP to fade out, change text, and fade back in
        gsap.to([textElement, deservesElement], {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            textElement.innerText = currentWord;
            deservesElement.innerText = deservesText;

            // Fade text back in
            gsap.to([textElement, deservesElement], { opacity: 1, duration: 0.5 });
          }
        });

        this.i = (this.i + 1) % this.words.length; // Loop through the words
      };

      // Change the word every 3 seconds
      setInterval(changeWord, 3000);
    }
  }
  customElements.define('image-with-text-overlay', ImageTextOverlay);
}
