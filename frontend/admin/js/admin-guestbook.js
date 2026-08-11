import { adminApi } from "./admin-api.js";
import { showToast, setLoading } from "./admin-dashboard.js";

let isInitialized = false;

export async function initGuestbookEditor() {
  if (isInitialized) return;
  isInitialized = true;

  await loadGuestbook();
}

async function loadGuestbook() {
  const container = document.getElementById("guestbook-list-container");

  try {
    setLoading(true);
    const entries = await adminApi.getGuestbook();

    container.innerHTML = "";

    if (!entries || entries.length === 0) {
      container.innerHTML =
        '<div class="empty-state">No guestbook entries found.</div>';
      return;
    }

    entries.forEach((entry) => {
      const el = document.createElement("div");
      el.className = "list-item";

      // Distinguish pending vs approved
      if (!entry.is_approved) {
        el.style.borderLeft = "4px solid var(--warning-color)";
        el.style.backgroundColor = "var(--bg-lighter)";
      }

      el.innerHTML = `
                <div class="item-content" style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">${escapeHtml(entry.name)} 
                            ${!entry.is_approved ? '<span style="color: var(--warning-color); font-size: 0.8rem; margin-left: 0.5rem; text-transform: uppercase;">[Pending]</span>' : ""}
                        </h4>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${new Date(entry.created_at).toLocaleString()}</span>
                    </div>
                    <div style="white-space: pre-wrap; font-size: 0.95rem;">${escapeHtml(entry.message)}</div>
                </div>
                <div class="item-actions" style="margin-left: 1rem; align-self: flex-start; display: flex; flex-direction: column; gap: 0.5rem;">
                    ${
                      !entry.is_approved
                        ? `
                        <button class="btn btn-sm btn-primary btn-approve" data-id="${entry.id}">Approve</button>
                        <button class="btn btn-sm btn-danger btn-reject" data-id="${entry.id}">Reject</button>
                    `
                        : `
                        <button class="btn btn-sm btn-danger btn-reject" data-id="${entry.id}">Reject</button>
                    `
                    }
                </div>
            `;

      // Approve action
      const btnApprove = el.querySelector(".btn-approve");
      if (btnApprove) {
        btnApprove.addEventListener("click", async () => {
          await handleModeration(
            entry.id,
            true,
            el,
            btnApprove,
            el.querySelector(".btn-reject"),
          );
        });
      }

      // Reject action
      const btnReject = el.querySelector(".btn-reject");
      if (btnReject) {
        btnReject.addEventListener("click", async () => {
          await handleModeration(
            entry.id,
            false,
            el,
            el.querySelector(".btn-approve"),
            btnReject,
          );
        });
      }

      container.appendChild(el);
    });
  } catch (error) {
    showToast(error.message || "Failed to load guestbook entries", "error");
    container.innerHTML =
      '<div class="empty-state error-message">Failed to load guestbook entries.</div>';
  } finally {
    setLoading(false);
  }
}

async function handleModeration(
  id,
  isApproved,
  element,
  btnApprove,
  btnReject,
) {
  try {
    if (btnApprove) btnApprove.disabled = true;
    if (btnReject) btnReject.disabled = true;

    await adminApi.updateGuestbook(id, { is_approved: isApproved });
    showToast(`Entry ${isApproved ? "approved" : "rejected"}`, "success");

    // Reload list to apply consistent state rendering
    await loadGuestbook();
  } catch (error) {
    if (btnApprove) btnApprove.disabled = false;
    if (btnReject) btnReject.disabled = false;
    showToast(error.message || "Failed to moderate entry", "error");
  }
}

function escapeHtml(unsafe) {
  if (unsafe == null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
