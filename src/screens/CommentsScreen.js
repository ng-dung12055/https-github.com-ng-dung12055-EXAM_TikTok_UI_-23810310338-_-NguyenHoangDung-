import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COMMENTS } from '../data/comments';

const BACKGROUNDS = {
  following: require('../../assets/following.jpg'),
  foryou: require('../../assets/foryou.jpg'),
};

const DISPLAY_COMMENT_COUNTS = {
  following: 64,
  foryou: 579,
};

function countItems(list) {
  return list.reduce((total, item) => total + 1 + (item.replies?.length || 0), 0);
}

const INITIAL_THREAD_TOTAL = countItems(COMMENTS);

function formatLikes(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function LikeButton({ liked, count, onPress }) {
  return (
    <TouchableOpacity
      style={styles.likeCol}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={20}
        color={liked ? '#FF3B5C' : '#B5B5BD'}
      />
      <Text style={[styles.likeCount, liked && { color: '#FF3B5C' }]}>
        {formatLikes(count)}
      </Text>
    </TouchableOpacity>
  );
}

function ReplyItem({ reply, onToggleLike, onReply }) {
  return (
    <TouchableOpacity
      style={styles.replyRow}
      activeOpacity={1}
      onLongPress={() => onReply(reply)}
    >
      <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
      <View style={styles.replyBody}>
        <Text style={styles.commentName}>{reply.username}</Text>
        <Text style={styles.commentText}>
          {reply.text}
          <Text style={styles.inlineTime}> {reply.time}</Text>
        </Text>
      </View>
      <LikeButton
        liked={reply.likedByMe}
        count={reply.likes}
        onPress={() => onToggleLike(reply.id)}
      />
    </TouchableOpacity>
  );
}

function CommentItem({
  item,
  expanded,
  onToggleLike,
  onToggleExpand,
  onReply,
  onToggleReplyLike,
}) {
  const replyCount = item.replies?.length || 0;

  return (
    <View>
      <TouchableOpacity
        style={styles.commentRow}
        activeOpacity={1}
        onLongPress={() => onReply(item)}
      >
        <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentBody}>
          <View style={styles.nameRow}>
            <Text style={styles.commentName}>{item.username}</Text>
            {item.verified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color="#20D5EC"
                style={styles.verifiedBadge}
              />
            )}
          </View>
          <Text style={styles.commentText}>
            {item.text}
            <Text style={styles.inlineTime}> {item.time}</Text>
          </Text>
          {replyCount > 0 && (
            <TouchableOpacity
              style={styles.repliesBtn}
              onPress={() => onToggleExpand(item.id)}
            >
              <Text style={styles.repliesText}>
                {expanded ? 'Hide replies' : `View replies (${replyCount})`}
              </Text>
              <Feather
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={13}
                color="#8E8E93"
              />
            </TouchableOpacity>
          )}
        </View>
        <LikeButton
          liked={item.likedByMe}
          count={item.likes}
          onPress={() => onToggleLike(item.id)}
        />
      </TouchableOpacity>

      {expanded &&
        item.replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            onToggleLike={(replyId) => onToggleReplyLike(item.id, replyId)}
            onReply={(target) => onReply({ ...target, _parentId: item.id })}
          />
        ))}
    </View>
  );
}

function prepareComments() {
  return COMMENTS.map((comment) => ({
    ...comment,
    likedByMe: false,
    replies: (comment.replies || []).map((reply) => ({
      ...reply,
      likedByMe: false,
    })),
  }));
}

export default function CommentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const videoKey = route.params?.video || 'foryou';
  const bgSource = BACKGROUNDS[videoKey] || BACKGROUNDS.foryou;
  const baseCount =
    route.params?.commentCount ||
    DISPLAY_COMMENT_COUNTS[videoKey] ||
    INITIAL_THREAD_TOTAL;

  const inputRef = useRef(null);
  const [comments, setComments] = useState(prepareComments);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [expanded, setExpanded] = useState({});

  const currentThreadTotal = useMemo(() => countItems(comments), [comments]);
  const total = baseCount + (currentThreadTotal - INITIAL_THREAD_TOTAL);

  const toggleLike = (id) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              likedByMe: !comment.likedByMe,
              likes: comment.likes + (comment.likedByMe ? -1 : 1),
            }
          : comment
      )
    );
  };

  const toggleReplyLike = (parentId, replyId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentId
          ? {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      likedByMe: !reply.likedByMe,
                      likes: reply.likes + (reply.likedByMe ? -1 : 1),
                    }
                  : reply
              ),
            }
          : comment
      )
    );
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReply = (target) => {
    const parentId = target._parentId || target.id;
    setReplyingTo({ username: target.username, parentId });
    setExpanded((prev) => ({ ...prev, [parentId]: true }));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelReply = () => setReplyingTo(null);

  const closeSheet = () => {
    navigation.navigate('Home', {
      screen: videoKey === 'following' ? 'Following' : 'ForYou',
    });
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;

    if (replyingTo) {
      const newReply = {
        id: String(Date.now()),
        username: 'you',
        avatar: 'https://i.pravatar.cc/150?img=5',
        text,
        time: 'now',
        likes: 0,
        likedByMe: false,
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === replyingTo.parentId
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        )
      );
      setReplyingTo(null);
    } else {
      const newComment = {
        id: String(Date.now()),
        username: 'you',
        avatar: 'https://i.pravatar.cc/150?img=5',
        text,
        time: 'now',
        likes: 0,
        replies: [],
        verified: false,
        likedByMe: false,
      };

      setComments((prev) => [newComment, ...prev]);
    }

    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={bgSource}
        style={styles.videoPreview}
        resizeMode="cover"
      >
        <View style={[styles.topTabs, { marginTop: insets.top + 8 }]}>
          <Text
            style={[
              styles.topTabLabel,
              videoKey === 'following' && styles.topTabActive,
            ]}
          >
            Following
          </Text>
          <Text
            style={[
              styles.topTabLabel,
              videoKey === 'foryou' && styles.topTabActive,
            ]}
          >
            For You
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.headerSpacer} />
          <Text style={styles.sheetTitle}>{total} comments</Text>
          <TouchableOpacity onPress={closeSheet} hitSlop={8}>
            <Ionicons name="close" size={22} color="#3C3C43" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem
              item={item}
              expanded={!!expanded[item.id]}
              onToggleLike={toggleLike}
              onToggleExpand={toggleExpand}
              onReply={handleReply}
              onToggleReplyLike={toggleReplyLike}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {replyingTo && (
          <View style={styles.replyingBar}>
            <Text style={styles.replyingText}>
              Replying to{' '}
              <Text style={styles.replyingHandle}>@{replyingTo.username}</Text>
            </Text>
            <TouchableOpacity onPress={cancelReply} hitSlop={8}>
              <Ionicons name="close" size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <View style={styles.inputField}>
            <TextInput
              ref={inputRef}
              placeholder={
                replyingTo ? `Reply to @${replyingTo.username}...` : 'Add comment...'
              }
              placeholderTextColor="#A8A8AE"
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              returnKeyType="send"
            />
          </View>
          {draft.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendBtn} onPress={submit}>
              <Text style={styles.sendText}>Post</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="at" size={26} color="#2C2C2E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="happy-outline" size={26} color="#2C2C2E" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPreview: {
    flex: 3.35,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  topTabs: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  topTabLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  topTabActive: {
    color: '#fff',
    fontWeight: '700',
  },
  sheet: {
    flex: 6.65,
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 10,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 22,
    height: 22,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#29292F',
  },
  listContent: {
    paddingBottom: 6,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1D1D6',
  },
  commentBody: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  commentName: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  commentText: {
    color: '#26262B',
    fontSize: 14,
    lineHeight: 19,
  },
  inlineTime: {
    color: '#9D9DA5',
    fontSize: 13,
  },
  repliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 7,
  },
  repliesText: {
    color: '#8E8E93',
    fontSize: 13,
    marginRight: 4,
  },
  replyRow: {
    flexDirection: 'row',
    paddingLeft: 62,
    paddingRight: 16,
    paddingTop: 2,
    paddingBottom: 8,
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1D1D6',
  },
  replyBody: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 4,
  },
  likeCol: {
    alignItems: 'center',
    width: 42,
    paddingTop: 3,
  },
  likeCount: {
    color: '#A6A6AE',
    fontSize: 12,
    marginTop: 2,
  },
  replyingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F1F4',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E4E8',
  },
  replyingText: {
    color: '#52525A',
    fontSize: 13,
  },
  replyingHandle: {
    fontWeight: '700',
    color: '#2C2C2E',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E2E7',
    backgroundColor: '#fff',
  },
  inputField: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 22,
  },
  input: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 0,
  },
  inputIcon: {
    marginLeft: 16,
  },
  sendBtn: {
    marginLeft: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FF3B5C',
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
