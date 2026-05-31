import axios from "axios";

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
};

export type Comment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

export type NewPostPayload = {
  userId: number;
  title: string;
  body: string;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://jsonplaceholder.typicode.com",
  timeout: 10000
});

export async function getPosts(): Promise<Post[]> {
  const response = await api.get<Post[]>("/posts");
  return response.data;
}

export async function getPostDetail(postId: number): Promise<Post> {
  const response = await api.get<Post>(`/posts/${postId}`);
  return response.data;
}

export async function getUser(userId: number): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
}

export async function getComments(postId: number): Promise<Comment[]> {
  const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
  return response.data;
}

export async function postData(payload: NewPostPayload): Promise<Post> {
  const response = await api.post<Post>("/posts", payload);
  return response.data;
}
