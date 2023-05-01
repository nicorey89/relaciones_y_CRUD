const db = require('../database/models');
const sequelize = db.sequelize;
const { validationResult } = require("express-validator");

//Otra forma de llamar a los modelos
const Movies = db.Movie;
const Genres = db.Genre;

const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: [{association: "actors"}]
        })
        .then(movies => {
            res.render('moviesList.ejs', {movies})
        })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id, {
            include: [{association: "actors"}, {association: "genre"}]
        })
        .then(movie => {
            res.render('moviesDetail.ejs', {movie});
        });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
        .then(movies => {
            res.render('newestMovies', {movies});
        });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    }, //Aqui debemos modificar y completar lo necesario para trabajar con el CRUD
    add: function (req, res) {
        db.Genre.findAll()
        .then(genres => {
            return res.render("moviesAdd", {genres}) 
        })
        .catch(error => console.log(error))
    },
    create: function (req, res) {
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const {
                title,
                awards,
                release_date,
                length,
                rating,
                genre_id
            } = req.body ;

            Movies.create({
                title ,
                awards,
                release_date,
                length,
                rating,
                genre_id
            })
            .then((response) => {
                if(response){
                    return res.redirect("/movies")
                }
            })
        }else{
            Movies.then(Movie => {
                return res.render("moviesAdd", {
                    Movie,
                    errors: errors.mapped(), 
                })
            })    
            .catch(error => console.log(error))
        }
    },
    edit: function (req, res) {
        const MOVIE_PROMISE = Movies.findByPk(req.params.id);
        const GENRES_PROMISE = Genres.findAll();
        Promise.all([MOVIE_PROMISE, GENRES_PROMISE])
              .then(([Movie, Genres]) => {
                    res.render("moviesEdit", { Movie, Genres });
              })
              .catch((error) => console.log(error));
  },
    update: function (req,res) {
        const errors = validationResult(req);
        const MOVIE_ID = req.params.id;
        if(errors.isEmpty()){
           
            const {
                title,
                awards,
                release_date,
                length,
                rating,
                genre_id,
            } = req.body ;

            Movies.update({
                title,
                awards,
                release_date,
                length,
                rating,
                genre_id,
            },{
                where:{
                    id: MOVIE_ID
                }
            })
            .then((response) => {
                if(response){
                    return res.redirect(`/movies/detail/${MOVIE_ID}`)
                }else{
                    throw new Error(
                        "mensaje de error"
                    )
                }
            })
        }else{
            Movies.findByPk(MOVIE_ID)
            .then(Movie => {
                return res.render("moviesEdit", {
                    Movie,
                    errors: errors.mapped(), 
                })
            })
            .catch(error => console.log(error))
        }
    },
    delete: function (req, res) {
        const MOVIE_ID = req.params.id;
        Movies.findByPk(MOVIE_ID)
        .then(movieToDelete => {
            return res.render("moviesDelete", 
            {Movie: movieToDelete}
            )
        })
        .catch(error => console.log(error))
    },
    destroy: function (req, res) {
        const MOVIE_ID = req.params.id;
        Movies.destroy({
            where:{
                id: MOVIE_ID
            }
        })
        .then(() => {
            return res.redirect("/movies");
        })
        .catch(error => console.log(error))
    }

}

module.exports = moviesController;