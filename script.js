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
