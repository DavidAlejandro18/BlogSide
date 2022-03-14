function prettyDate(value) {
    let date = new Date(value);

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getHours(); 
    let minutes = date.getMinutes();

    let date_format = `${day}/${month}/${year}`;
    let time_format = `${hours}:${minutes}`;

    return `${date_format} a las ${time_format} horas`;
}

function filterPost(status, orderBy, limit, idContainer, token) {
    var config = {
        method: 'get',
        url: `http://localhost:4000/blog/getInfoPost?status=${status}&limit=${limit}&orderBy=${orderBy}`,
        headers: { 
            'x-token': token,
        }
    };

    axios(config)
        .then(function (response) {
            
            if(response.status == 200) {
                let total = response.data.total;
                let posts = response.data.posts;

                let htmlPost = '';

                if(total == 0) {
                    document.getElementById(`${idContainer}`).innerHTML = "<p>No hay post con estas especificaciones</p>";
                } else {
                    posts.forEach(post => {
                        let badgeStatus = '';

                        if(post.estado == "1") {
                            badgeStatus = `<span class="badge bg-warning text-dark">En revisión</span>`;
                        } else if(post.estado == "2") {
                            badgeStatus = `<span class="badge bg-success">Aprobado</span>`;
                        } else if(post.estado == "0") {
                            badgeStatus = `<span class="badge bg-danger">Eliminado</span>`;
                        }

                        htmlPost += `
                            <div class="card mb-3 card-post">
                                <a href="./blog/${post.url}" class="text-decoration-none text-dark" target="blank">
                                    <div class="row g-0">
                                        <div class="col-md-4 bg-light rounded-start bg-image-card-post" style = "background-image: url('${post.baner}');"></div>
                                        <div class="col-md-8">
                                            <div class="card-body">
                                                <h5 class="card-title">${post.titulo}</h5>
                                                <p class="card-text">
                                                    ${badgeStatus}
                                                </p>
                                                <p>Escrito por: ${post.creadoPor.username}</p>
                                                <p class="card-text"><small class="text-muted">${prettyDate(post.createdAt)}</small></p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                    });

                    document.getElementById(`${idContainer}`).innerHTML = htmlPost;
                }

            }

        })
        .catch(function (error) {
            console.log(error);
        });
}

function getActualTags() {
    let actualTags = document.querySelectorAll("#tagListReady span");
    let tags = [];

    actualTags.forEach(tag => {
        let value = tag.innerText.trim();
        if(value != "") {
            tags.push(value);
        }
    });

    return tags;
}