export type UserProfile = {
  _id: string;
  username: string;
  email: string;
  followers: string[];
  following: string[];
  profilePicture?: string;
};

export type UserProps = {
  currentUser: UserProfile;
};

export type AppProps = {
  user: UserProps;
};

export type TweetProps = {
  _id: string;
  userId: string;
  description: string;
  likes: string[]; // Assuming these are user IDs who liked the tweet
  createdAt: Date;
  updatedAt: Date;
  imgUrl?: string;
};
