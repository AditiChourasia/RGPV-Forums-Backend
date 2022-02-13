const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/post");
const Profile = require("../../models/profile");
const User = require("../../models/user");

// @route     POST api/posts
// @desc      add post
// @access    Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newpost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newpost.save();

      res.json(post);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

// @route     GET api/posts
// @desc      get all posts
// @access    Private

router.get("/", [auth], async (req, res) => {
  try {
    const posts = await Post.find();
    posts.sort((a, b) => b.date - a.date);
    res.json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET api/posts/:id
// @desc      get post by id
// @access    Private

router.get("/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "post not found" });
    res.json(post);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId")
      return res.status(404).json({ msg: "post not found" });
    res.status(500).send("Server Error");
  }
});

// @route     DELETE api/posts/:id
// @desc      delete post by id
// @access    Private

router.delete("/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // check on the user
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "User not authorized" });

    if (!post) return res.status(404).json({ msg: "post not found" });

    await post.remove();

    res.send({ msg: "post removed" });
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId")
      return res.status(404).json({ msg: "post not found" });
    res.status(500).send("Server Error");
  }
});

// @route     PUT api/posts/like/:id
// @desc      like a post
// @access    Private

router.put("/like/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "post not found" });

    // check on the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ msg: "post already liked" });

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId")
      return res.status(404).json({ msg: "post not found" });
    res.status(500).send("Server Error");
  }
});

// @route     PUT api/posts/unlike/:id
// @desc      like a post
// @access    Private

router.put("/unlike/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "post not found" });

    // check on the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json({ msg: "post not yet been liked" });

    const removeIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user.id
    );

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId")
      return res.status(404).json({ msg: "post not found" });
    res.status(500).send("Server Error");
  }
});

// @route     POST api/posts/comment/:id
// @desc      add comment to a post
// @access    Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newcom = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newcom);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route     DELETE api/posts/comment/:id/:comment_id
// @desc      delete a comment from the post
// @access    Private

router.delete("/uncomment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "post not found" });

    const removeIndex = post.comments.findIndex(
      (com) => com.id.toString() === req.params.comment_id
    );
    if (removeIndex === -1)
      return res.status(404).json({ msg: "comment not found" });

    if (post.comments[removeIndex].user.toString() !== req.user.id)
      return res.status(404).json({ msg: "User not authorized" });

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json({ msg: "Comment successfully deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
