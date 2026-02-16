/*******************************
 * HOMEPAGE: VIDEO LOADING + SEARCH + CATEGORIES
 *******************************/
if (document.querySelector(".video-grid")) {

    fetch("videos.json")
        .then(response => response.json())
        .then(videos => {
            const grid = document.querySelector(".video-grid");
            const searchInput = document.getElementById("searchInput");
            const categoryButtons = document.querySelectorAll(".categories button");

            /*******************************
             * RENDER VIDEOS (Reusable)
             *******************************/
            function renderVideos(list) {
                grid.innerHTML = "";

                list.forEach(video => {
                    const card = document.createElement("a");
                    card.classList.add("video-card");
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

            // Initial render
            renderVideos(videos);

            /*******************************
             * LIVE SEARCH
             *******************************/
            searchInput.addEventListener("input", () => {
                const term = searchInput.value.toLowerCase();

                const filtered = videos.filter(video =>
                    video.title.toLowerCase().includes(term) ||
                    video.channel.toLowerCase().includes(term) ||
                    video.description.toLowerCase().includes(term)
                );

                renderVideos(filtered);
            });

            /*******************************
             * CATEGORY FILTERING
             *******************************/
            categoryButtons.forEach(btn => {
                btn.addEventListener("click", () => {

                    // Update active button
                    categoryButtons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    const category = btn.dataset.category;

                    let filtered = videos;

                    // Filter by category
                    if (category !== "all") {
                        filtered = videos.filter(video =>
                            video.category &&
                            video.category.toLowerCase() === category
                        );
                    }

                    // Apply search term too
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
        })
        .catch(error => console.error("Error loading videos:", error));
}



/*******************************
 * VIDEO PAGE: LOAD SELECTED VIDEO + RECOMMENDED VIDEOS
 *******************************/
if (document.getElementById("videoPlayer")) {

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("id");

    fetch("videos.json")
        .then(response => response.json())
        .then(videos => {
            const video = videos.find(v => v.id == videoId);

            if (!video) {
                console.error("Video not found");
                return;
            }

            /*******************************
             * LOAD MAIN VIDEO
             *******************************/
            document.getElementById("videoPlayer").src = video.videoUrl;
            document.getElementById("videoTitle").textContent = video.title;
            document.getElementById("videoViews").textContent = video.views + " views";
            document.getElementById("videoDate").textContent = video.uploadDate;
            document.getElementById("videoChannel").textContent = video.channel;
            document.getElementById("videoDescription").textContent = video.description;
            document.getElementById("videoChannelAvatar").src = video.channelAvatar;

            /*******************************
             * RECOMMENDED VIDEOS
             *******************************/
            const recommendedGrid = document.querySelector(".recommended-grid");

            // Filter by same category
            let recommended = videos.filter(v =>
                v.category === video.category && v.id != video.id
            );

            // If not enough, fill with random videos
            if (recommended.length < 4) {
                const others = videos.filter(v => v.id != video.id);
                while (recommended.length < 4 && others.length > 0) {
                    const randomIndex = Math.floor(Math.random() * others.length);
                    recommended.push(others.splice(randomIndex, 1)[0]);
                }
            }

            // Render recommended videos
            recommended.forEach(rec => {
                const card = document.createElement("a");
                card.classList.add("recommended-card");
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
        })
        .catch(error => console.error("Error loading video:", error));
}
