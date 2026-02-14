export const API = {
  USER: {
    REGISTER: "/api/user/register",
    LOGIN: "/api/user/login",
    ME: "/api/user/me",
    EDIT_ME: "/api/user/me",
    USERS_PUBLIC: "/api/user/users",
    REQUEST_PASSWORD_RESET: "/api/user/request-password-reset",
    RESET_PASSWORD: (token: string) => `/api/user/reset-password/${token}`,
  },
  FOLLOW: {
    FOLLOW: "",
    UNFOLLOW: "",
    GET_ALL_FOLLOWERS: "api/follow/followers",
    GET_ALL_FOLLOWING: "api/follow/following",
  },
  POST: {
    CREATE: "/api/post/create",
    EDIT_POST: "/api/post/edit",
    GET_ALL: "/api/post/posts",
    GET_MY: "/api/post/posts/my-posts",
    DELETE_POST: (postId: string) => `/api/post/delete/${postId}`,
    LIKE_POST: (postId: string) => `/api/post/like/${postId}`,
    UNLIKE_POST: (postId: string) => `/api/post/unlike/${postId}`,
  },
  COMMENT: {
    CREATE: (postId: string) => `/api/comment/${postId}`,
    DELETE: (commentId: string) => `/api/comment/delete/${commentId}`,
    LIKE_COMMENT: (commentId: string) => `/api/comment/like/${commentId}`,
    UNLIKE_COMMENT: (commentId: string) => `/.api/comment/unlike/${commentId}`,
  },
  CHALLENGE: {
    CREATE: "/api/challenge/create",
    EDIT_CHALLENGE: (challengeId: string) =>
      `/api/challenge/edit/${challengeId}`,
    GET_ALL_CHALLENGES: "/api/challenge/getall",
    GET_MY_CHALLENGES: "/api/challenge/getmy",
    DELETE_CHALLENGE: (challengeId: string) =>
      `/api/challenge/delete/${challengeId}`,
    DELETE_ALL_CHALLENGES: "/api/challenge/delete/all-my-challenges",
  },
  SUBMISSION: {
    SUBMIT_EXISTING: (challengeId: string) =>
      `/api/submit/existing/${challengeId}`,
    SUBMIT_NEW: (challengeId: string) => `/api/submit/new/${challengeId}`,
    GET_SUBMISSIONS_FOR_CHALLENGE: (challengeId: string) =>
      `/api/submit/get/${challengeId}`,
    DELETE_SUBMISSION: (submissionId: string) =>
      `/api/submit/delete/${submissionId}`,
  },
  ADMIN: {
    USERS: "/api/admin/users",
    USER_BY_ID: (userId: string) => `/api/admin/users/id/${userId}`,
    USER_BY_USERNAME: (username: string) =>
      `/api/admin/users/username/${username}`,

    POSTS: "/api/admin/posts",
    POSTS_BY_USER: (userId: string) => `/api/admin/posts/user/${userId}`,
    POST_BY_ID: (postId: string) => `/api/admin/posts/post/${postId}`,
  },
};
export const UPLOADS = {
  PROFILE_IMAGE_DIR: "/uploads/profile-image",
  POST_IMAGE_DIR: "/uploads/post-images",
  CHALLENGE_IMAGE_DIR: "uploads/challenge-images",
  SUBMISSION_IMAGE_DIR: "uploads/challenge-submissions",
};
