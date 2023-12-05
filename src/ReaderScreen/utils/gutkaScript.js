import { Platform } from "react-native";

const script = (nightMode, position) => {
  const listener = Platform.OS === "android" ? "document" : "window";
  return `

var autoScrollTimeout;
var autoScrollSpeed = 0;
var scrollMultiplier = 1.0;
var dragging = false;
var holding = false;
var holdTimer;
var curPosition = 0;
var isScrolling;
var isManuallyScrolling = false;
window.addEventListener(
  "orientationchange",
  function () {
    setTimeout(function () {
      var scrollY = (document.body.scrollHeight - window.innerHeight) * curPosition;
      window.scrollTo(0, scrollY);
      curPosition = scrollY;
    }, 50);
  },
  false
);

(function scrollToPosition() {
  setTimeout(function () {
    var scrollY = (document.body.scrollHeight - window.innerHeight) * ${position};
    window.scrollTo(0, scrollY);
    curPosition = scrollY;
  }, 50);
})();

function getScrollPercent() {
  return window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
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

  function fadeInEffect() {
    var fadeTarget = document.getElementsByTagName("HTML")[0];
    fadeTarget.style.opacity = 0;
    var fadeEffect = setInterval(function () {
      if (Number(fadeTarget.style.opacity) < 1) {
        fadeTarget.style.opacity = Number(fadeTarget.style.opacity) + 0.1;
        console.log(fadeTarget.style.opacity);
      } else {
        fadeTarget.style.opacity = 1;
      }
    }, 100);
  }
}
function setAutoScroll() {
  var speed = autoScrollSpeed;
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
    var diffY = scrollFunc.y - window.pageYOffset;
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
window.onscroll = scrollFunc;

window.addEventListener("touchstart", function () {
  if (autoScrollSpeed !== 0) {
    clearScrollTimeout();
  }
  dragging = false;
  holding = false;
  holdTimer = setTimeout(function () {
    holding = true;
  }, 125); // Longer than 125 milliseconds is not a tap
});
window.addEventListener("touchmove", function () {
  isManuallyScrolling = true;
  dragging = true;
});
window.addEventListener("touchend", function () {
  if (autoScrollSpeed !== 0 && autoScrollTimeout === null) {
    setTimeout(function () {
      window.ReactNativeWebView.postMessage("hide");
    }, 5000);
    setAutoScroll();
  }
  if (!dragging && !holding) {
    window.ReactNativeWebView.postMessage("toggle");
  }
  clearTimeout(holdTimer);
  dragging = false;
  holding = false;
});

${listener}.addEventListener(
  "message",
  function (event) {
    var message = JSON.parse(event.data);

    if (message.hasOwnProperty("Back")) {
      currentPosition = getScrollPercent();
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