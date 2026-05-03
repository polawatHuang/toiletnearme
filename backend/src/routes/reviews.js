const router = require('express').Router();
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/',     optionalAuth, getReviews);
router.post('/',    authenticate, createReview);
router.put('/:id',  authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
