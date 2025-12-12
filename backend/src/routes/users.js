const express = require("express")
const userController = require("../controllers/userController")
const { validate } = require("../middleware/validation")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

router.post("/register", validate("register"), userController.register);

router.post("/login", validate("login"), userController.login);

router.get("/profile", requireAuth, userController.getProfile)

router.put("/profile", requireAuth, validate("updateProfile"), userController.updateProfile)

router.put("/change-password", requireAuth, validate("changePassword"), userController.changePassword)

router.delete("/account", requireAuth, userController.deleteAccount)

router.get("/export", requireAuth, userController.exportData)

router.put("/deactivate", requireAuth, userController.deactivateAccount)

router.delete("/:userId", requireAuth, userController.deleteUser)

module.exports = router