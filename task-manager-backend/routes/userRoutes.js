const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the authentication middleware
const upload = require('../utils/uploadImage'); // Import the upload middleware 

// Add detailed logging for the first three routes
router.get('/manager', authMiddleware, userController.getUsersForManager);

router.get('/team-member', authMiddleware, userController.getUsersForTeamMember);

router.get('/hod', authMiddleware,userController.getUsersForHOD);




router.get('/profile', authMiddleware, userController.getUserProfile);



router.put('/password', authMiddleware, userController.updatePassword);
router.put('/profile-image', authMiddleware, upload.single('profileImage'), userController.updateProfileImage);
router.put('/profile', authMiddleware, upload.single('profile_image'), userController.updateUserProfile);



// Define routes for user operations
 router.get('/me', authMiddleware, userController.getUserById);
router.get('/', authMiddleware, userController.getAllUsers);
 router.put('/:id', authMiddleware, userController.updateUser); 
router.delete('/:id', authMiddleware, userController.deleteUser);
router.get('/:id', authMiddleware, userController.getUserById); 

module.exports = router;