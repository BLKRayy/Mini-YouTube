/*******************************
 * SIMPLE AUTH
 *******************************/
const ADMIN_PASSWORD = "miniyt-admin"; // change this if you want

document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById("adminLoginScreen");
    const dashboard = document.getElementById("adminDashboard");

    const savedSession = localStorage.getItem("adminSession") === "true";

    if (savedSession) {
        loginScreen.classList.add("hidden");
        dashboard.classList.remove("hidden");
        initAdminDashboard();
    }

    const loginBtn = document.getElementById("adminLoginBtn");
    loginBtn.addEventListener("click", () => {
        const user = document.getElementById("adminUsername").value.trim();
        const pass = document.getElementById("adminPassword").value.trim();
        const remember = document.getElementById("adminRemember").checked;
        const error = document.getElementById("adminLoginError");

        if (!user || !pass) {
            error.textContent = "Please enter username and password.";
            return;
        }

        if (pass === ADMIN_PASSWORD) {
            error.textContent = "";
            loginScreen.classList.add("hidden");
            dashboard.classList.remove("hidden");
            if (remember) {
                localStorage.setItem("adminSession", "true");
            }
            initAdminDashboard();
        } else {
            error.textContent = "Invalid credentials.";
        }
    });

    const logoutBtn = document.getElementById("adminLogoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminSession");
        window.location.href = "index.html";
    });
});

/*******************************
 * ADMIN DASHBOARD LOGIC
 *******************************/
let adminVideos = [];

function initAdminDashboard() {
    loadVideosData().then(videos => {
        adminVideos = videos;
        updateDashboardStats();
        renderEditList();
        initNav();
        initMaintenanceControls();
        initUploadControls();
    });
}

function initNav() {
    const navItems = document.querySelectorAll(".admin-nav-item");
    const panels = document.querySelectorAll(".admin-panel");

    navItems.forEach(btn => {
        btn.addEventListener("click", () => {
            navItems.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.dataset.panel;
            panels.forEach(p => {
                p.classList.toggle("active", p.id === target);
            });
        });
    });
}

function updateDashboardStats() {
    const totalVideos = adminVideos.length;
    const totalViews = adminVideos.reduce((sum, v) => sum + (parseInt(v.views) || 0), 0);
    const maintenance = localStorage.getItem("maintenanceMode") === "on";

    document.getElementById("statTotalVideos").textContent = totalVideos;
    document.getElementById("statTotalViews").textContent = totalViews.toLocaleString();
    document.getElementById("statMaintenance").textContent = maintenance ? "ONLINE" : "OFFLINE";
}

/*******************************
 * MAINTENANCE CONTROLS
 *******************************/
function initMaintenanceControls() {
    const toggle = document.getElementById("maintenanceToggle");
    const statusMsg = document.getElementById("maintenanceStatusMsg");

    const maintenance = localStorage.getItem("maintenanceMode") === "on";
    toggle.checked = maintenance;

    document.getElementById("applyMaintenanceBtn").addEventListener("click", () => {
        const on = toggle.checked;
        localStorage.setItem("maintenanceMode", on ? "on" : "off");
        updateDashboardStats();
        statusMsg.textContent = on ? "Maintenance mode ENABLED." : "Maintenance mode DISABLED.";
        setTimeout(() => statusMsg.textContent = "", 2000);
    });
}

/*******************************
 * UPLOAD CONTROLS
 *******************************/
function initUploadControls() {
    const btn = document.getElementById("uploadVideoBtn");
    const msg = document.getElementById("uploadStatusMsg");

    btn.addEventListener("click", () => {
        const title = document.getElementById("uploadTitle").value.trim();
        const channel = document.getElementById("uploadChannel").value.trim();
        const category = document.getElementById("uploadCategory").value.trim().toLowerCase();
        const views = document.getElementById("uploadViews").value.trim();
        const thumb = document.getElementById("uploadThumbnail").value.trim();
        const videoUrl = document.getElementById("uploadVideoUrl").value.trim();
        const desc = document.getElementById("uploadDescription").value.trim();

        if (!title || !channel || !category || !thumb || !videoUrl) {
            msg.textContent = "Please fill in all required fields.";
            return;
        }

        const newId = adminVideos.length ? Math.max(...adminVideos.map(v => v.id)) + 1 : 1;

        const newVideo = {
            id: newId,
            title,
            channel,
            category,
            views: views || "0",
            uploadDate: "Just now",
            thumbnail: thumb,
            videoUrl,
            description: desc || "",
            channelAvatar: "images/default-avatar.png"
        };

        adminVideos.push(newVideo);
        saveVideosOverride();
        updateDashboardStats();
        renderEditList();

        msg.textContent = "Video added (stored locally).";
        setTimeout(() => msg.textContent = "", 2000);
    });
}

/*******************************
 * EDIT LIST
 *******************************/
function renderEditList() {
    const container = document.getElementById("editVideosList");
    container.innerHTML = "";

    adminVideos.forEach(video => {
        const row = document.createElement("div");
        row.classList.add("admin-video-row");

        row.innerHTML = `
            <div class="admin-video-main">
              <div class="admin-video-title">${video.title}</div>
              <div class="admin-video-meta">${video.views} views • ${video.uploadDate}</div>
            </div>
            <div class="admin-video-actions">
              <button class="admin-icon-btn" data-action="edit">✏️</button>
              <button class="admin-icon-btn" data-action="delete">🗑️</button>
            </div>
        `;

        const editBtn = row.querySelector('[data-action="edit"]');
        const deleteBtn = row.querySelector('[data-action="delete"]');

        editBtn.addEventListener("click", () => {
            const newTitle = prompt("Edit title:", video.title);
            if (newTitle !== null) video.title = newTitle;

            const newViews = prompt("Edit views:", video.views);
            if (newViews !== null) video.views = newViews;

            saveVideosOverride();
            updateDashboardStats();
            renderEditList();
        });

        deleteBtn.addEventListener("click", () => {
            if (!confirm("Delete this video?")) return;
            adminVideos = adminVideos.filter(v => v.id !== video.id);
            saveVideosOverride();
            updateDashboardStats();
            renderEditList();
        });

        container.appendChild(row);
    });
}

/*******************************
 * SAVE OVERRIDES
 *******************************/
function saveVideosOverride() {
    localStorage.setItem("videosOverride", JSON.stringify(adminVideos));
}
