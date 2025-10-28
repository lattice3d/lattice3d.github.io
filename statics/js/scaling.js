// 扩展后的脚本
document.addEventListener("DOMContentLoaded", function () {
  const scalingData = {
    training: {
      path: "M50,300 L150,130 L250,50 L450,0", // 线性上升直线
      points: [
        {
          x: 50,
          y: 300,
          label: "Baseline",
          modelPath: "statics/scaling_reduce_face/baseline.glb",
        },
        {
          x: 150,
          y: 130,
          label: "Medium (0.6B)",
          modelPath: "statics/scaling_reduce_face/medium.glb",
        },
        {
          x: 250,
          y: 50,
          label: "Large (1.9B)",
          modelPath: "statics/scaling_reduce_face/large.glb",
        },
        {
          x: 450,
          y: 0,
          label: "XL (4.5B)",
          modelPath: "statics/scaling_reduce_face/xl.glb",
        },
      ],
    },
    test: {
      path: "M50,300 L150,180 L250,100 L350,50",
      points: [
        {
          x: 50,
          y: 300,
          label: "3072 Tokens",
          modelPath: "statics/scaling_reduce_face/3072.glb",
        },
        {
          x: 150,
          y: 180,
          label: "6144 Tokens",
          modelPath: "statics/scaling_reduce_face/6144.glb",
        },
        {
          x: 250,
          y: 100,
          label: "12288 Tokens",
          modelPath: "statics/scaling_reduce_face/12288.glb",
        },
        {
          x: 350,
          y: 50,
          label: "24576 Tokens",
          modelPath: "statics/scaling_reduce_face/24576.glb",
        },
      ],
    },
  };
  const scalingViewer = document.getElementById("scaling-viewer");

  const tabs = document.querySelectorAll(".scaling-tab");
  const curvePath = document.getElementById("scaling-curve");
  const pointsGroup = document.querySelector(".curve-points");
  const tooltip = document.createElement("div");
  tooltip.id = "curve-tooltip";
  document.body.appendChild(tooltip);

  const tooltipFix = document.createElement("div");
  tooltipFix.id = "curve-tooltip-fix";
  document.body.appendChild(tooltipFix);

  let currentScalingType = "training";

  function updateCurve(type) {
    currentScalingType = type;
    const data = scalingData[type];

    // 更新路径
    curvePath.setAttribute("d", data.path);
    curvePath.style.strokeDashoffset = 1000;
    setTimeout(() => (curvePath.style.strokeDashoffset = 0), 50);

    // 更新点
    pointsGroup.innerHTML = "";
    data.points.forEach((point, i) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", point.x);
      circle.setAttribute("cy", point.y);
      circle.setAttribute("r", 6);
      circle.setAttribute("fill", "#00e7ff");
      circle.setAttribute("class", "scaling-point cursor-pointer");
      circle.dataset.label = point.label;
      circle.dataset.model = point.modelPath;

      circle.addEventListener("mouseenter", showTooltip);
      circle.addEventListener("mouseleave", hideTooltip);
      circle.addEventListener("click", () => loadScalingModel(circle));

      pointsGroup.appendChild(circle);

      if (i === data.points.length - 1) {
        circle.style.fill = "#00ff88";
        showTooltipFix(circle);
      }
    });

    scalingViewer.src = data.points[data.points.length - 1].modelPath;
  }

  scalingViewer.addEventListener("load", () => {
    const [material] = scalingViewer.model.materials;
    const color = [53, 54, 56, 255].map((x) => x / 255);
    material.pbrMetallicRoughness.setMetallicFactor(0.1);
    material.pbrMetallicRoughness.setRoughnessFactor(0.7);
    material.pbrMetallicRoughness.setBaseColorFactor(color);
  });

  function showTooltip(e) {
    const point = e.target;
    const rect = point.getBoundingClientRect();
    tooltip.textContent = point.dataset.label;
    tooltip.style.left = `${rect.left + window.scrollX + 12}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
    tooltip.classList.add("visible");
  }

  function showTooltipFix(point) {
    const rect = point.getBoundingClientRect();
    tooltipFix.textContent = point.dataset.label;
    tooltipFix.style.left = `${rect.left + window.scrollX + 12}px`;
    tooltipFix.style.top = `${rect.top + window.scrollY - 30}px`;
    tooltipFix.classList.add("visible");
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  // 初始化
  updateCurve("training");

  // Tab切换
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      updateCurve(this.dataset.type);
    });
  });

  function loadScalingModel(circle) {
    // Replace with actual model paths
    const modelPath = circle.dataset.model;
    scalingViewer.src = modelPath;
    showTooltipFix(circle);
    // Add visual feedback
    const curvePoints = document.querySelectorAll(".curve-points circle");
    curvePoints.forEach((p) => (p.style.fill = "#00e7ff"));
    circle.style.fill = "#00ff88";
  }
});
