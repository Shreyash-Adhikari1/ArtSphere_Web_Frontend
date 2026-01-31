export const API = {
  USER: {
    REGISTER: "/api/user/register",
    LOGIN: "/api/user/login",
    ME: "/api/user/me",
    EDIT_ME: "/api/user/me",
    USERS_PUBLIC: "/api/user/users",
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
};
