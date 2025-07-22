App.Utils = App.Utils || {};
App.Utils.Debug = (function () {
  return {
    fixMapStall: function () {
      console.log("🔧 Fixing map stall issue");

      // Simply reset the map events
      if (App.Map.Events) {
        App.Map.Events.reset();
        console.log("✅ Map event handlers reset");
      } else {
        console.error("App.Map.Events module not available");
      }
    },
  };
})();
