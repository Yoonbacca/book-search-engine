const { User, Book } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    // Returns a User type.
    me: async (parent, args, context) => {
      const user = await User.findOne({ _id: context.user._id });
      console.log(user);
      if (user) {
        return user;
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    // Accepts an email and password as parameters; returns an Auth type.
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },
    // Accepts a username, email, and password as parameters; returns an Auth type.
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    // Accepts a book author's array, description, title, bookId, image, and link as parameters; returns a User type.
    saveBook: async (parent, { bookData }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true }
      );
      return updatedUser;
    },
    // Accepts a book's bookId as a parameter; returns a User type.
    removeBook: async (parent, { bookId }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  },
};

module.exports = resolvers;
