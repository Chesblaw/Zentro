const User = require("../database/models/user");

const APP_NAME = "Zentro";

class UserService {
  async getUserProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      preferences: user.preferences,
      privacy: user.privacy,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserProfile(userId, updates) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      preferences: user.preferences,
      privacy: user.privacy,
      updatedAt: user.updatedAt,
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.removeAllRefreshTokens();
    await user.save();

    return true;
  }


  async deleteAccount(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const userInfo = {
    email: user.email,
    firstName: user.firstName,
  };

  await User.findByIdAndDelete(userId);

  // Placeholder instead of queue
  const emailJob = {
    templateName: "delete_account.html",
    userEmail: user.email,
    firstName: user.firstName,
    appName: APP_NAME,
    year: new Date().getFullYear().toString(),
    subject: "Account Deleted",
  };

  console.log("Queue not implemented. Email job:", emailJob);

  return true;
}

  async exportUserData(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      personalInformation: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      preferences: user.preferences,
      privacy: user.privacy,
      accountInformation: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      },
    };
  }

  async deactivateAccount(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    await user.removeAllRefreshTokens();
    return true;
  }
}

module.exports = new UserService();