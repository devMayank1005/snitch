import crypto from "crypto";
import { UserModel } from "../models/user.model.js";

export const resolveGoogleUser = async (profile) => {
  const email = profile?.emails?.[0]?.value;

  if (!email) {
    throw new Error("Google account does not provide an email");
  }

  let user = await UserModel.findOne({ email });

  if (!user) {
    user = await UserModel.create({
      email,
      contact: `google-${profile.id}`,
      password: crypto.randomBytes(32).toString("hex"),
      fullName: profile.displayName || email.split("@")[0],
      role: "buyer",
      emailVerified: true,
    });
  } else if (!user.emailVerified) {
    user.emailVerified = true;
    await user.save();
  }

  return user;
};

export const handleGoogleOAuthProfile = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    const user = await resolveGoogleUser(profile);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
};
