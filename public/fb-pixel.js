/* eslint-disable no-undef */
// /* global fbq */

// if (!window.fbq) {
//   !function(f,b,e,v,n,t,s){
//     if(f.fbq) return;
//     n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
//     if(!f._fbq) f._fbq = n;
//     n.push=n; n.loaded = !0; n.version='2.0'; n.queue=[];
//     t=b.createElement(e); t.async=!0; t.src=v;
//     s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
//   }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

//   // fbq('init', '1311836394018583');
//   fbq('init', '2541072952746018');
//   fbq('init', '1597417537914943');

//   fbq('track', 'PageView');
// }

// window.trackFBEvent = function(eventName, params) {
//   if (window.fbq) {
//       fbq('track', eventName, params);
//   }
// };

if (!window.fbq) {
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  // Initialize pixels
  fbq('init', '1311836394018583'); // SenTo Wear Pixel
  fbq("init", "2541072952746018"); // Benanegy Pixel
  // fbq("init", "1597417537914943"); // Pixel الجديد

  // Track page view
  fbq("track", "PageView");
}

// Helper function to track events
window.trackFBEvent = function (eventName, params) {
  if (window.fbq) {
    fbq("track", eventName, params);
  }
};
