/**
 *  @class
 *  @function ImageTextOverlay
 */

if (!customElements.get('image-with-text-overlay')) {
  class ImageTextOverlay extends HTMLElement {
    constructor() {
      super();

      this.tl = false;
      this.splittext = false;
    }
    connectedCallback() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        this.prepareAnimations();
      }
    }
    disconnectedCallback() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        this.tl.kill();
        this.splittext.revert();
      }
    }
    prepareAnimations() {
      let section = this,
        button_offset = 0,
        property = (gsap.getProperty("html", "--header-height") + gsap.getProperty("html", "--header-offset")) + 'px';

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

        if (section.querySelector('.inline-badge')) {
          section.tl
            .fromTo(section.querySelector('.inline-badge'), {
              opacity: 0
            }, {
              duration: 0.75,
              opacity: 1
            }, 0);

          button_offset += 0.5;
        }
        if (section.querySelector('.subheading')) {
          section.tl
            .fromTo(section.querySelector('.subheading'), {
              opacity: 0
            }, {
              duration: 0.75,
              opacity: 0.6
            }, 0);

          button_offset += 0.5;
        }
        if (section.querySelector('h3')) {
          let h3_duration = 0.8 + ((section.querySelectorAll('h3 .line-child div').length - 1) * 0.08);
          section.tl
            .set(section.querySelector('h3'), {
              visibility: 'visible'
            }, 0)
            .from(section.querySelectorAll('h3 .line-child div'), {
              duration: h3_duration,
              yPercent: '100',
              stagger: 0.08
            }, 0);
          button_offset += h3_duration;
        }
        if (section.querySelector('.rte p')) {
          let p_duration = 0.8 + ((section.querySelectorAll('.rte p .line-child div').length - 1) * 0.02);
          section.tl
            .set(section.querySelectorAll('.rte p'), {
              visibility: 'visible'
            }, 0)
            .from(section.querySelectorAll('.rte p .line-child div'), {
              duration: p_duration,
              yPercent: '100',
              stagger: 0.02
            }, 0);
          button_offset += p_duration;
        }
        if (section.querySelectorAll('.button')) {
          let i = 1;
          section.querySelectorAll('.button').forEach((item) => {
            section.tl.fromTo(item, {
              autoAlpha: 0
            }, {
              duration: 0.5,
              autoAlpha: 1
            }, ((button_offset * 0.4) + (i - 1) * 0.1));
            i++;
          });
        }

      });

      if (section.querySelector('.thb-parallax-image')) {
        gsap.fromTo(section.querySelectorAll('.thb-parallax-image'), {
          y: '-8%'
        }, {
          y: '8%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            scrub: 1,
            start: () => `top bottom`,
            end: () => `bottom top+=${property}`,
            onUpdate: () => {
              property = (gsap.getProperty("html", "--header-height") + gsap.getProperty("html", "--header-offset")) + 'px';
            }
          }
        });
      }
    }
  }
  customElements.define('image-with-text-overlay', ImageTextOverlay);
}




// new way to animate home banner hormones mood metabolism
if (!customElements.get('image-with-text-overlay')) {
  class ImageTextOverlay extends HTMLElement {
    constructor() {
      super();
      this.tl = false;
      this.splittext = false;
      this.words = ['hormones', 'mood', 'metabolism']; // Words to rotate
      this.i = 0; // Start index for rotating words
    }

    connectedCallback() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        this.prepareAnimations();
        this.animateText(); // Initialize text animation
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

        // Add additional animations here as needed (e.g., headings, paragraphs)
      });
    }

    // New method to animate the text rotation
    animateText() {
      const textElement = document.getElementById('animated-text');
      const deservesElement = document.getElementById('deserves-text');

      // Function to rotate words with GSAP animation
      const changeWord = () => {
        let currentWord = this.words[this.i];
        let deservesText = currentWord === 'hormones' ? 'deserve' : 'deserves'; // Correct grammar for each word

        // Fade out, change text, then fade back in using GSAP
        gsap.to([textElement, deservesElement], {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            textElement.innerText = currentWord;
            deservesElement.innerText = deservesText;

            // Fade back in
            gsap.to([textElement, deservesElement], { opacity: 1, duration: 0.5 });
          }
        });

        this.i = (this.i + 1) % this.words.length; // Loop through words
      };

      // Change the word every 3 seconds
      setInterval(changeWord, 3000);
    }
  }

  customElements.define('image-with-text-overlay', ImageTextOverlay);
}
// end new way to animate hormones mood metabolism on home banner