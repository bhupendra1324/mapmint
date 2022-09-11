var viewer = new Cesium.Viewer("cesiumContainer");

$("#cesiumLoad").on("click", () => {
  let resourceId = +$("#cesiumResource").val();
  let token = $("#cesiumToken").val();
  Cesium.Ion.defaultAccessToken = token;
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZGU1NGNhYy1jN2MyLTQ2YTAtOTkzZS05OTUzOGZjNjliY2MiLCJpZCI6OTgyMzAsImlhdCI6MTY1NTcxMTEyNH0.c2_6dE0vgWs0lHZDfBtD4nLZpCXPCOII7gYdXjtIfao";

  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(resourceId),
    })
  );

  (async () => {
    try {
      await tileset.readyPromise;
      await viewer.zoomTo(tileset);

      // Apply the default style if it exists
      var extras = tileset.asset.extras;
      if (
        Cesium.defined(extras) &&
        Cesium.defined(extras.ion) &&
        Cesium.defined(extras.ion.defaultStyle)
      ) {
        tileset.style = new Cesium.Cesium3DTileStyle(extras.ion.defaultStyle);
      }
    } catch (error) {
      console.log(error);
    }
  })();
});
