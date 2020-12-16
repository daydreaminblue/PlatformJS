const express = require('express');
const router = express.Router();

// Controllers
const homeController = require('app/http/controllers/homeController');
const courseController = require('app/http/controllers/courseController');
const categoryController = require('app/http/controllers/categoryController');

router.get('/logout' , (req ,res) => {
    req.logout();
    res.redirect('/');
});

// Home Routes
router.get('/' , homeController.index);
router.get('/about-us' , homeController.about);
router.get('/search' , courseController.search);
router.get('/teacher' , homeController.teacher);
router.get('/teacher/:id' , homeController.teacherReq);
router.get('/allcourses' , courseController.allCourses);
router.get('/categories/:category' , categoryController.index);
router.get('/courses/:course' , courseController.single);
router.get('/mostViewedCourses' , courseController.mostViewedCourses);

// Home Routes
router.get('/' , homeController.index);
router.post('/courses/:courseId' , courseController.orderCourse);
router.get('/cart' , courseController.showCart);
router.delete('/cart/:id' , homeController.orderDestroy);




module.exports = router;