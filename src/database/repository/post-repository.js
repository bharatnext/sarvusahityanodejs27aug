const mongoose = require("mongoose");
const {
  PostModel,
  PostLikeModel,
  PostWishlistModel,
  MediaModel,
  CategoryModel,
  PoetModel,
} = require("../models");
const post = require("../models/post");

//Dealing with data base operations
class PostRepository {
  async CreatePost(userInputs) {
    const posts = new PostModel(userInputs);

    const postresult = await posts.save();
    return postresult;
  }
  async PostLikeAdd(userInputs) {
    const postlike = new PostLikeModel(userInputs);

    const postresult = await postlike.save();
    return postresult;
  }
  async GetPostWithLikes(userInputs) {
    var query = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          user: mongoose.Types.ObjectId(userInputs.user),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "posts",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$posts", 0],
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$result", 0],
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              reel_video_link: {
                $eq: "",
              },
            },
            {
              reel_video_link: {
                $eq: null,
              },
            },
          ],
        },
      },
      {
        $match: {
          posts: {
            $exists: true,
            $ne: [],
          },
        },
      },
    ];
    const postresult = await PostLikeModel.aggregate(query);

    // populate the author reference
    return postresult;
  }

  async GetLikePostByUserId(user, post) {
    const posts = await PostLikeModel.findOne({ user: user, post: post });
    return posts;
  }
  async GetWishlistostByUserId(user, post) {
    const posts = await PostWishlistModel.findOne({ user: user, post: post });
    return posts;
  }
  async PostWishlistAdd(userInputs) {
    const postwishlist = new PostWishlistModel(userInputs);

    const postresult = await postwishlist.save();
    return postresult;
  }
  async GetPostWithWishlists(userInputs) {
    var query = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          user: mongoose.Types.ObjectId(userInputs.user),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "posts",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$posts", 0],
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$result", 0],
              },
              "$$ROOT",
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              reel_video_link: {
                $eq: "",
              },
            },
            {
              reel_video_link: {
                $eq: null,
              },
            },
          ],
        },
      },
      {
        $match: {
          posts: {
            $exists: true,
            $ne: [],
          },
        },
      },
    ];
    const postresult = await PostWishlistModel.aggregate(query);

    // populate the author reference
    return postresult;
  }

  async GetPosts(query) {
    const templates = await PostModel.aggregate(query);
    return templates;
  }
  async SearchPosts(search, page, size, formdata) {
    search = `"${search}"`;

    var query = { $text: { $search: search } };

    if (formdata.is_reviewed_by_admin != undefined) {
      query.is_reviewed_by_admin = formdata.is_reviewed_by_admin;
    }
    if (formdata.getallposttype == "onlypostwithoutreel") {
      query.$or = [{ reel_video_link: "" }, { reel_video_link: null }];
    }
    if (formdata.getallposttype == "getonlyreels") {
      query.$and = [
        {
          reel_video_link: {
            $ne: "",
          },
        },
        {
          reel_video_link: {
            $ne: null,
          },
        },
        {
          reel_video_link: {
            $exists: true,
          },
        },
      ];
    }

    query.post_status = "Published";

    (query.score = { $meta: "textScore" }), // Add a text score for sorting
      console.log(JSON.stringify(query));
    const templates = await PostModel.find(query)
      .sort({ score: { $meta: "textScore" } })
      .skip(page)
      .limit(size);
    return templates;
  }
  async FindPostById(id) {
    const posts = await PostModel.find({ is_del: false, _id: id });
    return posts;
  }
  async UpdatePost(formdata) {
    const template = await PostModel.updateOne(
      { _id: formdata["id"] },
      { $set: formdata }
    );
    const templatedata = await PostModel.find({ _id: formdata["id"] });
    return templatedata;
  }
  async DeletePost(id) {
    var d = await PostModel.remove({ _id: id });
    return [];
  }
  async RemovePostLike(user, post) {
    var d = await PostLikeModel.remove({ user: user, post: post });
    return [];
  }
  async RemovePostWishlist(user, post) {
    var d = await PostWishlistModel.remove({ user: user, post: post });
    return [];
  }
  async NotificationGetPost() {
    var query = [
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $match: {
          $or: [
            {
              reel_video_link: {
                $eq: "",
              },
            },
            {
              reel_video_link: {
                $eq: null,
              },
            },
          ],
        },
      },
      {
        $match: {
          post_status: "Published",
          $or: [
            {
              is_sent_notification: {
                $exists: false,
              },
            },
            {
              is_sent_notification: false,
            },
          ],
        },
      },
      {
        $limit: 1,
      },
    ];
    const templates = await PostModel.aggregate(query);
    return templates;
  }
  async GetALLPOSTFORScript() {
    var query = [
      {
        $limit: 1,
      },
    ];

    const templates = await PostModel.aggregate(query);
    return templates;
  }
  async UpdatePostScript(formdata) {
    const template = await PostModel.updateOne(
      { _id: formdata["id"] },
      { $set: formdata }
    );
    console.log(template);
    return template;
  }
  async SearchForAutocomplete(search, page, size, formdata) {
    search = `"${search}"`;

    var query = { $text: { $search: search } };

    if (formdata.is_reviewed_by_admin != undefined) {
      query.is_reviewed_by_admin = formdata.is_reviewed_by_admin;
    }
    if (formdata.getallposttype == "onlypostwithoutreel") {
      query.$or = [{ reel_video_link: "" }, { reel_video_link: null }];
    }
    if (formdata.getallposttype == "getonlyreels") {
      query.$and = [
        {
          reel_video_link: {
            $ne: "",
          },
        },
        {
          reel_video_link: {
            $ne: null,
          },
        },
        {
          reel_video_link: {
            $exists: true,
          },
        },
      ];
    }

    query.post_status = "Published";

    (query.score = { $meta: "textScore" }), // Add a text score for sorting
      console.log(JSON.stringify(query));
    const projection = {
      post_slug: 1,
      post_name: 1,
      category_slug: 1,
      poet_name: 1,
    };

    const templates = await PostModel.find(query, projection)
      .sort({ score: { $meta: "textScore" } })
      .skip(page)
      .limit(size);
    return templates;
  }
  async GetALLPOSTFORScriptV2() {
    var query = [
      // {
      //   $match: {
      //     is_mediaupdate: {
      //       $exists: false,
      //     },
      //   },
      // },
      {
        $limit: 500,
      },
    ];

    const templates = await PostModel.aggregate(query);
    return templates;
  }
  async GetALLPOSTFORMediaUpdate() {
    var query = [
      // {
      //   $match: {
      //     is_mediaupdate: {
      //       $exists: false,
      //     },
      //   },
      // },
      {
        $limit: 500,
      },
    ];

    const templates = await CategoryModel.aggregate(query);
    return templates;
  }
  async UpdateMediaScript(formdata) {
    const template = await CategoryModel.updateOne(
      { _id: formdata["id"] },
      { $set: formdata }
    );
    console.log(template);
    return template;
  }

  async GetALLPOSTFORMediaUpdateV3() {
    var query = [
      // {
      //   $match: {
      //     is_mediaupdate: {
      //       $exists: false,
      //     },
      //   },
      // },
      {
        $limit: 500,
      },
    ];

    const templates = await MediaModel.aggregate(query);
    return templates;
  }
  async UpdateMediaScriptV3(formdata) {
    const template = await MediaModel.updateOne(
      { _id: formdata["id"] },
      { $set: formdata }
    );
    console.log(template);
    return template;
  }

  async GetALLPOSTFORPoetUpdateV3() {
    var query = [
      // {
      //   $match: {
      //     is_mediaupdate: {
      //       $exists: false,
      //     },
      //   },
      // },
      {
        $limit: 500,
      },
    ];

    const templates = await PoetModel.aggregate(query);
    return templates;
  }
  async UpdateMediapoetScriptV3(formdata) {
    const template = await PoetModel.updateOne(
      { _id: formdata["id"] },
      { $set: formdata }
    );
    console.log(template);
    return template;
  }
}

module.exports = PostRepository;
