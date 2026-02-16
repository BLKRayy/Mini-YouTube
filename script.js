// Load videos from videos.json and display them on the homepage
fetch("videos.json")
    .then(response => response.json())
    .then(videos => {
        const grid = document.querySelector(".video-grid");

        videos.forEach(video => {
            // Create the video card container
            const card = document.createElement("a");
            card.classList.add("video-card");
            card.href = `video.html?id=${video.id}`;

            // Build the inner HTML
            card.innerHTML = `
                <img class="thumbnail" src="${video.thumbnail}" alt="${video.title}">
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-views">${video.views} views</div>
                </div>
            `;

            // Add card to the grid
            grid.appendChild(card);
        });
    })
    .catch(error => console.error("Error loading videos:", error));
// Get the ?id= parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("id");

// Fetch videos.json and load the correct video
fetch("videos.json")
    .then(response => response.json())
    .then(videos => {
        const video = videos.find(v => v.id == videoId);

        if (!video) {
            console.error("Video not found");
            return;
        }

        // Fill in the video player
        const player = document.getElementById("videoPlayer");
        player.src = video.videoUrl;

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
