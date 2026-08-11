import { adminApi } from "./admin-api.js";
import { showToast, setLoading } from "./admin-dashboard.js";

let isInitialized = false;

export function initResumeEditor() {
  if (isInitialized) return;

  const configForm = document.getElementById("form-resume-config");
  const uploadForm = document.getElementById("form-resume-upload");

  if (!configForm || !uploadForm) return;

  // Load initial data
  loadResumeData();

  // Handle text config save
  configForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const topText = document.getElementById("resume-top-text").value;
    const heading = document.getElementById("resume-heading").value;
    const tagline = document.getElementById("resume-tagline").value;

    setLoading(true);
    try {
      await adminApi.updateResumeConfig({
        top_text: topText || null,
        heading: heading || null,
        tagline: tagline || null,
      });
      showToast("Resume configuration saved successfully!");
    } catch (error) {
      console.error("Error saving resume config:", error);
      showToast(error.message || "Failed to save configuration", "error");
    } finally {
      setLoading(false);
    }
  });

  // Handle PDF upload
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("resume-pdf-upload");
    const file = fileInput.files[0];

    if (!file) {
      showToast("Please select a PDF file first", "error");
      return;
    }

    setLoading(true);
    try {
      await adminApi.uploadResumePDF(file);
      showToast("Resume PDF uploaded successfully!");
      fileInput.value = ""; // clear input
    } catch (error) {
      console.error("Error uploading resume:", error);
      showToast(error.message || "Failed to upload PDF", "error");
    } finally {
      setLoading(false);
    }
  });

  isInitialized = true;
}

async function loadResumeData() {
  setLoading(true);
  try {
    const config = await adminApi.getResumeConfig();

    document.getElementById("resume-top-text").value = config.top_text || "";
    document.getElementById("resume-heading").value = config.heading || "";
    document.getElementById("resume-tagline").value = config.tagline || "";
  } catch (error) {
    console.error("Failed to load resume data:", error);
    showToast("Failed to load resume data", "error");
  } finally {
    setLoading(false);
  }
}
