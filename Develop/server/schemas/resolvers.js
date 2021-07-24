const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const { Book, User } = require("../models");

const resolvers = {
  Query: {
    me: async (parent, user ,context)=> {
      const foundUser = await User.findOne({
        $or: [
          { _id: context.user._id },
          { username: context.username },
        ],
      });

      if (!foundUser) {
        return res
          .status(400)
          .json({ message: "Cannot find a user with this id!" });
      }

      res.json(foundUser);
    },
    // me: async (parent, args, context) => {
    //     if (context.user) {
    //       return User.findOne({ _id: context.user._id }).populate('thoughts');
    //     }
    //     throw new AuthenticationError('You need to be logged in!');
    //   },
    },


  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        return res.status(400).json({ message: "Something is wrong!" });
      }
      const token = signToken(user);
      res.json({ token, user });
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Can't find this user" });
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        return res.status(400).json({ message: "Wrong password!" });
      }
      const token = signToken(user);
      res.json({ token, user });
    },
    saveBook: async (
      parent,
      { author, description, title, image, link },
      context
    ) => {
      console.log(user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { authors: author } },
          {
            $addToSet: {
              description,
              title,
              image,
              link,
            },
          },
          { new: true, runValidators: true }
        );
        return res.json(updatedUser);
      } catch (err) {
        console.log(err);
        return res.status(400).json(err);
      }
    },
    //MAY NEED TO UPDATE THIS CODE
    removeBook: async (parent, { bookId }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "Couldn't find user with this id!" });
      }
      return res.json(updatedUser);
    },
  },
};
module.exports = resolvers;
