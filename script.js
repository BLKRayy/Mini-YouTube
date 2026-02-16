/*******************************
 * THEME SYSTEM
 *******************************/
function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = document.body.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
        });
    }

    handleMaintenanceOverlay();
});

/*******************************
 * MAINTENANCE OVERLAY
 *******************************/
let maintenanceInterval = null;
let maintenanceConsoleInterval = null;

function handleMaintenanceOverlay() {
    const overlay = document.getElementById("maintenanceOverlay");
    if (!overlay) return;

    const isAdminPage = window.location.pathname.includes("admin.html");
    const maintenance = localStorage.getItem("maintenanceMode") === "on";

    if (maintenance && !isAdminPage) {
        overlay.classList.remove("hidden");
        startMaintenanceAnimation();
    } else {
        overlay.classList.add("hidden");
        stopMaintenanceAnimation();
    }
}

function startMaintenanceAnimation() {
    const hEl = document.getElementById("mh");
    const mEl = document.getElementById("mm");
    const sEl = document.getElementById("ms");
    const bar = document.getElementById("maintenanceProgressBar");
    const label = document.getElementById("maintenanceProgressLabel");
    const consoleBox = document.getElementById("maintenanceConsole");

    if (!hEl || !mEl || !sEl || !bar || !label || !consoleBox) return;

    let totalSeconds = 2 * 3600 + 30 * 60; // 2h30m
    let progress = 70; // start at 70%

    const messages = [
        "Optimizing database indexes...",
        "Upgrading server infrastructure...",
        "Deploying new features...",
        "Running security patches...",
        "Refreshing CDN cache...",
        "Verifying data integrity..."
    ];
    let msgIndex = 0;

    function updateCountdown() {
        if (totalSeconds > 0) totalSeconds--;

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        hEl.textContent = String(h).padStart(2, "0");
        mEl.textContent = String(m).padStart(2, "0");
        sEl.textContent = String(s).padStart(2, "0");

        if (progress < 100) {
            progress += 0.03; // slow creep
            if (progress > 100) progress = 100;
            bar.style.width = progress + "%";
            label.textContent = Math.round(progress) + "%";
        }
    }

    function pushConsoleMessage() {
        const line = document.createElement("div");
        line.textContent = messages[msgIndex];
        msgIndex = (msgIndex + 1) % messages.length;
        consoleBox.appendChild(line);
        consoleBox.scrollTop = consoleBox.scrollHeight;
    }

    updateCountdown();
    pushConsoleMessage();

    maintenanceInterval = setInterval(updateCountdown, 1000);
    maintenanceConsoleInterval = setInterval(pushConsoleMessage, 5000);
}

function stopMaintenanceAnimation() {
    if (maintenanceInterval) clearInterval(maintenanceInterval);
    if (maintenanceConsoleInterval) clearInterval(maintenanceConsoleInterval);
}

/*******************************
 * RIPPLE EFFECT
 *******************************/
document.addEventListener("click", e => {
    const target = e.target.closest(".ripple");
    if (!target) return;

    const circle = document.createElement("span");
    circle.classList.add("ripple-effect");

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    circle.style.width = circle.style.height = size + "px";
    circle.style.left = e.clientX - rect.left - size / 2 + "px";
    circle.style.top = e.clientY - rect.top - size / 2 + "px";

    target.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
});

/*******************************
 * VIDEO DATA LOADING (with local overrides)
 *******************************/
function loadVideosData() {
    return fetch("videos.json")
        .then(response => response.json())
        .then(baseVideos => {
            const overrideRaw = localStorage.getItem("videosOverride");
            if (!overrideRaw) return baseVideos;

            try {
                const override = JSON.parse(overrideRaw);
                return override;
            } catch {
                return baseVideos;
            }
        });
}

/*******************************
 * HOMEPAGE
 *******************************/
if (document.querySelector(".video-grid")) {

    loadVideosData().then(videos => {
        const grid = document.querySelector(".video-grid");
        const searchInput = document.getElementById("searchInput");
        const categoryButtons = document.querySelectorAll(".categories button");

        function renderVideos(list) {
            grid.innerHTML = "";

            list.forEach(video => {
                const card = document.createElement("a");
                card.classList.add("video-card", "fade-in");
                card.href = `video.html?id=${video.id}`;

                card.innerHTML = `
                    <img class="thumbnail" src="${video.thumbnail}" alt="${video.title}">
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-views">${video.views} views • ${video.uploadDate}</div>
                    </div>
                `;

                grid.appendChild(card);
            });
        }

        renderVideos(videos);

        searchInput.addEventListener("input", () => {
            const term = searchInput.value.toLowerCase();

            const filtered = videos.filter(video =>
                video.title.toLowerCase().includes(term) ||
                video.channel.toLowerCase().includes(term) ||
                video.description.toLowerCase().includes(term)
            );

            renderVideos(filtered);
        });

        categoryButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                categoryButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const category = btn.dataset.category;
                let filtered = videos;

                if (category !== "all") {
                    filtered = videos.filter(video =>
                        video.category &&
                        video.category.toLowerCase() === category
                    );
                }

                const term = searchInput.value.toLowerCase();
                if (term.length > 0) {
                    filtered = filtered.filter(video =>
                        video.title.toLowerCase().includes(term) ||
                        video.channel.toLowerCase().includes(term) ||
                        video.description.toLowerCase().includes(term)
                    );
                }

                renderVideos(filtered);
            });
        });

        const sidebar = document.getElementById("sidebar");
        const openSidebar = document.getElementById("openSidebar");
        const closeSidebar = document.getElementById("closeSidebar");

        if (openSidebar && closeSidebar && sidebar) {
            openSidebar.addEventListener("click", () => {
                sidebar.classList.add("open");
            });

            closeSidebar.addEventListener("click", () => {
                sidebar.classList.remove("open");
            });
        }
    });
}

/*******************************
 * VIDEO PAGE
 *******************************/
if (document.getElementById("videoPlayer")) {

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("id");

    loadVideosData().then(videos => {
        const video = videos.find(v => v.id == videoId);
        if (!video) return;

        document.getElementById("videoPlayer").src = video.videoUrl;
        document.getElementById("videoTitle").textContent = video.title;
        document.getElementById("videoViews").textContent = video.views + " views";
        document.getElementById("videoDate").textContent = video.uploadDate;
        document.getElementById("videoChannel").textContent = video.channel;
        document.getElementById("videoDescription").textContent = video.description;
        document.getElementById("videoChannelAvatar").src = video.channelAvatar;

        const recommendedGrid = document.querySelector(".recommended-grid");

        let recommended = videos.filter(v =>
            v.category === video.category && v.id != video.id
        );

        if (recommended.length < 4) {
            const others = videos.filter(v => v.id != video.id);
            while (recommended.length < 4 && others.length > 0) {
                const randomIndex = Math.floor(Math.random() * others.length);
                recommended.push(others.splice(randomIndex, 1)[0]);
            }
        }

        recommended.forEach(rec => {
            const card = document.createElement("a");
            card.classList.add("recommended-card", "fade-in");
            card.href = `video.html?id=${rec.id}`;

            card.innerHTML = `
                <img src="${rec.thumbnail}" alt="${rec.title}">
                <div class="recommended-info">
                    <h3>${rec.title}</h3>
                    <p>${rec.views} views • ${rec.uploadDate}</p>
                </div>
            `;

            recommendedGrid.appendChild(card);
        });
    });
}
