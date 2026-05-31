# Week 8 HTTP Request App

Expo Go mobile app for IF670 Mobile Cross-Platform Programming, Module 8:
HTTP Request with Axios.

## Module Features

- `GET /posts` to show all posts.
- `GET /posts/:id` to show selected post detail.
- `GET /users/:id` to show the post author.
- `GET /posts/:id/comments` to show comments in the detail page.
- `POST /posts` from the Add New Post form.

The API base URL is stored in `.env.local`:

```env
EXPO_PUBLIC_API_URL=https://jsonplaceholder.typicode.com
```

## Run

```bash
npm install
npm run start
```

Then scan the Expo QR code with Expo Go.

## Validate

```bash
npm run typecheck
```
