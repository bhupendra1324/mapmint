var viewer = new Cesium.Viewer("cesiumContainer");
const loader = document.querySelector("#loading");
viewer.infoBox.frame.sandbox =
  "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";
$("#load").on("click", () => {
  loader.classList.add("display");
  fetch("/assetIds")
    .then((resp) => resp.json())
    .then((data) => populateAssetIds(data));
});

const populateAssetIds = (ids) => {
  const selectDiv = $("#assetIDs");
  let optionIds = "";
  ids["items"].forEach((element) => {
    optionIds += `<option>${element["name"]} {${element["id"]}}</option>`;
  });
  selectDiv.append(optionIds);
  loader.classList.remove("display");
};

const loadAssetId = (assetId) => {
  let resourceId = +$("#cesiumResource").val();
  //   let token = $("#cesiumToken").val();
  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZGU1NGNhYy1jN2MyLTQ2YTAtOTkzZS05OTUzOGZjNjliY2MiLCJpZCI6OTgyMzAsImlhdCI6MTY1NTcxMTEyNH0.c2_6dE0vgWs0lHZDfBtD4nLZpCXPCOII7gYdXjtIfao";
  Cesium.Ion.defaultAccessToken = token;
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(assetId),
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
};

$("#show").on("click", () => {
  let assetVal = $("#assetIDs").val();
  if (assetVal != "Select Assest IDs...") {
    let assetId = assetVal.split("{")[1].split("}")[0];
    fetch("/assetid/" + assetId, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assetId: assetId }),
    })
      .then((resp) => resp.json())
      .then((data) => checkIfTiled(data, assetId));
  } else {
    alert("Please load assetIds or select one!!");
  }
});

const checkIfTiled = (data, assetId) => {
  if (data.status == "COMPLETE") {
    loadAssetId(assetId);
  } else {
    alert(`The titling is ${data.status}. Please try again later`);
  }
};

const loadLocalFiles = () => {
  alert("Hello");
  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZGU1NGNhYy1jN2MyLTQ2YTAtOTkzZS05OTUzOGZjNjliY2MiLCJpZCI6OTgyMzAsImlhdCI6MTY1NTcxMTEyNH0.c2_6dE0vgWs0lHZDfBtD4nLZpCXPCOII7gYdXjtIfao";
  var viewer = new Cesium.Viewer("cesiumContainer");
  var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: "http://localhost:3000/tiles/tileset.json", // URL from `Starting the Server` section.
    })
  );
  viewer.zoomTo(tileset);
};

$("#load_local").on("click", () => {
  loadLocalFiles();
});
