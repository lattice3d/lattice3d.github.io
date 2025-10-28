// Features Section Interaction
const featureTabs = document.querySelectorAll(".feature-tab");
const tabContents = document.querySelectorAll(".tab-content");
const caseSelectors = document.querySelectorAll(".case-selector");
const featureViewer = document.getElementById("feature-viewer");

// Sample model data (replace with actual model paths)
const featureModels = {
  detail: {
    // gear: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    angle: "statics/features/robot.glb",
    gear: "statics/features/tank.glb",
    leaf: "statics/features/man.glb",
  },
  sharp: {
    crystal: "statics/meshes/Props/文生3D主体_材料与制造_第三轮_150.glb",
    architecture:
      "statics/meshes/Props/4d1750c2-db2b-427b-9d42-80fa742ab6f5.glb",
  },
  smooth: {
    vase: "statics/features/character1.glb",
    character: "statics/features/character2.glb",
  },
};

featureTabs.forEach((tab) => {
  tab.addEventListener("click", function () {
    // Update tabs
    featureTabs.forEach((t) => t.classList.remove("active"));
    this.classList.add("active");

    // Update content
    const tabName = this.dataset.tab;
    tabContents.forEach((content) => {
      content.classList.toggle("hidden", content.dataset.tab !== tabName);
      content.classList.toggle("active", content.dataset.tab === tabName);
    });

    // Load first case model
    const firstCase = this.parentElement.querySelector(".case-selector");
    if (firstCase) {
      loadFeatureModel(tabName, firstCase.dataset.model);
      caseSelectors.forEach((c) => c.classList.remove("active"));
      firstCase.classList.add("active");
    }
  });
});

caseSelectors.forEach((selector) => {
  selector.addEventListener("click", function () {
    caseSelectors.forEach((c) => c.classList.remove("active"));
    this.classList.add("active");

    const activeTab = document.querySelector(".feature-tab.active").dataset.tab;
    loadFeatureModel(activeTab, this.dataset.model);
  });
});

let orbitIntervalId = null; // 保存定时器ID
let previousLoadHandler = null; // 保存之前的load事件处理函数

function loadFeatureModel(tab, modelKey) {
  const modelPath = featureModels[tab][modelKey];
  if (modelPath) {
    featureViewer.setAttribute("src", modelPath);
    const modelViewer = featureViewer;

    // 移除之前的load事件监听器
    if (previousLoadHandler) {
      modelViewer.removeEventListener("load", previousLoadHandler);
      previousLoadHandler = null;
    }

    // 定义新的load事件处理函数
    const loadHandler = () => {
      try {
        const [material] = modelViewer.model.materials;

        // const color = [84, 84, 84, 255].map(x => x / 255);
        const color = [53, 54, 56, 255].map((x) => x / 255);
        material.pbrMetallicRoughness.setMetallicFactor(0.1);
        material.pbrMetallicRoughness.setRoughnessFactor(0.7);
        material.pbrMetallicRoughness.setBaseColorFactor(color);
      } catch (error) {
        console.error("Error applying material settings:", error);
      }

      // 清除旧的定时器
      // if (orbitIntervalId !== null) {
      //   clearInterval(orbitIntervalId);
      //   orbitIntervalId = null;
      // }

      // const orbitCycle = [
      //   "45deg 55deg 4m",
      //   "-80deg 110deg 1m",
      //   modelViewer.cameraOrbit,
      // ];

      // // 设置新定时器并保存ID
      // orbitIntervalId = setInterval(() => {
      //   const currentOrbitIndex = orbitCycle.indexOf(modelViewer.cameraOrbit);
      //   modelViewer.cameraOrbit =
      //     orbitCycle[(currentOrbitIndex + 1) % orbitCycle.length];
      // }, 3000);
    };

    // 保存当前处理函数并绑定事件
    previousLoadHandler = loadHandler;
    modelViewer.addEventListener("load", loadHandler);
  }
}

// Load initial model
loadFeatureModel("detail", "gear");
