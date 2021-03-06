const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load Profile Model
const Profile = require("../../models/Profile");

// Load User Profile Model
const User = require("../../models/User");

// @route    GET api/profile/test
// @desc     Test profile route
// @access   Public
router.get("/test", (req, res) => {
  res.json({ message: "Profile works!" });
});

// @route    GET api/profile
// @desc     Get current users profile
// @access   Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => {
        res.status(404).json(404);
      });
  }
);

// @route    GET api/profile/all
// @desc     Get app profiles
// @access   Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json();
      }

      res.json(profiles);
    })
    .catch(err => {
      return res.status(404).json({ profile: 'There are no profiles' });
    });
});

// @route    GET api/profile/handle/:handle
// @desc     Get profile by handle
// @access   Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ profile: "There is no profile for this user" });
    });
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => {
      res.status(404).json({ profile: "There is no profile for this user" });
    });
});

// @route    POST api/profile
// @desc     Create or edit user profile
// @access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validationn
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    const fields = [
      "handle",
      "company",
      "website",
      "location",
      "bio",
      "status",
      "githubusername"
    ];
    fields.forEach(item => {
      if (req.body[item]) {
        profileFields[item] = req.body[item];
      }
    });

    // Skills - Split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //Social
    profileFields.social = {};
    const socialPages = [
      "youtube",
      "facebook",
      "twitter",
      "linkedin",
      "instagram"
    ];
    socialPages.forEach(item => {
      if (req.body[item]) {
        profileFields.social[item] = req.body[item];
      }
    });

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
          .then(profile => res.json(profile))
          .catch(err => console.log("ERR", err));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save profile
          var newProfile = new Profile(profileFields);
          newProfile.save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route    POST api/profile/experience
// @desc     Add experience to profile
// @access   Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  //Check validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      // And to experience array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    })
});


// @route    POST api/profile/eduation
// @desc     Add education to profile
// @access   Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  //Check validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      // And to education array
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    })
});



// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

      // Splice out of array
      profile.experience.splice(removeIndex, 1)
      profile.save().then(updatedProfile => res.json(profile));
    })
    .catch(err => {
      res.status(404).json(err);
    })
});


// @route    DELETE api/profile/education/:edu_id
// @desc     Delete edutation from profile
// @access   Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

      // Splice out of array
      profile.education.splice(removeIndex, 1)
      profile.save().then(updatedProfile => res.json(profile));
    })
    .catch(err => {
      res.status(404).json(err);
    })
});

// @route    DELETE api/profile
// @desc     Delete user and profile
// @access   Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => {
          res.json({ success: true})
        })
    })
});

module.exports = router;
