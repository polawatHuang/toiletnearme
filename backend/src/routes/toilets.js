const router = require('express').Router();
const { getToilets, getToilet, createToilet, updateToilet, deleteToilet, updateStatus, getStats } = require('../controllers/toiletController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/stats',        authenticate, requireAdmin, getStats);
router.get('/',             optionalAuth, getToilets);
router.get('/:id',          getToilet);
router.post('/',            authenticate, upload.single('photo'), createToilet);
router.put('/:id',          authenticate, upload.single('photo'), updateToilet);
router.delete('/:id',       authenticate, requireAdmin, deleteToilet);
router.patch('/:id/status', authenticate, requireAdmin, updateStatus);

module.exports = router;
