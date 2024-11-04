const script = (nightMode, position) => {
  return `

let autoScrollTimeout;
let autoScrollSpeed = 0;
let scrollMultiplier = 1.0;
let dragging = false;
let holding = false;
let holdTimer;
let curPosition = 0;
let isScrolling;
let isManuallyScrolling = false;

function clearScrollTimeout() {
  if (autoScrollTimeout != null) {
    clearTimeout(autoScrollTimeout);
  }
  autoScrollTimeout = null;
}

function scrollFunc(e) {
  curPosition = getScrollPercent();
  if (window.scrollY == 0) {
    window.ReactNativeWebView.postMessage("show");
  }

  if (typeof scrollFunc.y == "undefined") {
    scrollFunc.y = window.pageYOffset;
  }
  if (autoScrollSpeed == 0) {
    let diffY = scrollFunc.y - window.pageYOffset;
    if (diffY < 0) {
      // Scroll down
      if (diffY < -3) {
        window.ReactNativeWebView.postMessage("hide");
      }
    } else if (diffY > 5) {
      // Scroll up
      window.ReactNativeWebView.postMessage("show");
    }
  }
  scrollFunc.y = window.pageYOffset;
}

function getScrollPercent() {
  return window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
}

function fadeInEffect() {
    let fadeTarget = document.documentElement;
    fadeTarget.style.opacity = 0;
    let fadeEffect = setInterval(function () {
      if (Number(fadeTarget.style.opacity) < 1) {
        fadeTarget.style.opacity = Number(fadeTarget.style.opacity) + 0.1;
      } else {
        fadeTarget.style.opacity = 1;
      }
    }, 100);
  }

function setAutoScroll() {
  const speed = autoScrollSpeed;
  if (speed > 0) {
    if (!isManuallyScrolling) {
      window.scrollBy({
        behavior: "auto",
        left: 0,
        top: 1,
      });
    }
    autoScrollTimeout = setTimeout(function () {
      setAutoScroll();
    }, (200 - speed * 2) / scrollMultiplier);
  } else {
    clearScrollTimeout();
  }
}

const handleTouchEnd = () => {
  clearTimeout(holdTimer);
  if (autoScrollSpeed !== 0 && autoScrollTimeout === null) {
    setTimeout(function () {
      window.ReactNativeWebView.postMessage("hide");
    }, 5000);
    setAutoScroll();
  }
  if (!dragging && !holding) {
 
    window.ReactNativeWebView.postMessage("toggle");
  }
  dragging = false;
  holding = false;
}
const scrollToPosition=()=> {
  let scrollY = (document.body.scrollHeight - window.innerHeight) * ${position};
  window.scrollTo(0, scrollY);
  curPosition = scrollY;
}

window.addEventListener(
  "orientationchange",
  function () {
    setTimeout(function () {
      let scrollY = (document.body.scrollHeight - window.innerHeight) * curPosition;
      window.scrollTo(0, scrollY);
      curPosition = scrollY;
    }, 50);
  },
  false
);

window.onload = () => {

  scrollToPosition(); 
}


//  Listen for scroll events
window.addEventListener(
  "scroll",
  function (event) {
    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrolling);
    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(function () {
      isManuallyScrolling = false;
    }, 66);
  },
  false
);

if (${nightMode}) {
  //fade event
  window.addEventListener("load", fadeInEffect(), false);
}
window.onscroll = scrollFunc;
window.addEventListener("touchstart", function () {
  if (autoScrollSpeed !== 0) {
    clearScrollTimeout();
  }
  dragging = false;
  holding = false;
  holdTimer = setTimeout(()=> {
    holding = true;
  }, 1000); // Longer than 1 seconds is not a tap
});
window.addEventListener("touchmove", function () {
  isManuallyScrolling = true;
  dragging = true;
});

window.addEventListener("touchend", handleTouchEnd);

window.addEventListener(
  "message",
  function (event) {
    let message = JSON.parse(event.data);

    if (message.hasOwnProperty("Back")) {
      const currentPosition = getScrollPercent();
      window.ReactNativeWebView.postMessage("save-" + currentPosition);
    }

    if (message.hasOwnProperty("bookmark")) {
      location.hash = "#" + message.bookmark;
      window.ReactNativeWebView.postMessage("hide");
    } 
    if (message.hasOwnProperty("autoScroll")) {
      autoScrollSpeed = message.autoScroll;
      scrollMultiplier = message.scrollMultiplier;
      if (autoScrollSpeed !== 0) {
        setTimeout(() => {
          window.ReactNativeWebView.postMessage("toggle");
        }, 5000);
      }
      if (autoScrollTimeout == null) {
        setAutoScroll();
      }
    }
  },
  false
);
      `;
};
export default script;
