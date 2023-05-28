const express = require('express')
const router = express.Router();
const controller = require("../controllers/controller");
const auth = require("../middleware/auth")
router.get("/",controller.welcomePage);
router.get("/registration",controller.createAccount);
router.post("/register", controller.registration)
router.get("/logout",auth,controller.logout);
router.post("/dashboard",controller.login);
router.get("/dashboard/:name",auth,controller.dashboard)
router.get("/myprofile",auth,controller.myprofile)
router.get("/userdetails",controller.details)
router.get("/otherProfile/:uname",auth,controller.otherdetails)
router.post("/searchProfile",auth,controller.searchProfile)
router.get("/addFriend/:uname",auth,controller.addFriend)
router.get("/revFriendReq/:uname",auth,controller.revFriendReq)
router.get("/unfriend/:uname",auth,controller.unfriend)
router.get("/accept_req/:uname",auth,controller.acceptReq)
router.get("/accepted_req/:uname",auth,controller.acceptedReq)
router.get("/decline_req/:uname",auth,controller.declineReq)
router.get("/withdraw/:uname",auth,controller.withdrawReq)
router.get("/declined/:uname",auth,controller.declinedReq)
router.get("/pending_request",auth,controller.pendingRequest)
router.get("/sent_request",auth,controller.sentRequest)
router.get("/my_friends",auth,controller.myFriends)
router.get("/otherfriends_list/:uname",auth,controller.otherFriendList)
module.exports = router;
