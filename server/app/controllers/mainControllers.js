const VoteComic = require('../models/VoteComic')
const UserData = require('../models/UserDatas')

class mainControllers {
    renderHome(req,res,next) {
        let authenticated
        if(req.user) {
            authenticated = {
                username : req.user.username,
                id : req.user._id,
                linkInfor : '/user-infor',
                avt : req.user.avt
            }
        }
        getItemsType('truyen-moi',1,'danh-sach')
        .then(data => {
            const { paginationData, items } = data
            res.render('home',{ paginationData, items, authenticated})
        }).catch(err => {
            console.log(err)
        })
    }

    showList(req,res,next) {
        let type = req.params.type
        let page = req.query.page
        let authenticated
        if(req.user) {
            authenticated = {
                username : req.user.username,
                id : req.user._id,
                linkInfor : '/user-infor',
                avt : req.user.avt
            }
        }
        getItemsType(type,page,'danh-sach')
        .then(data => {
            const { paginationData, items } = data
            res.render('home',{ paginationData, items,authenticated })
        }).catch(err => {
            console.log(err)
        })
    }

    renderBlog(req,res,next) {
        res.render('blog',{layout : 'about'})
    }

    showTheLoai(req,res,next) {
        let slug = req.params.slug
        let page = req.query.page
        let authenticated
        if(req.user) {
            authenticated = {
                username : req.user.username,
                id : req.user._id,
                linkInfor : '/user-infor',
                avt : req.user.avt
            }
        }
        getItemsType(slug,page,'the-loai')
        .then(data => {
            const { paginationData, items } = data
            res.render('home',{ paginationData, items, authenticated })
        }).catch(err => {
            console.log(err)
        })
    }

    search(req,res,next) {
        let keyword = req.query.keyword
        let page = req.query.page
        let authenticated
        if(req.user) {
            authenticated = {
                username : req.user.username,
                id : req.user._id,
                linkInfor : '/user-infor',
                avt : req.user.avt
            }
        }
        getItemsSearch(keyword,page)
        .then(data => {
            const { paginationData, items } = data
            res.render('home',{ paginationData, items, authenticated })
        }).catch(err => {
            console.log(err)
        })
    }

    async showInfor(req,res,next) {
        let slug = req.query.slug
        let authenticated
        let voteComic = await VoteComic.findOne({slug : slug})
        let continueComic
        let like
        let likes = 0
        let continueData
        if(req.user) {
            authenticated = {
                username : req.user.username,
                id : req.user._id,
                linkInfor : '/user-infor',
                avt : req.user.avt
            }
            if(voteComic) {
                like = voteComic.ListUsersReact.filter(item => {return item.userId == req.user._id})
            }
            continueComic = await UserData.findOne({accout_ID : req.user._id})
            if(continueComic) {
                continueData = continueComic.historyComic.map(item=>item.toObject())
                continueData = continueData.filter(item => {return item.slug == slug})
                continueData = continueData[0]
            }
        }
        if(voteComic) likes = voteComic.heart
        getInfor(slug)
        .then((data) => {
            let {name,img,director,types,content,status,chapters,firstChap,lastChap,updateAt} = data
            res.render('infor',{name,img,director,types,content,status,chapters,firstChap,lastChap,updateAt,authenticated,slug,like,likes,continueData})
        }).catch(err => {
            console.log(err)
        })
    }

    showChap(req,res,next) {
        let slug = req.query.slug
        let id = req.query.id
        getChap(id,slug)
        .then(data => {
            res.render('comic',{
                layout : 'read',
                slug : slug,
                chapName : data.chapName,
                chapTitle : data.chapTitle,
                imgPaths : data.imgPaths,
                id : data.id,
                preLink : data.preLink,
                nextLink : data.nextLink,
                readingData : data.readingData,
            })
        }) 
        .catch(err => {
            console.log(err)
        })
    }

    showSignIn(req,res,next) {
        res.render('signin',{layout: 'signUpsignIn'})
    }
    
    showSignUp(req,res,next) {
        res.render('signup',{layout: 'signUpsignIn'})
    }

    logOut(req,res,next) {
        req.session.destroy(err => {
            if(err) console.log(err)
            res.clearCookie('connect.sid')
            res.redirect('/dangnhap')
        })
    }
}

function getItemsType(type,page,slug) {
    let api
    if(slug == 'danh-sach') api = 'https://otruyenapi.com/v1/api/danh-sach/'
    else if(slug == 'the-loai') api = 'https://otruyenapi.com/v1/api/the-loai/'
    return fetch(`${api}${type}?page=${page}`)
    .then(
        response => response.json()
    ).then(data => {
        let paginationData = data.data.params.pagination
        let items = data.data.items
        items.forEach(element => {
            let newChap
            if(element.chaptersLatest == null) newChap = 0
            else newChap = element.chaptersLatest[0].chapter_name
            element.newChap = newChap
        });
        return {paginationData,items}
    }
    ).catch(err => {
        console.log(err)
    })
}

function getItemsSearch(keyword,page) {
    return fetch(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${keyword}&page=${page}`)
    .then(
        response => response.json()
    ).then(data => {
        let paginationData = data.data.params.pagination
        let items = data.data.items
        items.forEach(element => {
            let newChap
            if(element.chaptersLatest == null) newChap = 0
            else newChap = element.chaptersLatest[0].chapter_name
            element.newChap = newChap
        });
        return {paginationData,items}
    }
    ).catch(err => {
        console.log(err)
    })
}

function getInfor(slug) {
    return fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)
    .then(
        response => response.json()
    )
    .then(data => {
        let slug = data.data.item.slug
        let updateAt = data.data.item.updatedAt
        let name = data.data.seoOnPage.seoSchema.name
        let img = data.data.seoOnPage.seoSchema.image
        let director = data.data.seoOnPage.seoSchema.director
        let types = data.data.breadCrumb.map(item => {
            return item.name
        })
        types.pop()
        let content = data.data.item.content
        let status = data.data.item.status
        let chapters = data.data.item.chapters[0].server_data
        chapters.forEach(item => {
            item.slug = slug
        })
        let firstChap = {
            link : chapters[0].chapter_api_data,
            slug : slug
        }
        let lastChap = {
            link : chapters[chapters.length - 1].chapter_api_data,
            slug : slug
        }

        return {name,img,director,types,content,status,chapters,firstChap,lastChap,updateAt}
    }
    ).catch(err => {
        console.log(err)
    })
}

async function getChap(id, slug) {
    try {
        let response = await fetch(`https://sv1.otruyencdn.com/v1/api/chapter/${id}`);

        let data = await response.json();
        let name = data.data.item.comic_name;
        name = name.replace(/ \[.+]/g,'')
        let domain = data.data.domain_cdn;
        let chapName = data.data.item.chapter_name;
        let chapTitle = data.data.item.chapter_title;
        let path = data.data.item.chapter_path;
        let imgs = data.data.item.chapter_image;
        let imgPaths = imgs.map(function(item) {
            return domain + '/' + path + '/' + item.image_file;
        });
        let img = `https://img.otruyenapi.com/uploads/comics/${slug}-thumb.jpg`
        let readingData = {name,chapName,slug,id,img}
        response = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
        data = await response.json();

        let listChap = data.data.item.chapters[0].server_data;
        let preLink = null;
        let nextLink = null;

        listChap.forEach(item => {
            if (parseInt(chapName) == parseInt(item.chapter_name) - 1) nextLink = {
                slug : slug,
                link : item.chapter_api_data
            }
            if (parseInt(chapName) == parseInt(item.chapter_name) + 1) preLink = {
                slug : slug,
                link : item.chapter_api_data
            }
        });
        return { chapName, chapTitle, imgPaths, id, preLink, nextLink, readingData};

    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = new mainControllers