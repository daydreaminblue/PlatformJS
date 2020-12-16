const controller = require('app/http/controllers/controller');
const Course = require('app/models/course');
const Episode = require('app/models/episode');
const fs = require('fs');
const path = require('path');
//const sharp = require('sharp');

class episodeController extends controller {
    async index(req , res) {
        try {
            let page = req.query.page || 1;
            let episodes = await Episode.paginate({} , { page , sort : { createdAt : -1 } , limit : 5 });
           
            let courseTemp;
            for(let i=0;i<episodes.docs.length;i++){
                episodes.docs[i].courseTitle = 0;
                courseTemp = await Course.findById(episodes.docs[i].course);
                if(episodes.docs[i].course !== null)
                    episodes.docs[i].courseTitle = courseTemp.title ;
                else
                    episodes.docs[i].courseTitle ='بدون مقاله';
            }
    



            res.render('admin/episodes/index',  { title : 'ویدیو ها' , episodes });
        } catch (err) {
            next(err);
        }
    }

    async create(req , res) {
        let courses = await Course.find({});
        res.render('admin/episodes/create' , { courses });        
    }

    async store(req , res , next) {
        try {
            let status = await this.validationData(req);
            if(! status) return this.back(req,res);
        
            let newEpisode = new Episode({ ...req.body });
            await newEpisode.save();


            return res.redirect('/admin/episodes');  
        } catch(err) {
            next(err);
        }
    }

    async edit(req, res ,next) {
        try {
            this.isMongoId(req.params.id);

            let episode = await Episode.findById(req.params.id);
            let courses = await Course.find({});
            if( ! episode ) this.error('چنین ویدیو ای وجود ندارد' , 404);


            return res.render('admin/episodes/edit' , { episode , courses });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res , next) {
        try {
            let status = await this.validationData(req);
            if(! status) return this.back(req,res);

            
            let episode = await Episode.findByIdAndUpdate(req.params.id , { $set : { ...req.body }})
            


            return res.redirect('/admin/episodes');
        } catch(err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let episode = await Episode.findById(req.params.id);
            if( ! episode ) this.error('چنین ویدیو ای وجود ندارد' , 404);

            let courseId = episode.course;

            // delete courses
            episode.remove();

            // course time update
            this.updateCourseTime(courseId);

            return res.redirect('/admin/episodes');
        } catch (err) {
            next(err);
        }
    }
    
}

module.exports = new episodeController();