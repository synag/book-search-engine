const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const { User } = require("../models");

const resolvers = {
  Query: {
    me: async (parent, args ,context)=> {
      if (context.user) {
        return User.findOne({ _id: context.user._id })
//       const foundUser = await User.findOne(
//         // $or: [
//           { _id: context.user._id }
//           // { username: context.username },
//         // ],
//       );
// console.log(foundUser)
//       if (!foundUser) {
//         throw new AuthenticationError('Cannot find a user with this id!');
        
//       }
//       return foundUser;
     
   
      }
    },

  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
      
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Wrong password');
  

      }
      const token = signToken(user);
      return ({ token, user });
    },
    saveBook: async ( parent, { input }, context ) => {
     
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: input }
          },
          { new: true, runValidators: true }
        );
        return updatedUser

      } catch (err) {
        console.log(err);
        return err;
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
        throw new AuthenticationError("Couldn't find user with this id!")
      
      };
      return updatedUser;
    },
  },
};
module.exports = resolvers;
