import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import {
  Comment,
  getComments,
  getPostDetail,
  getPosts,
  getUser,
  NewPostPayload,
  postData,
  Post,
  User
} from "./services/api";

type Screen =
  | { name: "home" }
  | { name: "detail"; postId: number }
  | { name: "newPost" };

const INITIAL_NEW_POST: NewPostPayload = {
  userId: 1,
  title: "",
  body: ""
};

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);

  async function loadPosts(showRefresh = false) {
    try {
      setHomeError(null);
      showRefresh ? setRefreshing(true) : setLoadingPosts(true);
      const nextPosts = await getPosts();
      setPosts(nextPosts);
    } catch {
      setHomeError("Unable to load posts. Please check your connection and try again.");
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function handleCreatePost(payload: NewPostPayload) {
    const createdPost = await postData(payload);
    setPosts((currentPosts) => [
      {
        ...createdPost,
        id: createdPost.id ?? Date.now()
      },
      ...currentPosts
    ]);
    setScreen({ name: "home" });
    Alert.alert("Post created", "JSONPlaceholder accepted the POST request.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      {screen.name === "home" ? (
        <HomeScreen
          error={homeError}
          loading={loadingPosts}
          posts={posts}
          refreshing={refreshing}
          onAddPress={() => setScreen({ name: "newPost" })}
          onPostPress={(postId) => setScreen({ name: "detail", postId })}
          onRefresh={() => void loadPosts(true)}
          onRetry={() => void loadPosts()}
        />
      ) : null}

      {screen.name === "detail" ? (
        <PostDetailScreen
          postId={screen.postId}
          onBack={() => setScreen({ name: "home" })}
        />
      ) : null}

      {screen.name === "newPost" ? (
        <NewPostScreen
          onCancel={() => setScreen({ name: "home" })}
          onSubmit={handleCreatePost}
        />
      ) : null}
    </SafeAreaView>
  );
}

function HomeScreen({
  error,
  loading,
  posts,
  refreshing,
  onAddPress,
  onPostPress,
  onRefresh,
  onRetry
}: {
  error: string | null;
  loading: boolean;
  posts: Post[];
  refreshing: boolean;
  onAddPress: () => void;
  onPostPress: (postId: number) => void;
  onRefresh: () => void;
  onRetry: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>IF670 • Module 8</Text>
        <Text style={styles.title}>HTTP Request Lab</Text>
        <Text style={styles.subtitle}>
          Practice GET and POST requests with Axios using JSONPlaceholder.
        </Text>
        <Pressable style={styles.primaryButton} onPress={onAddPress}>
          <Text style={styles.primaryButtonText}>Add New Post</Text>
        </Pressable>
      </View>

      {loading ? (
        <LoadingState label="Fetching posts with Axios..." />
      ) : null}

      {!loading && error ? (
        <MessageState
          label={error}
          actionLabel="Try Again"
          onActionPress={onRetry}
        />
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed ? styles.cardPressed : null
              ]}
              onPress={() => onPostPress(item.id)}
            >
              <View style={styles.cardTopline}>
                <Text style={styles.cardNumber}>#{index + 1}</Text>
                <Text style={styles.userBadge}>User {item.userId}</Text>
              </View>
              <Text style={styles.cardTitle}>{sentenceCase(item.title)}</Text>
              <Text numberOfLines={3} style={styles.cardBody}>
                {sentenceCase(item.body)}
              </Text>
              <Text style={styles.cardAction}>View detail and comments</Text>
            </Pressable>
          )}
        />
      ) : null}
    </View>
  );
}

function PostDetailScreen({
  postId,
  onBack
}: {
  postId: number;
  onBack: () => void;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDetail() {
    try {
      setLoading(true);
      setError(null);
      const nextPost = await getPostDetail(postId);
      const [nextUser, nextComments] = await Promise.all([
        getUser(nextPost.userId),
        getComments(postId)
      ]);
      setPost(nextPost);
      setUser(nextUser);
      setComments(nextComments);
    } catch {
      setError("Unable to load the post detail. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
  }, [postId]);

  return (
    <View style={styles.screen}>
      <Header title="Post Detail" onBack={onBack} />

      {loading ? <LoadingState label="Loading post, author, and comments..." /> : null}

      {!loading && error ? (
        <MessageState label={error} actionLabel="Reload" onActionPress={() => void loadDetail()} />
      ) : null}

      {!loading && !error && post && user ? (
        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={styles.detailCard}>
            <Text style={styles.kicker}>GET /posts/{post.id}</Text>
            <Text style={styles.detailTitle}>{sentenceCase(post.title)}</Text>
            <Text style={styles.detailBody}>{sentenceCase(post.body)}</Text>
          </View>

          <View style={styles.authorCard}>
            <Text style={styles.sectionTitle}>Author</Text>
            <Text style={styles.authorName}>{user.name}</Text>
            <Text style={styles.mutedText}>@{user.username} • {user.email}</Text>
            <Text style={styles.mutedText}>{user.phone}</Text>
            <Text style={styles.mutedText}>{user.website}</Text>
          </View>

          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentName}>{sentenceCase(comment.name)}</Text>
              <Text style={styles.commentEmail}>{comment.email}</Text>
              <Text style={styles.commentBody}>{sentenceCase(comment.body)}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function NewPostScreen({
  onCancel,
  onSubmit
}: {
  onCancel: () => void;
  onSubmit: (payload: NewPostPayload) => Promise<void>;
}) {
  const [form, setForm] = useState(INITIAL_NEW_POST);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert("Almost there", "Please fill in both the title and body.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...form,
        title: form.title.trim(),
        body: form.body.trim()
      });
    } catch {
      Alert.alert("Request failed", "The POST request could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.screen}
    >
      <Header title="Add New Post" onBack={onCancel} />
      <ScrollView contentContainerStyle={styles.formContent}>
        <Text style={styles.formIntro}>
          This form calls POST /posts through the same Axios service used by the
          list and detail screens.
        </Text>

        <Text style={styles.label}>User ID</Text>
        <TextInput
          keyboardType="number-pad"
          value={String(form.userId)}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              userId: Number.parseInt(value, 10) || 1
            }))
          }
          style={styles.input}
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={form.title}
          onChangeText={(title) => setForm((current) => ({ ...current, title }))}
          placeholder="Write a clear post title"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Body</Text>
        <TextInput
          multiline
          value={form.body}
          onChangeText={(body) => setForm((current) => ({ ...current, body }))}
          placeholder="What should this post say?"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.formActions}>
          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            disabled={submitting}
            style={[styles.primaryButton, submitting ? styles.disabledButton : null]}
            onPress={() => void handleSubmit()}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? "Submitting..." : "Submit Post"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Header({
  title,
  onBack
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator color={colors.ink} size="large" />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

function MessageState({
  label,
  actionLabel,
  onActionPress
}: {
  label: string;
  actionLabel: string;
  onActionPress: () => void;
}) {
  return (
    <View style={styles.centerState}>
      <Text style={styles.stateText}>{label}</Text>
      <Pressable style={styles.secondaryButton} onPress={onActionPress}>
        <Text style={styles.secondaryButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const colors = {
  canvas: "#F8F3EA",
  ink: "#1F2933",
  clay: "#B85C38",
  gold: "#E3A72F",
  moss: "#5F6F52",
  card: "#FFFDF8",
  line: "#E8DDCA",
  muted: "#7D7468"
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  screen: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  hero: {
    margin: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  title: {
    marginTop: 10,
    color: colors.card,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 39
  },
  subtitle: {
    marginTop: 10,
    color: "#F3E8D6",
    fontSize: 15,
    lineHeight: 22
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: colors.clay
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 15,
    fontWeight: "800"
  },
  disabledButton: {
    opacity: 0.58
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 26
  },
  card: {
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    backgroundColor: colors.card
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.86
  },
  cardTopline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardNumber: {
    color: colors.clay,
    fontSize: 13,
    fontWeight: "900"
  },
  userBadge: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EDF0E7",
    color: colors.moss,
    fontSize: 12,
    fontWeight: "800"
  },
  cardTitle: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24
  },
  cardBody: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  cardAction: {
    marginTop: 14,
    color: colors.clay,
    fontSize: 13,
    fontWeight: "900"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#EFE5D4"
  },
  backButtonText: {
    color: colors.ink,
    fontWeight: "900"
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  headerSpacer: {
    width: 60
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 28
  },
  stateText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  },
  detailContent: {
    padding: 18,
    paddingBottom: 30
  },
  detailCard: {
    padding: 22,
    borderRadius: 28,
    backgroundColor: colors.ink
  },
  detailTitle: {
    marginTop: 12,
    color: colors.card,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34
  },
  detailBody: {
    marginTop: 12,
    color: "#F3E8D6",
    fontSize: 16,
    lineHeight: 24
  },
  authorCard: {
    marginTop: 16,
    marginBottom: 22,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#EDF0E7"
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  authorName: {
    color: colors.moss,
    fontSize: 20,
    fontWeight: "900"
  },
  mutedText: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 14
  },
  commentCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    backgroundColor: colors.card
  },
  commentName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  commentEmail: {
    marginTop: 4,
    color: colors.clay,
    fontSize: 12,
    fontWeight: "800"
  },
  commentBody: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  formContent: {
    padding: 18,
    paddingBottom: 30
  },
  formIntro: {
    marginBottom: 20,
    padding: 18,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#EDF0E7",
    color: colors.moss,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700"
  },
  label: {
    marginBottom: 8,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  input: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.card,
    color: colors.ink,
    fontSize: 16
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top"
  },
  formActions: {
    flexDirection: "row",
    gap: 12
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.card
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  }
});
