// Pagination variables
let currentPage = 1;
const modelsPerPage = 8;
let currentFilter = "all";

// DOM elements
const modelGrid = document.getElementById("model-grid");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("model-modal");
const closeModal = document.querySelector(".close-modal");
const modalViewer = document.getElementById("modal-viewer");
const referenceImage = document.getElementById("reference-image");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalCategory = document.getElementById("modal-category");
const modalPolygons = document.getElementById("modal-polygons");
const modalTextures = document.getElementById("modal-textures");
const modalMaterials = document.getElementById("modal-materials");
const viewModeButtons = document.querySelectorAll(".view-mode");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Load initial models
  renderModels();
  updatePagination();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Filter button events
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Update current filter
      currentFilter = this.dataset.filter;
      currentPage = 1;

      // Re-render models
      renderModels();
      updatePagination();
    });
  });

  // Pagination events
  prevPageBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderModels();
      updatePagination();
    }
  });

  nextPageBtn.addEventListener("click", function () {
    const filteredModels = getFilteredModels();
    const totalPages = Math.ceil(filteredModels.length / modelsPerPage);

    if (currentPage < totalPages) {
      currentPage++;
      renderModels();
      updatePagination();
    }
  });

  // Close modal when clicking X
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  // View mode buttons in modal
  viewModeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      viewModeButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      const mode = this.dataset.mode;
      updateModelView(mode);
    });
  });

  // Intersection Observer for fade-in animations
  const fadeElements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeElements.forEach((element) => {
    element.style.opacity = 0;
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(element);
  });
});

// Get filtered models based on current filter
function getFilteredModels() {
  if (currentFilter === "all") {
    return models;
  } else {
    return models.filter((model) => model.category === currentFilter);
  }
}

// Render models based on current filter and page
function renderModels() {
  const filteredModels = getFilteredModels();
  const startIndex = (currentPage - 1) * modelsPerPage;
  const endIndex = startIndex + modelsPerPage;
  const paginatedModels = filteredModels.slice(startIndex, endIndex);

  // Clear the grid
  modelGrid.innerHTML = "";

  // Add models to the grid
  paginatedModels.forEach((model) => {
    const modelCard = document.createElement("div");
    modelCard.className = "model-card rounded-xl p-6 fade-in";
    modelCard.style.opacity = "0";
    modelCard.style.transform = "translateY(20px)";

    // 生成唯一的 model-viewer ID
    const modelViewerId = `model-${model.id}`;

    modelCard.innerHTML = `
                    <model-viewer 
                        id="${modelViewerId}"
                        src="${model.src}" 
                        alt="${model.title} 3D model"
                        camera-controls 
                        disable-zoom
                        touch-action="pan-y"
                        interaction-prompt="none"
                        shadow-intensity="0.0"
                        exposure="1.0"
                        environment-image="legacy"
                        style="width: 100%; height: 200px; background-color: transparent;">
                    </model-viewer>
                    <h3 class="text-l font-semibold mt-6 text-white">${model.title}</h3>
                    <p class="text-gray-400 mt-2 text-sm">${model.description}</p>
                    <button class="mt-4 text-cyan-400 text-sm font-medium flex items-center view-details-btn" data-id="${model.id}">
                        View details <i class="fas fa-expand ml-2 text-xs"></i>
                    </button>
                `;

    // 如果是非纹理模型，设置材质
    if (!model.textured) {
      const modelViewer = modelCard.querySelector(`#${modelViewerId}`);

      // 确保 model-viewer 加载完成后再修改材质
      modelViewer.addEventListener("load", () => {
        try {
          const [material] = modelViewer.model.materials;
          const color = [53, 54, 56, 255].map((x) => x / 255);
          material.pbrMetallicRoughness.setMetallicFactor(0.1);
          material.pbrMetallicRoughness.setRoughnessFactor(0.7);
          material.pbrMetallicRoughness.setBaseColorFactor(color);
        } catch (error) {
          console.error("Error applying material settings:", error);
        }
      });
    }

    modelGrid.appendChild(modelCard);

    // Add hover effect
    modelCard.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
      this.style.boxShadow = "0 25px 50px -12px rgba(0, 231, 255, 0.25)";
      const viewer = this.querySelector("model-viewer");
      if (viewer) {
        viewer.setAttribute("auto-rotate-delay", "0");
      }
    });

    modelCard.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 20px 40px -10px rgba(0, 231, 255, 0.2)";
      const viewer = this.querySelector("model-viewer");
      if (viewer) {
        viewer.setAttribute("auto-rotate-delay", "3000");
      }
    });

    // Add click event to view details button
    const viewDetailsBtn = modelCard.querySelector(".view-details-btn");
    viewDetailsBtn.addEventListener("click", function () {
      openModelModal(model);
    });
  });

  // Trigger fade-in for new elements
  setTimeout(() => {
    const newCards = document.querySelectorAll(".model-card");
    newCards.forEach((card) => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    });
  }, 50);
}

// Update pagination controls
function updatePagination() {
  const filteredModels = getFilteredModels();
  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);

  // Update page info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Update button states
  prevPageBtn.classList.toggle("disabled", currentPage === 1);
  nextPageBtn.classList.toggle("disabled", currentPage === totalPages);
}

// Open modal with model details
function openModelModal(model) {
  // Set modal content
  modalTitle.textContent = model.title;
  modalDescription.textContent = model.description;
  modalCategory.textContent =
    model.category.charAt(0).toUpperCase() + model.category.slice(1);
  modalPolygons.textContent = model.polygons;
  modalTextures.textContent = model.textures;
  modalMaterials.textContent = model.materials;

  // Set reference image
  referenceImage.src = model.referenceImage;

  // Set model in viewer
  modalViewer.setAttribute("src", model.src);
  if (!model.textured) {
    // 确保 model-viewer 加载完成后再修改材质
    modalViewer.addEventListener("load", () => {
      try {
        const [material] = modalViewer.model.materials;
        const color = [100, 100, 100, 255].map((x) => x / 255);
        material.pbrMetallicRoughness.setMetallicFactor(0.1);
        material.pbrMetallicRoughness.setRoughnessFactor(0.5);
        material.pbrMetallicRoughness.setBaseColorFactor(color);
        modalViewer.setAttribute("exposure", "0.5");
        modalViewer.setAttribute("environment-image", "legacy");
        modalViewer.setAttribute("shadow-intensity", "0");
      } catch (error) {
        console.error("Error applying material settings:", error);
      }
    });
  }

  // Reset view mode to textured
  viewModeButtons.forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector('.view-mode[data-mode="Legacy"]')
    .classList.add("active");

  // Show modal
  modal.style.display = "block";

  // Wait for model to load
  modalViewer.addEventListener("load", () => {
    // Store original materials for later restoration
    if (!modalViewer.originalMaterials) {
      modalViewer.originalMaterials = [...modalViewer.model.materials];
    }
  });
}

// Update model view based on current view mode
function updateModelView(mode) {
  if (!modalViewer.model) return;

  const [material] = modalViewer.model.materials;
  switch (mode) {
    case "textured":
      // // Restore original materials
      // modalViewer.model.materials.forEach((material, i) => {
      //     if (modalViewer.originalMaterials[i]) {
      //         material.pbrMetallicRoughness.baseColorTexture =
      //             modalViewer.originalMaterials[i].pbrMetallicRoughness.baseColorTexture;
      //     }
      // });
      // modalViewer.setAttribute('environment-image', 'neutral');
      // modalViewer.setAttribute('shadow-intensity', '1.2');
      // modalViewer.setAttribute('exposure', '1.1');

      var color = [100, 100, 100, 255].map((x) => x / 255);
      material.pbrMetallicRoughness.setMetallicFactor(0.1);
      material.pbrMetallicRoughness.setRoughnessFactor(0.5);
      material.pbrMetallicRoughness.setBaseColorFactor(color);
      modalViewer.setAttribute("exposure", "0.5");
      modalViewer.setAttribute("environment-image", "legacy");
      modalViewer.setAttribute("shadow-intensity", "0");
      break;

    case "Legacy":
      var color = [100, 100, 100, 255].map((x) => x / 255);
      material.pbrMetallicRoughness.setMetallicFactor(0.1);
      material.pbrMetallicRoughness.setRoughnessFactor(0.5);
      material.pbrMetallicRoughness.setBaseColorFactor(color);
      modalViewer.setAttribute("exposure", "1.0");
      modalViewer.setAttribute("environment-image", "legacy");
      modalViewer.setAttribute("shadow-intensity", "0");
      break;

    case "Normal":
      // Normals view (simulated with environment)
      modalViewer.setAttribute("environment-image", "neutral");
      modalViewer.setAttribute("shadow-intensity", "0.5");
      modalViewer.setAttribute("exposure", "0.8");
      break;

    case "Gradient":
      modalViewer.model.materials.forEach((material) => {
        material.pbrMetallicRoughness.baseColorTexture = null;
        material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      });
      modalViewer.setAttribute(
        "environment-image",
        "statics/env_maps/gradient.jpg"
      );
      modalViewer.setAttribute("shadow-intensity", "0.0");
      modalViewer.setAttribute("exposure", "1.5");
      break;

    case "Neutral":
      var color = [100, 100, 100, 255].map((x) => x / 255);
      material.pbrMetallicRoughness.setMetallicFactor(0.1);
      material.pbrMetallicRoughness.setRoughnessFactor(0.5);
      material.pbrMetallicRoughness.setBaseColorFactor(color);
      modalViewer.setAttribute("environment-image", "neutral");
      modalViewer.setAttribute("exposure", "1.0");
      break;
  }
}
