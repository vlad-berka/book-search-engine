const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    
  Query: {

    users: async () => {
      return User.find();
    },

    user: async (parent, { userId }) => {
      const user = await User.findOne({ _id: userId });

      if(user){
        return user;
      } else {
        return res.status(404).json({message: `404, user with ID: ${userId} not found`});
      }
    },
    
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
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
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, {authors, description, title, bookId, image, link, userId}, context) => {
        if(!context.user) {
            throw new AuthenticationError('You need to be logged in!');

        } else {
            return User.findOneAndUpdate(
                { _id: userId },
                { $addToSet: {savedBooks: {authors, description, title, bookId, image, link}} },
                { new: true }    
            );
        }
    },

    removeBook: async (parent, {bookId, userId}, context) => {
        if(!context.user) {
            throw new AuthenticationError('You need to be logged in!');

        } else {
            return User.findOneAndUpdate(
                { _id: userId },
                { $pull: {savedBooks: {bookId}} },
                { new: true }    
            );
        }
    }

  },
};

module.exports = resolvers;
