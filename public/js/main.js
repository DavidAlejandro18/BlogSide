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

function filterPost(data, token) {

    if(typeof data != "object" || !data.status || !data.orderBy || !data.limit || !data.idContainer || !token) {
        throw new Error("No hay suficientes parametros");
    }

    var config = {
        method: 'get',
        url: `/blog/getInfoPost?text=${data.text}&status=${data.status}&limit=${data.limit}&orderBy=${data.orderBy}`,
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
                    document.getElementById(`${data.idContainer}`).innerHTML = "<p>No hay post con estas especificaciones</p>";
                } else {
                    posts.forEach(post => {
                        let badgeStatus = '';

                        if(post.estado == "1") {
                            badgeStatus = `<span class="badge bg-warning text-dark">En revisión</span>`;

                            options = `
                                <li class="dropdown-item" data-id-post = "${post.uid}" data-new-status = "2" onclick = "changeStatus(this);">
                                    Aprobar
                                </li>
                                <li class="dropdown-item" data-id-post = "${post.uid}" data-new-status = "0" onclick = "changeStatus(this);">
                                    Eliminar
                                </li>
                            `;
                        } else if(post.estado == "2") {
                            badgeStatus = `<span class="badge bg-success">Aprobado</span>`;

                            options = `
                                <li class="dropdown-item" data-id-post = "${post.uid}" data-new-status = "1" onclick = "changeStatus(this);">
                                    Revisar
                                </li>
                                <li class="dropdown-item" data-id-post = "${post.uid}" data-new-status = "0" onclick = "changeStatus(this);">
                                    Eliminar
                                </li>
                            `;
                        } else if(post.estado == "0") {
                            badgeStatus = `<span class="badge bg-danger">Eliminado</span>`;
                            
                            options = `
                                <li class="dropdown-item" data-id-post = "${post.uid}" data-new-status = "2" onclick = "changeStatus(this);">
                                    Aprobar
                                </li>
                                <li class="dropdown-item" data-id-post = "${post.uid}" data-new-status = "1" onclick = "changeStatus(this);">
                                    Revisar
                                </li>
                            `;
                        }

                        htmlPost += `
                            <div class="card mb-3 card-post position-relative">
                                <a href="./blog/${post.url}" class="text-decoration-none text-dark h-100" target="blank">
                                    <div class="row g-0 h-100">
                                        <div class="col-md-3 bg-light rounded-start bg-image-card-post d-none d-md-block" style = "background-image: url('${post.baner}');"></div>
                                        <div class="col-md-9">
                                            <div class="card-body d-flex flex-column h-100">
                                                <h5 class="card-title">${post.titulo}</h5>
                                                <p class="m-0">
                                                    ${badgeStatus}
                                                </p>
                                                <p class = "mb-2 text-truncate">${post.resumen}</p>
                                                <p class="card-text mt-auto"><small class="text-muted">${prettyDate(post.createdAt)}</small></p>
                                            </div>
                                        </div>
                                    </div>
                                </a>

                                <div class = "position-absolute top-0 end-0 bg-white pt-2 pe-1 cursor-pointer">
                                    <options class = "d-flex justify-content-center align-items-center" data-bs-toggle="dropdown" style = "width: 24px;">
                                        <i class="bi bi-three-dots-vertical text-dark"></i>
                                    </options>

                                    <ul class="dropdown-menu">
                                        <li class="dropdown-item" onclick = "location.href = './edit-post/${post.uid}'">
                                            Editar
                                        </li>

                                        ${options}
                                    </ul>
                                </div>
                            </div>
                        `;
                    });

                    document.getElementById(`${data.idContainer}`).innerHTML = htmlPost;
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

function setTinyMCE(container) {
    tinymce.init({
        selector: container,
        height: 700,
        plugins: 'image lists imagetools media table link code',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | forecolor backcolor | bullist numlist outdent indent | image media link | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        entity_encoding : "raw",
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: function (cb, value, meta) {
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');

            input.onchange = function () {
                var file = this.files[0];

                var reader = new FileReader();
                reader.onload = function () {
                    var id = 'blobid' + (new Date()).getTime();
                    var blobCache = tinymce.activeEditor.editorUpload.blobCache;
                    var base64 = reader.result.split(',')[1];
                    var blobInfo = blobCache.create(id, file, base64);
                    blobCache.add(blobInfo);

                    console.log(blobInfo.blobUri());

                    /* call the callback and populate the Title field with the file name */
                    cb(blobInfo.blobUri(), { title: file.name });
                };

                reader.readAsDataURL(file);
                //reader.readAsBinaryString(file);
            };

            input.click();
        }
    });
}

function setInputTags(idInput) {
    let inputNewTag = document.getElementById(idInput);

    if(inputNewTag) {
        inputNewTag.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                let actualTags = getActualTags();
                let value = (inputNewTag.value).trim().toLowerCase(); // ELIMINAMOS LOS ESPACIOS DE ADELANTE Y ATRAS DE CADA TAG Y LO CONVERTIMOS A MINUSCULAS
                value = value.replace(/\s/g, '-');

                if(!actualTags.includes(value) && value != "") {
                    $("#tagListReady").append(`
                        <span class="badge tag rounded-pill p-0 ps-2 custom-bg-tag">
                            ${value}
                            <button class="p-1 rounded-circle border-0" onclick="this.parentNode.remove()">
                                <i class="bi bi-x-lg rounded-circle"></i>
                            </button>
                        </span>
                    `);
                }

                inputNewTag.value = "";

                // close the autocomplete menu if the user presses ENTER.
                $(this).autocomplete('close');
            }
        });

        $(inputNewTag).autocomplete({
            source: function(req, res) {
                axios.get(`/blog/getTags?termino=${req.term}`)
                    .then(function(result) {
                        res(result.data.tags);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            },
            select: function(event, ui) {
                event.preventDefault();
                let actualTags = getActualTags();
                let value = (ui.item.value).trim().toLowerCase(); // ELIMINAMOS LOS ESPACIOS DE ADELANTE Y ATRAS DE CADA TAG Y LO CONVERTIMOS A MINUSCULAS
                value = value.replace(/\s/g, '-');
                
                if(!actualTags.includes(value)) {
                    //$("#tagListReady").append(`<span class="badge tag rounded-pill custom-bg-tag">${value}</span>`);
                    $("#tagListReady").append(`
                            <span class="badge tag rounded-pill p-0 ps-2 custom-bg-tag">
                                ${value}
                                <button class="p-1 rounded-circle border-0" onclick="this.parentNode.remove()">
                                    <i class="bi bi-x-lg rounded-circle"></i>
                                </button>
                            </span>
                        `);
                }
    
                $(inputNewTag).val("");
            }
        });
    }
}

function changeStatus(option) {

    if(!option.dataset.idPost || !option.dataset.newStatus || !localStorage.getItem("token")) {
        throw new Error("No hay suficientes parametros");
    }

    let idPost = option.dataset.idPost;
    let newStatus = option.dataset.newStatus;

    let data = new FormData();
    data.append("id", idPost);
    data.append("estado", newStatus);

    let config = {
        method: 'PUT',
        url: '/blog/change-status',
        data,
        headers: {
            "x-token": localStorage.getItem("token")
        }
    };

    axios(config)
        .then(function (response) {
            
            if(response.status == 200) {
                let configSearch = {
                    text: $("#inputSearch").val(),
                    status: $("#selectStatus").val(),
                    orderBy: $("#selectOrder").val(),
                    limit: $("#selectLimit").val(),
                    idContainer: "postContainer"
                };

                filterPost(configSearch, localStorage.getItem("token"));
            }

        })
        .catch(function (error) {
            const notificationAudio = new Audio("./audio/notification.wav")
            notificationAudio.play();
            $('#notifyFail').toast('show');
            $('#msgError').text(error.response.data.msg);
        });
}

function searchPost(data) {
    if(!data.container || !data.idInput) {
        throw new Error("No hay suficientes parametros");
    }

    let container = document.getElementById(data.container);
    let input = document.getElementById(data.idInput);

    if(!container || !input) {
        throw new Error("No se encontro el contenedor o el input");
    }

    input.addEventListener("change", function() {
        let value = input.value;

        axios.get(`/blog/result?search=${value}`)
            .then(function(response) {

                if(response.status == 200) {
                    let posts = response.data.posts;
                    let cardsPost = "";

                    if(posts.length > 0) {
                        posts.forEach((post) => {
                            let tags = post.tags.map(tag => {
                                return `
                                    <span class="badge tag rounded-pill custom-bg-tag user-select-none cursor-pointer" onclick = "location.href = '/tags/${tag}'">${tag}</span>
                                `;
                            }).join("");
    
                            cardsPost += `
                                <div class="card mb-3 user-select-none">
                                    <div class="card-body">
                                        <a href = "/blog/${post.url}" class = "text-decoration-none text-dark"><h4>${post.titulo}</h4></a>
                                        <p>${tags}</p>
                                        <p>${post.resumen}</p>
                                        <small class = "text-muted">${prettyDate(post.createdAt)}</small>
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        cardsPost = `
                            <h4 class = "text-center">No hay artículos relacionados con '${value}'</h4>
                        `;
                    }
                    
                    container.innerHTML = cardsPost;
                }
            })
            .catch(function(error) {
                console.log(error);
            });
    });

    input.dispatchEvent(new Event('change'));
}