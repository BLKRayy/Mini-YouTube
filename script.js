/*******************************
 * HOMEPAGE VIDEO LOADING + SEARCH
 *******************************/
if (document.querySelector(".video-grid")) {

    fetch("videos.json")
        .then(response => response.json())
        .then(videos => {
            const grid = document.querySelector(".video-grid");
            const searchInput = document.getElementById("searchInput");

            // Reusable function to render videos
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

            // LIVE SEARCH
            if (searchInput) {
                searchInput.addEventListener("input", () => {
                    const term = searchInput.value.toLowerCase();

                    const filtered = videos.filter(video =>
                        video.title.toLowerCase().includes(term) ||
                        video.channel.toLowerCase().includes(term) ||
                        video.description.toLowerCase().includes(term)
                    );

                    renderVideos(filtered);
                });
            }
        })
        .catch(error => console.error("Error loading videos:", error));
}


/*******************************
 * VIDEO PAGE LOADING
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

            // Fill in the video player
            document.getElementById("videoPlayer").src = video.videoUrl;

            // Fill in text fields
            document.getElementById("videoTitle").textContent = video.title;
            document.getElementById("videoViews").textContent = video.views + " views";
            document.getElementById("videoDate").textContent = video.uploadDate;
            document.getElementById("videoChannel").textContent = video.channel;
            document.getElementById("videoDescription").textContent = video.description;

            // Channel avatar
            document.getElementById("videoChannelAvatar").src = video.channelAvatar;
        })
        .catch(error => console.error("Error loading video:", error));
}
