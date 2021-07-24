const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const { Book, User} = require('../models');


const resolvers = {
    Query: {
        async getSingleUser({ user = null, params }, res) {
            const foundUser = await User.findOne({
              $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
            });
        
            if (!foundUser) {
              return res.status(400).json({ message: 'Cannot find a user with this id!' });
            }
        
            res.json(foundUser);
          },  
    },

Mutation: {
  
createUser: async (parent,{username, email, password})=> {
    const user = await User.create({username, email, password});

    if (!user) {
      return res.status(400).json({ message: 'Something is wrong!' });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
   login: async (parent, {email,password})=> {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(password);

    if (!correctPw) {
      return res.status(400).json({ message: 'Wrong password!' });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
  saveBook: async (parent,{author,description,title,image,link}) => {
    console.log(user);
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );
      return res.json(updatedUser);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  },
  async deleteBook({ user, params }, res) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { savedBooks: { bookId: params.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser);
  },
}
}
module.exports = resolvers;