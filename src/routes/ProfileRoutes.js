const express = require('express');
const router = express.Router();
const { ProfileController, upload } = require('../controller/ProfileController');
const { authMiddleware, isAlumni } = require('../middleware/Auth');
const { validateProfile, checkValidation } = require('../middleware/validation');

router.use(authMiddleware);

router.get('/me', ProfileController.getProfile);
router.put('/me', validateProfile, checkValidation, ProfileController.updateProfile);
router.post('/me/image', isAlumni, upload.single('profileImage'), ProfileController.uploadProfileImage);
router.post('/me/education', isAlumni, ProfileController.addEducation);
router.delete('/me/education/:educationId', isAlumni, ProfileController.deleteEducation);
router.get('/search', ProfileController.searchProfiles);
router.get('/:userId', ProfileController.getProfile);

module.exports = router;